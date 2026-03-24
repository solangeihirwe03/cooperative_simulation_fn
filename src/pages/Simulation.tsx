import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FlaskConical, ArrowRight, CheckCircle2, XCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const comparisonData = [
  { metric: "Member Retention", current: 85, proposed: 92 },
  { metric: "Revenue Impact", current: 70, proposed: 78 },
  { metric: "Member Satisfaction", current: 72, proposed: 88 },
  { metric: "Risk Score", current: 45, proposed: 32 },
  { metric: "Growth Rate", current: 60, proposed: 75 },
];

const Simulation = () => {
  const [simulated, setSimulated] = useState(false);

  const results = [
    { label: "Overall Impact Score", value: "82%", icon: <TrendingUp className="w-5 h-5" />, status: "positive" as const },
    { label: "Financial Viability", value: "High", icon: <CheckCircle2 className="w-5 h-5" />, status: "positive" as const },
    { label: "Member Impact", value: "+15%", icon: <TrendingUp className="w-5 h-5" />, status: "positive" as const },
    { label: "Risk Assessment", value: "Low", icon: <CheckCircle2 className="w-5 h-5" />, status: "positive" as const },
    { label: "Implementation Cost", value: "Moderate", icon: <AlertTriangle className="w-5 h-5" />, status: "warning" as const },
    { label: "Timeline to Effect", value: "3 months", icon: <Minus className="w-5 h-5" />, status: "neutral" as const },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Policy Simulation</h1>
          <p className="text-muted-foreground text-sm mt-1">Compare current vs proposed policies</p>
        </div>

        {/* Policy comparison selector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass-elevated rounded-xl p-6 animate-fade-in border-l-4 border-l-sky-medium">
            <h3 className="font-display font-semibold text-foreground mb-3">Current Policy</h3>
            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-medium text-foreground">Interest Rate Policy</p>
                <p className="text-xs text-muted-foreground mt-1">Annual rate: 5.5% for member loans</p>
                <p className="text-xs text-muted-foreground">Max loan amount: $50,000</p>
                <p className="text-xs text-muted-foreground">Repayment period: 5 years</p>
              </div>
            </div>
          </div>

          <div className="glass-elevated rounded-xl p-6 animate-fade-in border-l-4 border-l-primary">
            <h3 className="font-display font-semibold text-foreground mb-3">Proposed Policy</h3>
            <div className="space-y-3">
              <div className="bg-accent rounded-lg p-4">
                <p className="text-sm font-medium text-foreground">Interest Rate Adjustment</p>
                <p className="text-xs text-accent-foreground mt-1">Annual rate: 4.2% for member loans</p>
                <p className="text-xs text-accent-foreground">Max loan amount: $75,000</p>
                <p className="text-xs text-accent-foreground">Repayment period: 7 years</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => setSimulated(true)}
            className="gradient-primary text-primary-foreground hover:opacity-90 px-8 py-3 text-base"
            size="lg"
          >
            <FlaskConical className="w-5 h-5 mr-2" /> Run Simulation
          </Button>
        </div>

        {simulated && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-elevated rounded-xl p-6">
              <h3 className="font-display font-semibold text-foreground mb-4">Simulation Results — Comparison</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={comparisonData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 25% 90%)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(213 15% 50%)" }} />
                  <YAxis dataKey="metric" type="category" tick={{ fontSize: 12, fill: "hsl(213 15% 50%)" }} width={130} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="hsl(205 85% 85%)" name="Current Policy" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="proposed" fill="hsl(205 85% 50%)" name="Proposed Policy" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((r) => (
                <div key={r.label} className="glass-elevated rounded-xl p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    r.status === "positive" ? "bg-success/10 text-success" :
                    r.status === "warning" ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {r.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="text-lg font-display font-bold text-foreground">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-elevated rounded-xl p-6">
              <h3 className="font-display font-semibold text-foreground mb-3">Simulation Summary</h3>
              <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Recommendation: Approve with modifications</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      The simulation indicates the proposed policy change would result in a <strong>15% improvement</strong> in member satisfaction 
                      and a <strong>12% increase</strong> in loan uptake. Financial viability remains high with minimal risk. 
                      Consider a phased implementation over 3 months to monitor real-world impact against simulated projections.
                    </p>
                  </div>
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
