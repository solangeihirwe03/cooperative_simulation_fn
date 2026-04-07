import { useState, useEffect } from "react";
import { adminApi, type MemberLoan, type LoanStatus } from "@/lib/api";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";

const LOAN_STATUSES: LoanStatus[] = ["pending", "approved", "active", "completed", "cancelled"];

const statusColors: Record<LoanStatus, string> = {
  pending: "text-warning",
  approved: "text-primary",
  active: "text-success",
  completed: "text-muted-foreground",
  cancelled: "text-destructive",
};

interface MemberLoansProps {
  memberId: number;
  memberName: string;
}

const MemberLoans = ({ memberId, memberName }: MemberLoansProps) => {
  const [loans, setLoans] = useState<MemberLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getMemberLoans(memberId)
      .then(setLoans)
      .catch(() => toast.error("Failed to load loans"))
      .finally(() => setLoading(false));
  }, [memberId]);

  const handleStatusChange = async (loanId: number, newStatus: LoanStatus) => {
    setUpdatingId(loanId);
    try {
      const updated = await adminApi.updateLoanStatus(loanId, newStatus);
      setLoans((prev) => prev.map((l) => (l.loan_id === loanId ? { ...l, loan_status: updated.loan_status ?? newStatus } : l)));
      toast.success("Loan status updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-6">Loading loans...</p>;
  }

  if (loans.length === 0) {
    return (
      <div className="text-center py-6">
        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No loans found for {memberName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        Existing Loans ({loans.length})
      </h4>
      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
        {loans.map((loan) => (
          <div
            key={loan.loan_id}
            className="bg-muted/50 rounded-lg p-3 border border-border/50 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold text-foreground">{loan.loan_amount.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance</p>
                <p className="font-semibold text-foreground">{loan.loan_balance.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rate</p>
                <p className="font-semibold text-foreground">{loan.interest_rate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Issued</p>
                <p className="font-semibold text-foreground">{new Date(loan.issue_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="sm:w-[150px]">
              <Select
                value={loan.loan_status}
                onValueChange={(val) => handleStatusChange(loan.loan_id, val as LoanStatus)}
                disabled={updatingId === loan.loan_id}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberLoans;
