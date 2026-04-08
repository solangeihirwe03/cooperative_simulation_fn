import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, type AdminMember, type MemberLoan, type LoanStatus, type CreateLoanPayload } from "@/lib/api";
import { toast } from "sonner";
import { Plus, DollarSign, Percent, Calendar, FileText, Eye, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemberList from "@/components/loans/MemberList";

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
  const [search, setSearch] = useState("");
  const [loanSearch, setLoanSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [updatingLoanId, setUpdatingLoanId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateLoanPayload>({
    loan_amount: 0,
    interest_rate: 0,
    repayment_period: 0,
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setSubmitting(true);
    try {
      await adminApi.createLoan(selectedMember.member_id, formData);
      toast.success(`Loan created for ${selectedMember.first_name} ${selectedMember.last_name}`);
      setFormData({ loan_amount: 0, interest_rate: 0, repayment_period: 0 });
      fetchLoans();
    } catch (err: any) {
      toast.error(err.message || "Failed to create loan");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLoans = allLoans.filter((loan) => {
    const matchesStatus = statusFilter === "all" || loan.loan_status === statusFilter;
    const name = getMemberName(loan.member_id).toLowerCase();
    const matchesSearch = name.includes(loanSearch.toLowerCase()) || loan.loan_id.toString().includes(loanSearch);
    return matchesStatus && matchesSearch;
  });

  const interestPayable = (formData.loan_amount * formData.interest_rate * formData.repayment_period) / (12 * 100);
  const totalRepayment = formData.loan_amount + interestPayable;

  const loanStats = {
    total: allLoans.length,
    active: allLoans.filter((l) => l.loan_status === "active").length,
    pending: allLoans.filter((l) => l.loan_status === "pending").length,
    totalAmount: allLoans.reduce((sum, l) => sum + l.loan_amount, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Loan Management</h1>
          <p className="text-muted-foreground text-sm mt-1">View all loans, create new ones, and manage statuses</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Loans", value: loanStats.total, color: "text-foreground" },
            { label: "Active", value: loanStats.active, color: "text-emerald-600" },
            { label: "Pending", value: loanStats.pending, color: "text-yellow-600" },
            { label: "Total Disbursed", value: `${loanStats.totalAmount.toLocaleString()} RWF`, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="glass-elevated rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="all-loans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-loans">All Loans</TabsTrigger>
            <TabsTrigger value="create-loan">Create Loan</TabsTrigger>
          </TabsList>

          {/* All Loans Tab */}
          <TabsContent value="all-loans" className="space-y-4">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Create Loan Tab */}
          <TabsContent value="create-loan">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <MemberList
                members={members}
                loading={loading}
                search={search}
                onSearchChange={setSearch}
                selectedMemberId={selectedMember?.member_id}
                onSelectMember={setSelectedMember}
              />

              <div className="lg:col-span-3">
                <div className="glass-elevated rounded-xl p-6">
                  {!selectedMember ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Plus className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <h3 className="font-display font-semibold text-foreground">Select a Member</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        Choose a member from the list to create a new loan for them.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateLoan} className="space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {selectedMember.first_name[0]}
                          {selectedMember.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {selectedMember.first_name} {selectedMember.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{selectedMember.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                            <DollarSign className="w-4 h-4 text-primary" />
                            Loan Amount
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={formData.loan_amount || ""}
                            onChange={(e) => setFormData({ ...formData, loan_amount: +e.target.value })}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="e.g. 5000"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                            <Percent className="w-4 h-4 text-primary" />
                            Interest Rate (%)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={0.1}
                            value={formData.interest_rate || ""}
                            onChange={(e) => setFormData({ ...formData, interest_rate: +e.target.value })}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="e.g. 12.5"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Repayment (months)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={formData.repayment_period || ""}
                            onChange={(e) => setFormData({ ...formData, repayment_period: +e.target.value })}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="e.g. 12"
                          />
                        </div>
                      </div>

                      {formData.loan_amount > 0 && formData.interest_rate > 0 && formData.repayment_period > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border/50">
                          <h4 className="text-sm font-medium text-foreground">Loan Preview</h4>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Interest Payable</p>
                              <p className="font-semibold text-foreground">{interestPayable.toLocaleString()} RWF</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Total Repayment</p>
                              <p className="font-semibold text-foreground">{totalRepayment.toLocaleString()} RWF</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Monthly Payment</p>
                              <p className="font-semibold text-foreground">
                                {(totalRepayment / formData.repayment_period).toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}{" "}
                                RWF
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {submitting ? "Creating Loan..." : "Create Loan"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Loans;
