import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, type AdminMember, type MemberLoan, type LoanStatus } from "@/lib/api";
import { toast } from "sonner";
import { FileText, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const LOAN_STATUSES: LoanStatus[] = ["pending", "approved", "active", "completed", "cancelled"];

const statusBadge: Record<LoanStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  approved: "bg-primary/10 text-primary border-primary/20",
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const Loans = () => {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [allLoans, setAllLoans] = useState<MemberLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(true);
  const [loanSearch, setLoanSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [updatingLoanId, setUpdatingLoanId] = useState<number | null>(null);
  const [detailLoan, setDetailLoan] = useState<MemberLoan | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchLoans = () => {
    setLoansLoading(true);
    adminApi
      .getAllLoans()
      .then(setAllLoans)
      .catch(() => toast.error("Failed to load loans"))
      .finally(() => setLoansLoading(false));
  };

  useEffect(() => {
    adminApi
      .getMembers()
      .then(setMembers)
      .catch(() => toast.error("Failed to load members"))
      .finally(() => setLoading(false));
    fetchLoans();
  }, []);

  const getMemberName = (memberId: number) => {
    const m = members.find((m) => m.member_id === memberId);
    return m ? `${m.first_name} ${m.last_name}` : `Member #${memberId}`;
  };

  const handleStatusChange = async (loanId: number, newStatus: LoanStatus) => {
    setUpdatingLoanId(loanId);
    try {
      await adminApi.updateLoanStatus(loanId, newStatus);
      setAllLoans((prev) => prev.map((l) => (l.loan_id === loanId ? { ...l, loan_status: newStatus } : l)));
      toast.success("Loan status updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingLoanId(null);
    }
  };

  const handleViewLoan = async (loanId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const loan = await adminApi.getLoan(loanId);
      setDetailLoan(loan);
    } catch (err: any) {
      toast.error(err.message || "Failed to load loan details");
    } finally {
      setDetailLoading(false);
    }
  };

  const inDateRange = (dateStr: string) => {
    const d = new Date(dateStr);
    if (dateFrom && d < new Date(dateFrom + "T00:00:00")) return false;
    if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
    return true;
  };

  const filteredLoans = allLoans.filter((loan) => {
    const matchesStatus = statusFilter === "all" || loan.loan_status === statusFilter;
    const name = getMemberName(loan.member_id).toLowerCase();
    const matchesSearch = name.includes(loanSearch.toLowerCase()) || loan.loan_id.toString().includes(loanSearch);
    return matchesStatus && matchesSearch && inDateRange(loan.issue_date);
  });

  const loanStats = {
    total: allLoans.length,
    active: allLoans.filter((l) => l.loan_status === "active").length,
    pending: allLoans.filter((l) => l.loan_status === "pending").length,
    totalAmount: allLoans.reduce((sum, l) => sum + l.loan_amount, 0),
    totalUnpaid: allLoans.reduce((sum, l) => sum + (l.loan_balance || 0), 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Loan Management</h1>
          <p className="text-muted-foreground text-sm mt-1">View all loans, create new ones, and manage statuses</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Total Loans", value: loanStats.total, color: "text-foreground" },
            { label: "Active", value: loanStats.active, color: "text-emerald-600" },
            { label: "Pending", value: loanStats.pending, color: "text-yellow-600" },
            { label: "Total Disbursed", value: `${loanStats.totalAmount.toLocaleString()} RWF`, color: "text-primary" },
            { label: "Total Unpaid", value: `${loanStats.totalUnpaid.toLocaleString()} RWF`, color: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="glass-elevated rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search by member or loan ID..."
                value={loanSearch}
                onChange={(e) => setLoanSearch(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {LOAN_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
            </Select>
            <input
              type="date"
              title="From date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-40"
            />
            <input
              type="date"
              title="To date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-40"
            />
          </div>

          <div className="glass-elevated rounded-xl overflow-hidden">
              {loansLoading ? (
                <p className="text-sm text-muted-foreground text-center py-12">Loading loans...</p>
              ) : filteredLoans.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No loans found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Loan ID</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Member</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Balance</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rate</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Issued</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoans.map((loan) => (
                        <tr key={loan.loan_id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{loan.loan_id}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{getMemberName(loan.member_id)}</td>
                          <td className="px-4 py-3 text-foreground">{loan.loan_amount.toLocaleString()} RWF</td>
                          <td className="px-4 py-3 text-foreground">{loan.loan_balance.toLocaleString()} RWF</td>
                          <td className="px-4 py-3 text-foreground">{loan.interest_rate}%</td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(loan.issue_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <Select
                              value={loan.loan_status}
                              onValueChange={(val) => handleStatusChange(loan.loan_id, val as LoanStatus)}
                              disabled={updatingLoanId === loan.loan_id}
                            >
                              <SelectTrigger className="h-7 w-32 text-xs">
                                <Badge variant="outline" className={`${statusBadge[loan.loan_status as LoanStatus] || ""} text-xs capitalize`}>
                                  {loan.loan_status}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                {LOAN_STATUSES.map((s) => (
                                  <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewLoan(loan.loan_id)}
                              className="p-1.5 rounded-md hover:bg-muted transition-colors text-primary"
                              title="View loan details"
                            >
                              <Eye className="w-4 h-4" />
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
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
            <DialogDescription>
              {detailLoan ? `Loan #${detailLoan.loan_id}` : "Loading..."}
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading details...</div>
          ) : detailLoan ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Member</p>
                <p className="font-semibold text-foreground">{getMemberName(detailLoan.member_id)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="outline" className={`${statusBadge[detailLoan.loan_status as LoanStatus] || ""} capitalize`}>
                  {detailLoan.loan_status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Loan Amount</p>
                <p className="font-semibold text-foreground">{detailLoan.loan_amount.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-muted-foreground">Interest Rate</p>
                <p className="font-semibold text-foreground">{detailLoan.interest_rate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Repayment Period</p>
                <p className="font-semibold text-foreground">{detailLoan.repayment_period} months</p>
              </div>
              <div>
                <p className="text-muted-foreground">Issue Date</p>
                <p className="font-semibold text-foreground">{new Date(detailLoan.issue_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Interest Payable</p>
                <p className="font-semibold text-foreground">{detailLoan.interest_payable.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-muted-foreground">Repayment Amount</p>
                <p className="font-semibold text-foreground">{detailLoan.repayment_amount.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount Paid</p>
                <p className="font-semibold text-foreground">{detailLoan.amount_paid.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-muted-foreground">Loan Balance</p>
                <p className="font-semibold text-foreground">{detailLoan.loan_balance.toLocaleString()} RWF</p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">Failed to load loan details</div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Loans;
