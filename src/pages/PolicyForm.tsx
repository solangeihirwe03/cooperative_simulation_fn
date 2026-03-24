import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Save } from "lucide-react";
import { useState } from "react";

const PolicyForm = () => {
  const [policies, setPolicies] = useState([
    { id: 1, name: "Interest Rate Policy", category: "Finance", status: "Active", description: "Current interest rate at 5.5% for all member loans." },
    { id: 2, name: "Membership Fee Structure", category: "Membership", status: "Active", description: "Annual membership fee of $50 with sliding scale." },
    { id: 3, name: "Dividend Distribution", category: "Finance", status: "Under Review", description: "Quarterly dividend based on patronage." },
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Policy Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and manage cooperative policies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 glass-elevated rounded-xl p-6 animate-fade-in h-fit">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> New Policy
            </h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Policy Name</label>
                <Input placeholder="e.g., Loan Interest Rate Adjustment" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option>Finance</option>
                  <option>Membership</option>
                  <option>Governance</option>
                  <option>Operations</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea placeholder="Describe the policy details, parameters, and expected outcomes..." rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Current Value</label>
                  <Input placeholder="e.g., 5.5%" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Proposed Value</label>
                  <Input placeholder="e.g., 4.8%" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Effective Date</label>
                <Input type="date" />
              </div>
              <Button className="w-full gradient-primary text-primary-foreground hover:opacity-90">
                <Save className="w-4 h-4 mr-2" /> Save & Simulate
              </Button>
            </form>
          </div>

          {/* Existing policies */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Current Policies
            </h3>
            {policies.map((policy) => (
              <div key={policy.id} className="glass-elevated rounded-xl p-5 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-semibold text-foreground">{policy.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{policy.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      policy.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {policy.status}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{policy.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PolicyForm;
