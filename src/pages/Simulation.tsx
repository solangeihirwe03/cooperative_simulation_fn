import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { simulationApi, SimulationPayload, SimulationResponse, ScenarioStatus } from "@/lib/api";

const defaultPayload: SimulationPayload = {
  contribution_amount: 1000,
  min_shares: 1,
  max_shares: 10,
  loan_multiplier: 6,
  interest_rate: 12.5,
  repayment_period: 10,
  penalty_rate: 2,
};

const fieldLabels: Record<keyof SimulationPayload, string> = {
  contribution_amount: "Contribution Amount",
  min_shares: "Minimum Shares",
  max_shares: "Maximum Shares",
  loan_multiplier: "Loan Multiplier",
  interest_rate: "Interest Rate (%)",
  repayment_period: "Repayment Period (months)",
  penalty_rate: "Penalty Rate (%)",
};

const statusStyles: Record<ScenarioStatus, { bg: string; text: string; icon: JSX.Element; label: string }> = {
  success: {
    bg: "bg-success/10 border-success/20",
    text: "text-success",
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: "Success",
  },
  risky: {
    bg: "bg-warning/10 border-warning/20",
    text: "text-warning",
    icon: <AlertTriangle className="w-5 h-5" />,
    label: "Risky",
  },
  fail: {
    bg: "bg-destructive/10 border-destructive/20",
    text: "text-destructive",
    icon: <XCircle className="w-5 h-5" />,
    label: "Fail",
  },
};

const Simulation = () => {
  const [payload, setPayload] = useState<SimulationPayload>(defaultPayload);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof SimulationPayload, value: string) => {
    setPayload((p) => ({ ...p, [key]: Number(value) }));
  };

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await simulationApi.run(payload);
      setResult(res);
      toast.success("Simulation completed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  const overallIcon = result
    ? result.scenarios.some((s) => s.status === "fail")
      ? <XCircle className="w-5 h-5 text-destructive mt-0.5" />
      : result.scenarios.some((s) => s.status === "risky")
      ? <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
      : <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Policy Simulation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure proposed policy parameters and run a scenario comparison
          </p>
        </div>

        {/* Parameter form */}
        <div className="glass-elevated rounded-xl p-6 animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4">Proposed Policy Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(fieldLabels) as Array<keyof SimulationPayload>).map((key) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-xs text-muted-foreground">
                  {fieldLabels[key]}
                </Label>
                <Input
                  id={key}
                  type="number"
                  step="any"
                  value={payload[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleRun}
              disabled={loading}
              className="gradient-primary text-primary-foreground hover:opacity-90 px-8 py-3 text-base"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <FlaskConical className="w-5 h-5 mr-2" />
              )}
              Run Simulation
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-elevated rounded-xl p-5">
                <p className="text-xs text-muted-foreground">Avg Contribution / Member</p>
                <p className="text-xl font-display font-bold text-foreground mt-1">
                  {result.indicators.average_contribution_per_member.toFixed(2)}
                </p>
              </div>
              <div className="glass-elevated rounded-xl p-5">
                <p className="text-xs text-muted-foreground">Default Rate</p>
                <p className="text-xl font-display font-bold text-foreground mt-1">
                  {(result.indicators.default_rate * 100).toFixed(2)}%
                </p>
              </div>
              <div className="glass-elevated rounded-xl p-5">
                <p className="text-xs text-muted-foreground">Loan Utilization Ratio</p>
                <p className="text-xl font-display font-bold text-foreground mt-1">
                  {result.indicators.loan_utilization_ratio.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Scenarios */}
            <div className="glass-elevated rounded-xl p-6">
              <h3 className="font-display font-semibold text-foreground mb-4">Scenario Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.scenarios.map((s) => {
                  const style = statusStyles[s.status];
                  return (
                    <div key={s.field} className={`rounded-lg border p-4 ${style.bg}`}>
                      <div className="flex items-start gap-3">
                        <div className={style.text}>{style.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm text-foreground">
                              {fieldLabels[s.field as keyof SimulationPayload] ?? s.field}
                            </p>
                            <span className={`text-xs font-semibold uppercase ${style.text}`}>
                              {style.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{s.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="glass-elevated rounded-xl p-6">
              <h3 className="font-display font-semibold text-foreground mb-3">Simulation Summary</h3>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {overallIcon}
                  <p className="text-sm text-foreground">{result.summary}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Simulation;