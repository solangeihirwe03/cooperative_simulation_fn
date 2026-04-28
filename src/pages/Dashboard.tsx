import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, FileText, Wallet, Banknote, ArrowRight, Building, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { adminApi, policiesApi, type AdminMember, type Policy, type MemberContributionSummary, type MemberLoan } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MemberDetailDialog from "@/components/MemberDetailDialog";

const PIE_COLORS: Record<string, string> = {
  active: "hsl(205 85% 50%)",
  approved: "hsl(145 65% 45%)",
  pending: "hsl(38 92% 55%)",
  rejected: "hsl(0 72% 55%)",
  completed: "hsl(260 60% 55%)",
  defaulted: "hsl(15 80% 50%)",
};

const fallbackColor = "hsl(213 15% 60%)";

const loanStatusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  approved: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-success/10 text-success",
  defaulted: "bg-destructive/10 text-destructive",
};

const statusVariant: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  inactive: "bg-muted text-muted-foreground border-border",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loans, setLoans] = useState<MemberLoan[]>([]);
  const [contributions, setContributions] = useState<MemberContributionSummary[]>([]);
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchMembers = useCallback(() => {
    adminApi.getMembers().then(setMembers).catch(() => {});
  }, []);

  useEffect(() => {
    fetchMembers();
    policiesApi.getAll().then(setPolicies).catch(() => {});
    adminApi.getAllLoans().then(setLoans).catch(() => {});
    adminApi.getAllContributions().then(setContributions).catch(() => {});
  }, [fetchMembers]);

  const totalMembers = members.length;
  const cooperativeName = members[0]?.cooperative?.cooperative_name || user?.cooperative?.cooperative_name || "—";
  const activeMembers = members.filter((m) => m.member_status === "active").length;
  const activePolicies = policies.filter((p) => p.is_active).length;
  const activeLoans = loans.filter((l) => ["active", "approved"].includes(l.loan_status)).length;
  const totalContributions = contributions.reduce((sum, c) => sum + (c.total_contribution || 0), 0);
  const formatRWF = (n: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

  // Loans issued per month (last 6 months)
  const barData = (() => {
    const months: { key: string; name: string; loans: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: d.toLocaleString("en-US", { month: "short" }),
        loans: 0,
      });
    }
    loans.forEach((l) => {
      if (!l.issue_date) return;
      const d = new Date(l.issue_date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find((x) => x.key === key);
      if (m) m.loans += 1;
    });
    return months;
  })();

  // Loan status distribution
  const pieData = Object.entries(
    loans.reduce<Record<string, number>>((acc, l) => {
      const k = (l.loan_status || "unknown").toLowerCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Recent loans (latest 5 by issue_date)
  const recentLoans = [...loans]
    .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime())
    .slice(0, 5);
  const memberName = (id: number) => {
    const m = members.find((x) => x.member_id === id);
    return m ? `${m.first_name} ${m.last_name}` : `Member #${id}`;
  };

  const handleViewMember = (member: AdminMember) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  return (
  <DashboardLayout>
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Cooperative simulation overview</p>
        </div>
          <div className="flex items-center gap-2 px-4 py-2 glass-elevated rounded-lg">
            <Building className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{cooperativeName}</span>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Members"
          value={totalMembers.toLocaleString()}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: `${activeMembers} active`, positive: true }}
        />
        <StatCard
          title="Active Policies"
          value={activePolicies.toLocaleString()}
          icon={<FileText className="w-6 h-6" />}
          trend={{ value: `${policies.length} total`, positive: true }}
        />
        <StatCard
          title="Active Loans"
          value={activeLoans.toLocaleString()}
          icon={<Banknote className="w-6 h-6" />}
          trend={{ value: `${loans.length} total`, positive: true }}
        />
        <StatCard
          title="Total Contributions"
          value={`${formatRWF(totalContributions)} RWF`}
          icon={<Wallet className="w-6 h-6" />}
          trend={{ value: `${contributions.length} contributors`, positive: true }}
        />
      </div>

      {/* Members Table */}
      <div className="glass-elevated rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Cooperative Members</h3>
          <span className="text-xs text-muted-foreground">{totalMembers} members</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((m) => (
                <TableRow key={m.member_id}>
                  <TableCell className="font-medium text-foreground">{m.first_name} {m.last_name}</TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">{m.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusVariant[m.member_status] || statusVariant.inactive}`}>
                      {m.member_status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(m.join_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => handleViewMember(m)}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-elevated rounded-xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Loans Issued (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 25% 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(213 15% 50%)" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(213 15% 50%)" }} />
              <Tooltip />
              <Bar dataKey="loans" fill="hsl(205 85% 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-elevated rounded-xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Loan Status</h3>
          {pieData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
              No loans yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={PIE_COLORS[d.name] || fallbackColor} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[d.name] || fallbackColor }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="glass-elevated rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Recent Loans</h3>
          <Link to="/loans" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 font-medium">Member</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Issued</th>
                <th className="pb-3 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {recentLoans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">No loans yet</td>
                </tr>
              ) : (
                recentLoans.map((l) => (
                  <tr key={l.loan_id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium text-foreground">{memberName(l.member_id)}</td>
                    <td className="py-3 text-foreground">{formatRWF(l.loan_amount)} RWF</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        loanStatusBadge[l.loan_status?.toLowerCase()] || "bg-muted text-muted-foreground"
                      }`}>
                        {l.loan_status}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{new Date(l.issue_date).toLocaleDateString()}</td>
                    <td className="py-3 text-muted-foreground">{formatRWF(l.loan_balance)} RWF</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <MemberDetailDialog
      member={selectedMember}
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      onUpdated={() => {
        fetchMembers();
        setDialogOpen(false);
      }}
    />
  </DashboardLayout>
  );
};

export default Dashboard;