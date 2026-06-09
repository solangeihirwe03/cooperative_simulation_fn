import { useEffect, useState, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { AlertTriangle, Search, Users } from "lucide-react";
import { adminApi, type Penalty, type AdminMember } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const fmt = (n: number) =>
  n.toLocaleString("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 });

const statusStyle = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-success/10 text-success";
    case "partial":
      return "bg-warning/10 text-warning";
    default:
      return "bg-destructive/10 text-destructive";
  }
};

const Penalties = () => {
  const { toast } = useToast();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const fetcher =
      memberFilter === "all"
        ? adminApi.getAllPenalties()
        : adminApi.getMemberPenalties(Number(memberFilter));
    fetcher
      .then(setPenalties)
      .catch((err: Error) =>
        toast({ title: "Failed to load penalties", description: err.message, variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, [memberFilter, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    adminApi.getMembers().then(setMembers).catch(() => {});
  }, []);

  const memberName = (id: number) => {
    const m = members.find((x) => x.member_id === id);
    return m ? `${m.first_name} ${m.last_name}` : `M-${id}`;
  };

  const filtered = useMemo(
    () =>
      penalties.filter((p) =>
        memberName(p.member_id).toLowerCase().includes(search.toLowerCase()) ||
        p.reason.toLowerCase().includes(search.toLowerCase())
      ),
    [penalties, search, members]
  );

  const totalPenalty = penalties.reduce((s, p) => s + p.amount, 0);
  const totalPaid = penalties.reduce((s, p) => s + (p.amount_paid ?? 0), 0);
  const unpaidCount = penalties.filter((p) => p.status !== "paid").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Penalties</h1>
          <p className="text-muted-foreground text-sm mt-1">All penalties issued across the cooperative</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Total Penalties" value={fmt(totalPenalty)} icon={<AlertTriangle className="w-6 h-6" />} />
          <StatCard title="Total Paid" value={fmt(totalPaid)} icon={<Users className="w-6 h-6" />} />
          <StatCard title="Unpaid Penalties" value={unpaidCount.toString()} icon={<AlertTriangle className="w-6 h-6" />} />
        </div>

        <div className="glass-elevated rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
            <h3 className="font-display font-semibold text-foreground">Penalty Records</h3>
            <div className="flex gap-2">
              <Select value={memberFilter} onValueChange={setMemberFilter}>
                <SelectTrigger className="w-56"><SelectValue placeholder="Filter by member" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.member_id} value={m.member_id.toString()}>
                      {m.first_name} {m.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or reason..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No penalties found</TableCell></TableRow>
              ) : (
                filtered.map((p) => {
                  const paid = p.amount_paid ?? 0;
                  const balance = p.amount - paid;
                  return (
                    <TableRow key={p.penalty_id}>
                      <TableCell className="font-medium">P-{p.penalty_id}</TableCell>
                      <TableCell>{memberName(p.member_id)}</TableCell>
                      <TableCell>{p.reason}</TableCell>
                      <TableCell className="text-right">{fmt(p.amount)}</TableCell>
                      <TableCell className="text-right">{fmt(paid)}</TableCell>
                      <TableCell className="text-right font-medium">{fmt(balance)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle(p.status)}`}>
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(p.date_issued).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Penalties;