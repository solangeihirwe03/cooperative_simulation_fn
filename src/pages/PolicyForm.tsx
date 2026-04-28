import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Plus, Save, Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { policiesApi, CreatePolicyPayload, Policy } from "@/lib/api";

const emptyPolicy: CreatePolicyPayload = {
  policy_name: "",
  policy_description: "",
  contribution_amount: 1000,
  min_shares: 1,
  max_shares: 10,
  loan_multiplier: 3,
  max_loan_amount: 300000,
  interest_rate: 10,
  repayment_period: 12,
  penalty_rate: 5,
};

const numericFields: Array<{
  key: keyof CreatePolicyPayload;
  label: string;
  step?: string;
}> = [
  { key: "contribution_amount", label: "Contribution Amount" },
  { key: "min_shares", label: "Min Shares" },
  { key: "max_shares", label: "Max Shares" },
  { key: "loan_multiplier", label: "Loan Multiplier", step: "any" },
  { key: "max_loan_amount", label: "Max Loan Amount" },
  { key: "interest_rate", label: "Interest Rate (%)", step: "any" },
  { key: "repayment_period", label: "Repayment Period (months)" },
  { key: "penalty_rate", label: "Penalty Rate (%)", step: "any" },
];

const PolicyForm = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreatePolicyPayload>(emptyPolicy);

  const [editing, setEditing] = useState<Policy | null>(null);
  const [editForm, setEditForm] = useState<CreatePolicyPayload>(emptyPolicy);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await policiesApi.getAll();
      setPolicies(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleField = (
    setter: typeof setForm,
    key: keyof CreatePolicyPayload,
    value: string,
  ) => {
    setter((p) => ({
      ...p,
      [key]:
        key === "policy_name" || key === "policy_description"
          ? value
          : Number(value),
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.policy_name.trim()) {
      toast.error("Policy name is required");
      return;
    }
    setSubmitting(true);
    try {
      await policiesApi.create(form);
      toast.success("Policy created");
      setForm(emptyPolicy);
      loadPolicies();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create policy");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (p: Policy) => {
    setEditing(p);
    setEditForm({
      policy_name: p.policy_name,
      policy_description: p.policy_description,
      contribution_amount: p.contribution_amount,
      min_shares: p.min_shares,
      max_shares: p.max_shares,
      loan_multiplier: p.loan_multiplier,
      max_loan_amount: p.max_loan_amount,
      interest_rate: p.interest_rate,
      repayment_period: p.repayment_period,
      penalty_rate: p.penalty_rate,
    });
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setEditSubmitting(true);
    try {
      await policiesApi.update(editing.policy_id, editForm);
      toast.success("Policy updated");
      setEditing(null);
      loadPolicies();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update policy");
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Policy Management
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create and manage cooperative policies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 glass-elevated rounded-xl p-6 animate-fade-in h-fit">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> New Policy
            </h3>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Policy Name</Label>
                <Input
                  placeholder="Standard Cooperative Policy"
                  value={form.policy_name}
                  onChange={(e) => handleField(setForm, "policy_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Textarea
                  placeholder="Default rules for members..."
                  rows={3}
                  value={form.policy_description}
                  onChange={(e) =>
                    handleField(setForm, "policy_description", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {numericFields.map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input
                      type="number"
                      step={f.step ?? "1"}
                      value={form[f.key] as number}
                      onChange={(e) => handleField(setForm, f.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full gradient-primary text-primary-foreground hover:opacity-90"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Create Policy
              </Button>
            </form>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Current Policies
                <span className="text-xs text-muted-foreground font-normal">
                  ({policies.length})
                </span>
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : policies.length === 0 ? (
              <div className="glass-elevated rounded-xl p-8 text-center text-sm text-muted-foreground">
                No policies yet. Create your first policy to get started.
              </div>
            ) : (
              policies.map((policy) => (
                <div
                  key={policy.policy_id}
                  className="glass-elevated rounded-xl p-5 animate-fade-in"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-display font-semibold text-foreground">
                        {policy.policy_name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {policy.policy_description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          policy.is_active
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {policy.is_active ? "Active" : "Inactive"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(policy)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
                    <Stat label="Contribution" value={policy.contribution_amount} />
                    <Stat label="Max Loan" value={policy.max_loan_amount} />
                    <Stat label="Interest" value={`${policy.interest_rate}%`} />
                    <Stat label="Repayment" value={`${policy.repayment_period}m`} />
                    <Stat label="Min Shares" value={policy.min_shares} />
                    <Stat label="Max Shares" value={policy.max_shares} />
                    <Stat label="Loan Multiplier" value={policy.loan_multiplier} />
                    <Stat label="Penalty" value={`${policy.penalty_rate}%`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Policy Name</Label>
              <Input
                value={editForm.policy_name}
                onChange={(e) =>
                  handleField(setEditForm, "policy_name", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                rows={3}
                value={editForm.policy_description}
                onChange={(e) =>
                  handleField(setEditForm, "policy_description", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {numericFields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{f.label}</Label>
                  <Input
                    type="number"
                    step={f.step ?? "1"}
                    value={editForm[f.key] as number}
                    onChange={(e) => handleField(setEditForm, f.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={editSubmitting}
              className="gradient-primary text-primary-foreground"
            >
              {editSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
  </div>
);

export default PolicyForm;