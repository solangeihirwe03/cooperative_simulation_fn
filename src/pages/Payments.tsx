import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, paymentsApi, type AdminMember, type MemberLoan, type LoanPayment } from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, Plus, Pencil, Search } from "lucide-react";

const Payments = () => {
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loans, setLoans] = useState<MemberLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // create form
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // edit
  const [editing, setEditing] = useState<LoanPayment | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  const fetchPayments = () => {
    setLoading(true);
    paymentsApi
      .getAll()
      .then(setPayments)
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
    adminApi.getMembers().then(setMembers).catch(() => {});
    adminApi.getAllLoans().then(setLoans).catch(() => {});
  }, []);

  const memberName = (id: number) => {
    const m = members.find((m) => m.member_id === id);
    return m ? `${m.first_name} ${m.last_name}` : `Member #${id}`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const loan = loans.find((l) => l.loan_id === Number(selectedLoanId));
    if (!loan) return toast.error("Select a loan");
    if (amount <= 0) return toast.error("Enter a valid amount");
    setSubmitting(true);
    try {
      await paymentsApi.create(loan.loan_id, loan.member_id, amount);
      toast.success("Payment recorded");
      setCreateOpen(false);
      setSelectedLoanId("");
      setAmount(0);
      fetchPayments();
    } catch (err: unknown) {
      toast.error((err as { message: string }).message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (editAmount <= 0) return toast.error("Enter a valid amount");
    setSubmitting(true);
    try {
      await paymentsApi.update(editing.payment_id, editAmount);
      toast.success("Payment updated");
      setEditing(null);
      fetchPayments();
    } catch (err: unknown) {
      toast.error((err as { message: string }).message || "Failed to update payment");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      memberName(p.member_id).toLowerCase().includes(q) ||
      p.loan_id.toString().includes(q) ||
      p.payment_id.toString().includes(q)
    );
  });

  const totalCollected = payments.reduce((s, p) => s + p.amount_paid, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Loan Payments</h1>
            <p className="text-muted-foreground text-sm mt-1">Record and manage repayments made by members</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Total Payments</p>
            <p className="text-lg font-bold text-foreground">{payments.length}</p>
          </div>
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Total Collected</p>
            <p className="text-lg font-bold text-primary">{totalCollected.toLocaleString()} RWF</p>
          </div>
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Active Loans</p>
            <p className="text-lg font-bold text-emerald-600">
              {loans.filter((l) => l.loan_status === "active").length}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by member, loan ID or payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="glass-elevated rounded-xl overflow-hidden">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-12">Loading payments...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Banknote className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment ID</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Loan ID</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Member</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.payment_id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.payment_id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.loan_id}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{memberName(p.member_id)}</td>
                      <td className="px-4 py-3 text-foreground">{p.amount_paid.toLocaleString()} RWF</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(p.payment_date).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setEditAmount(p.amount_paid);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-primary hover:bg-primary/10"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Loan Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Loan</label>
              <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a loan" />
                </SelectTrigger>
                <SelectContent>
                  {loans.map((l) => (
                    <SelectItem key={l.loan_id} value={String(l.loan_id)}>
                      #{l.loan_id} • {memberName(l.member_id)} • Bal {l.loan_balance.toLocaleString()} RWF
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Amount Paid (RWF)</label>
              <input
                type="number"
                min={1}
                value={amount || ""}
                onChange={(e) => setAmount(+e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. 2000"
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Record Payment"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment #{editing?.payment_id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Loan #{editing?.loan_id} • {editing && memberName(editing.member_id)}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Amount Paid (RWF)</label>
              <input
                type="number"
                min={1}
                value={editAmount || ""}
                onChange={(e) => setEditAmount(+e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <DialogFooter>
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Payments;