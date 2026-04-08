import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, FileText, FlaskConical, TrendingUp, ArrowRight, Building, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { adminApi, type AdminMember } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MemberDetailDialog from "@/components/dashboard/MemberDetailDialog";

const barData = [
  { name: "Jan", simulations: 12 },
  { name: "Feb", simulations: 19 },
  { name: "Mar", simulations: 27 },
  { name: "Apr", simulations: 22 },
  { name: "May", simulations: 34 },
  { name: "Jun", simulations: 41 },
];

const pieData = [
  { name: "Approved", value: 45 },
  { name: "Pending", value: 18 },
  { name: "Rejected", value: 7 },
];

const PIE_COLORS = ["hsl(205 85% 50%)", "hsl(38 92% 55%)", "hsl(0 72% 55%)"];

const recentSimulations = [
  { id: 1, name: "Interest Rate Adjustment", status: "Completed", date: "Mar 22, 2026", impact: "Positive" },
  { id: 2, name: "Membership Fee Update", status: "Running", date: "Mar 23, 2026", impact: "Neutral" },
  { id: 3, name: "Loan Policy Revision", status: "Completed", date: "Mar 21, 2026", impact: "Positive" },
];

const statusVariant: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  inactive: "bg-muted text-muted-foreground border-border",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchMembers = useCallback(() => {
    adminApi.getMembers().then(setMembers).catch(() => {});
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const totalMembers = members.length;
  const cooperativeName = members[0]?.cooperative?.cooperative_name || user?.cooperative?.cooperative_name || "—";

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
        <StatCard title="Total Members" value={totalMembers.toLocaleString()} icon={<Users className="w-6 h-6" />} trend={{ value: `${members.filter(m => m.member_status === "active").length} active`, positive: true }} />
        <StatCard title="Active Policies" value="32" icon={<FileText className="w-6 h-6" />} trend={{ value: "3 new", positive: true }} />
        <StatCard title="Simulations Run" value="156" icon={<FlaskConical className="w-6 h-6" />} trend={{ value: "24 this week", positive: true }} />
        <StatCard title="Avg. Impact Score" value="78%" icon={<TrendingUp className="w-6 h-6" />} trend={{ value: "5% improvement", positive: true }} />
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
          <h3 className="font-display font-semibold text-foreground mb-4">Simulations Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 25% 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(213 15% 50%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(213 15% 50%)" }} />
              <Tooltip />
              <Bar dataKey="simulations" fill="hsl(205 85% 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-elevated rounded-xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Policy Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-elevated rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Recent Simulations</h3>
          <Link to="/simulation" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 font-medium">Simulation</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Impact</th>
              </tr>
            </thead>
            <tbody>
              {recentSimulations.map((sim) => (
                <tr key={sim.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-medium text-foreground">{sim.name}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sim.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {sim.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{sim.date}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium ${sim.impact === "Positive" ? "text-success" : "text-muted-foreground"}`}>
                      {sim.impact}
                    </span>
                  </td>
                </tr>
              ))}
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
