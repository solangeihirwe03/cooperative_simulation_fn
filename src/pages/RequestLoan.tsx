import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { memberApi, type CreateLoanPayload, type MemberLoan } from "@/lib/api";
import { toast } from "sonner";
import { DollarSign, Percent, Calendar, Send, AlertCircle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const RequestLoan = () => {
  const [formData, setFormData] = useState<CreateLoanPayload>({
    loan_amount: 0,
    interest_rate: 0,
    repayment_period: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successLoan, setSuccessLoan] = useState<MemberLoan | null>(null);
  const [myLoans, setMyLoans] = useState<MemberLoan[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(true);

  const loadLoans = () => {
    setLoadingLoans(true);
    memberApi
      .getLoans()
      .then(setMyLoans)
      .catch(() => {
        // silently ignore — endpoint may be admin-restricted
      })
      .finally(() => setLoadingLoans(false));
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const interestPayable =
    (formData.loan_amount * formData.interest_rate * formData.repayment_period) / (12 * 100);
  const totalRepayment = formData.loan_amount + interestPayable;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessLoan(null);
    setSubmitting(true);
    try {
      const loan = await memberApi.requestLoan(formData);
      setSuccessLoan(loan);
      toast.success("Loan request submitted");
      setFormData({ loan_amount: 0, interest_rate: 0, repayment_period: 0 });
      loadLoans();
    } catch (err: any) {
      const msg = err?.message || "Failed to request loan";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Request a Loan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Submit a new loan request. Your cooperative will review it.
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Request rejected</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {successLoan && (
          <Alert>
            <FileText className="w-4 h-4" />
            <AlertTitle>Loan request submitted</AlertTitle>
            <AlertDescription>
              Loan #{successLoan.loan_id} for {successLoan.loan_amount.toLocaleString()} RWF —
              status: <span className="capitalize font-medium">{successLoan.loan_status}</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="glass-elevated rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting request..." : "Submit Loan Request"}
            </button>
          </form>
        </div>

        <div className="glass-elevated rounded-xl p-6">
          <h2 className="font-display font-semibold text-foreground mb-3">My Loans</h2>
          {loadingLoans ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : myLoans.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have no loans yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Loan ID</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Balance</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {myLoans.map((l) => (
                    <tr key={l.loan_id} className="border-b border-border/50">
                      <td className="px-3 py-2 font-mono text-xs">#{l.loan_id}</td>
                      <td className="px-3 py-2">{l.loan_amount.toLocaleString()} RWF</td>
                      <td className="px-3 py-2">{l.loan_balance.toLocaleString()} RWF</td>
                      <td className="px-3 py-2 capitalize">{l.loan_status}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {new Date(l.issue_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequestLoan;