import { useEffect, useState, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { AlertTriangle, Search, Users, Plus, Calendar } from "lucide-react";
import { adminApi, type Penalty, type AdminMember } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [pMemberId, setPMemberId] = useState<string>("");
  const [pAmount, setPAmount] = useState("200");
  const [pReason, setPReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pMemberId || !pAmount || !pReason) return;
    setSubmitting(true);
    try {
      await adminApi.createPenalty(Number(pMemberId), {
        amount: Number(pAmount),
        reason: pReason,
      });
      toast({ title: "Penalty issued" });
      setOpen(false);
      setPMemberId("");
      setPAmount("200");
      setPReason("");
      load();
    } catch (err: unknown) {
      toast({
        title: "Failed to issue penalty",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const memberName = (id: number) => {
    const m = members.find((x) => x.member_id === id);
    return m ? `${m.first_name} ${m.last_name}` : `M-${id}`;
  };

  const inDateRange = (dateStr: string) => {
    const d = new Date(dateStr);
    if (dateFrom && d < new Date(dateFrom + "T00:00:00")) return false;
    if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
    return true;
  };

  const filtered = useMemo(
    () =>
      penalties.filter((p) => {
        const matchesSearch =
          memberName(p.member_id).toLowerCase().includes(search.toLowerCase()) ||
          p.reason.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus && inDateRange(p.date_issued);
      }),
    [penalties, search, members, statusFilter, dateFrom, dateTo]
  );

  const totalPenalty = penalties.reduce((s, p) => s + p.amount, 0);
  const totalPaid = penalties.reduce((s, p) => s + (p.amount_paid ?? 0), 0);
  const unpaidCount = penalties.filter((p) => p.status !== "paid").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Penalties</h1>
            <p className="text-muted-foreground text-sm mt-1">All penalties issued across the cooperative</p>
          </div>
          <Button onClick={() => setOpen(true)} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Issue Penalty
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Total Penalties" value={fmt(totalPenalty)} icon={<AlertTriangle className="w-6 h-6" />} />
          <StatCard title="Total Paid" value={fmt(totalPaid)} icon={<Users className="w-6 h-6" />} />
          <StatCard title="Unpaid Penalties" value={unpaidCount.toString()} icon={<AlertTriangle className="w-6 h-6" />} />
        </div>

        <div className="glass-elevated rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
            <h3 className="font-display font-semibold text-foreground">Penalty Records</h3>
            <div className="flex flex-wrap gap-2">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Filter status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="date"
                title="From date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-40"
              />
              <input
                type="date"
                title="To date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-40"
              />
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Penalty</DialogTitle>
            <DialogDescription>Manually penalize a cooperative member.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIssue} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Member</label>
              <Select value={pMemberId} onValueChange={setPMemberId}>
                <SelectTrigger><SelectValue placeholder="Select a member" /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.member_id} value={m.member_id.toString()}>
                      {m.first_name} {m.last_name} ({m.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (RWF)</label>
              <Input
                type="number"
                min="1"
                value={pAmount}
                onChange={(e) => setPAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input
                placeholder="e.g. missed contribution"
                value={pReason}
                onChange={(e) => setPReason(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                disabled={submitting || !pMemberId || !pAmount || !pReason}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {submitting ? "Issuing…" : "Issue Penalty"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Penalties;