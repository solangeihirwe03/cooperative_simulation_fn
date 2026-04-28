import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Wallet, Users, Plus, Search } from "lucide-react";
import { adminApi, type MemberContributionSummary, type AdminMember } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const fmt = (n: number) =>
  n.toLocaleString("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 });

const Contributions = () => {
  const { toast } = useToast();
  const [summaries, setSummaries] = useState<MemberContributionSummary[]>([]);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    adminApi.getAllContributions().then(setSummaries).catch(() =>
      toast({ title: "Failed to load contributions", variant: "destructive" })
    );
    adminApi.getMembers().then(setMembers).catch(() => {});
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = summaries.filter((s) =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const total = summaries.reduce((s, c) => s + c.total_contribution, 0);
  const contributors = summaries.filter((s) => s.total_contribution > 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !amount) return;
    setSubmitting(true);
    try {
      await adminApi.createContribution(Number(selectedMemberId), Number(amount));
      toast({ title: "Contribution recorded" });
      setOpen(false);
      setSelectedMemberId("");
      setAmount("");
      load();
    } catch (err: unknown) {
      toast({
        title: "Failed to record contribution",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Member Contributions</h1>
            <p className="text-muted-foreground text-sm mt-1">Track and record member contributions</p>
          </div>
          <Button onClick={() => setOpen(true)} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Record Contribution
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Total Contributions" value={fmt(total)} icon={<Wallet className="w-6 h-6" />} />
          <StatCard title="Contributing Members" value={contributors.toString()} icon={<Users className="w-6 h-6" />} />
          <StatCard title="Total Members" value={summaries.length.toString()} icon={<Users className="w-6 h-6" />} />
        </div>

        <div className="glass-elevated rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h3 className="font-display font-semibold text-foreground">All Members</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Total Contribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No contributions found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.member_id}>
                    <TableCell className="font-medium">{s.member_id}</TableCell>
                    <TableCell>{s.first_name} {s.last_name}</TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {fmt(s.total_contribution)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Member Contribution</DialogTitle>
            <DialogDescription>Add a new contribution for a cooperative member.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Member</label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
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
              <label className="text-sm font-medium">Contribution Amount (RWF)</label>
              <Input
                type="number"
                min="1"
                placeholder="20000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting || !selectedMemberId || !amount} className="gradient-primary text-primary-foreground">
                {submitting ? "Saving…" : "Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Contributions;