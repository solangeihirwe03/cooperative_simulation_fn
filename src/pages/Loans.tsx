import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminApi, type AdminMember, type CreateLoanPayload } from "@/lib/api";
import { toast } from "sonner";
import { Search, Plus, Users, DollarSign, Percent, Calendar } from "lucide-react";

const Loans = () => {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [formData, setFormData] = useState<CreateLoanPayload>({
    loan_amount: 0,
    interest_rate: 0,
    repayment_period: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminApi
      .getMembers()
      .then(setMembers)
      .catch(() => toast.error("Failed to load members"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter(
    (m) =>
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setSubmitting(true);
    try {
      await adminApi.createLoan(selectedMember.member_id, formData);
      toast.success(`Loan created for ${selectedMember.first_name} ${selectedMember.last_name}`);
      setSelectedMember(null);
      setFormData({ loan_amount: 0, interest_rate: 0, repayment_period: 0 });
    } catch (err: any) {
      toast.error(err.message || "Failed to create loan");
    } finally {
      setSubmitting(false);
    }
  };

  // Computed preview
  const interestPayable = (formData.loan_amount * formData.interest_rate * formData.repayment_period) / (12 * 100);
  const totalRepayment = formData.loan_amount + interestPayable;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Loan Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Create loans for cooperative members</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Members list */}
          <div className="lg:col-span-2 glass-elevated rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Members</h2>
              <span className="ml-auto text-xs text-muted-foreground">{members.length} total</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading members...</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No members found</p>
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.member_id}
                    onClick={() => setSelectedMember(m)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm ${
                      selectedMember?.member_id === m.member_id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted border border-transparent"
                    }`}
                  >
                    <p className="font-medium text-foreground">
                      {m.first_name} {m.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          m.member_status === "active" ? "bg-success" : "bg-warning"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground capitalize">{m.member_status}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Loan form */}
          <div className="lg:col-span-3 glass-elevated rounded-xl p-6">
            {!selectedMember ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center">
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

                {/* Preview */}
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
    </DashboardLayout>
  );
};

export default Loans;
