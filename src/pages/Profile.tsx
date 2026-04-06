import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  User, Mail, Phone, Shield, Save, Calendar,
  Wallet, TrendingUp, CreditCard, Clock, CheckCircle2, AlertCircle, XCircle, DollarSign
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { memberApi, type MemberProfile as ProfileType, type MemberContribution as ContributionType,MemberLoan } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import StatCard from "@/components/StatCard";

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  active: { color: "bg-primary/10 text-primary", icon: <CheckCircle2 className="w-3 h-3" /> },
  pending: { color: "bg-warning/10 text-warning", icon: <Clock className="w-3 h-3" /> },
  closed: { color: "bg-muted text-muted-foreground", icon: <XCircle className="w-3 h-3" /> },
};

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [originalProfile, setOriginalProfile] = useState<ProfileType | null>(null)
  const [contributions, setContributions] = useState<ContributionType[]>([]);
  const [loans, setLoans] = useState<MemberLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      memberApi.getProfile().then(setProfile),
      memberApi.getContributions().then(setContributions),
      memberApi.getLoans().then(setLoans),
    ])
      .catch(() => toast({ title: "Failed to load profile", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof ProfileType, value: string) => {
    if (profile) setProfile({ ...profile, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const updateData: ProfileType= {};

      if (profile.first_name !== originalProfile.first_name)
        updateData.first_name = profile.first_name;

      if (profile.last_name !== originalProfile.last_name)
        updateData.last_name = profile.last_name;

      if (profile.phone_number !== originalProfile.phone_number)
        updateData.phone_number = profile.phone_number;
      const updated = await memberApi.updateProfile(updateData);
      console.log("Update response:", updated);
      setProfile(updated);
      console.log("Profile updated successfully:", profile);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast({ title: "Update failed", description: err.message });
      } else {
        toast({ title: "Update failed", description: "An unknown error occurred" });
      }
    } finally {
      setSaving(false);
    }
  };

  const initials = profile ? `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() : "??";

  const totalLoans = loans.length;
  const activeLoans = loans.filter(l => l.loan_status === "active");
  const pendingLoans = loans.filter(l => l.loan_status === "pending");
  const closedLoans = loans.filter(l => l.loan_status === "closed");
  const totalBorrowed = [...activeLoans, ...closedLoans].reduce((s, l) => s + l.loan_amount, 0);
  const totalBalance = loans.reduce((s, l) => s + l.loan_balance, 0);
  const totalContributions = contributions.reduce((s, c) => s + c.contribution_amount, 0);

  const fmt = (n: number) => n.toLocaleString("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        {loading ? (
          <div className="glass-elevated rounded-xl p-8 text-center text-muted-foreground">Loading profile…</div>
        ) : !profile ? (
          <div className="glass-elevated rounded-xl p-8 text-center text-destructive">Failed to load profile.</div>
        ) : (
          <>
            {/* Profile header card */}
            <div className="glass-elevated rounded-xl p-6 animate-fade-in flex items-center gap-5">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shrink-0">
                <span className="text-xl font-display font-bold">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-xl font-bold text-foreground">{profile.first_name} {profile.last_name}</h1>
                {profile.cooperative?.cooperative_name && (
                  <p className="text-sm font-medium text-primary">{profile.cooperative?.cooperative_name}</p>
                )}
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${profile.member_status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                <Shield className="w-3 h-3" /> {profile.member_status ?? "unknown"}
              </span>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Total Contributions" value={fmt(totalContributions)} icon={<Wallet className="w-5 h-5" />} />
              <StatCard title="Active Loans" value={activeLoans.length} subtitle={fmt(activeLoans.reduce((s, l) => s + l.loan_balance, 0)) + " balance"} icon={<CreditCard className="w-5 h-5" />} />
              <StatCard title="Total Borrowed" value={fmt(totalBorrowed)} icon={<DollarSign className="w-5 h-5" />} />
              <StatCard title="All Loans" value={totalLoans} subtitle={`${activeLoans.length} active · ${pendingLoans.length} pending · ${closedLoans.length} closed`} icon={<TrendingUp className="w-5 h-5" />} />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                <TabsTrigger value="loans">Loan History</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <div className="glass-elevated rounded-xl p-6 animate-fade-in">
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input name="first_name" className="pl-10" value={profile.first_name ?? "" } onChange={(e) => handleChange("first_name", e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Last Name</label>
                        <Input name="last_name" value={profile.last_name ?? ""} onChange={(e) => handleChange("last_name", e.target.value)} />
                      </div>
                    </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-10 bg-muted" value={profile.email} type="email" disabled />
                </div>
              </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10" value={profile.phone_number ?? ""} onChange={(e) => handleChange("phone_number", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Role</label>
                        <Input value={profile.role ?? ""} disabled className="bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Join Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input className="pl-10 bg-muted" value={profile.join_date ? new Date(profile.join_date).toLocaleDateString() : ""} disabled />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={saving} className="gradient-primary text-primary-foreground hover:opacity-90">
                      <Save className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Update Profile"}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              {/* Loans Tab */}
              <TabsContent value="loans">
                <div className="glass-elevated rounded-xl p-6 animate-fade-in">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">Loan History</h2>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Loan ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Repayment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Issue Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loans.map((loan) => {
                          const sc = statusConfig[loan.loan_status] ?? statusConfig.pending;
                          return (
                            <TableRow key={loan.loan_id}>
                              <TableCell className="font-medium">LN-{loan.loan_id}</TableCell>
                              <TableCell>{fmt(loan.loan_amount)}</TableCell>
                              <TableCell>{fmt(loan.loan_balance)}</TableCell>
                              <TableCell>{loan.interest_rate}%</TableCell>
                              <TableCell>{fmt(loan.repayment_amount)}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                                  {sc.icon} {loan.loan_status}
                                </span>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{new Date(loan.issue_date).toLocaleDateString()}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              {/* Contributions Tab */}
              <TabsContent value="contributions">
                <div className="glass-elevated rounded-xl p-6 animate-fade-in">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">Contribution History</h2>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contributions.map((c) => (
                          <TableRow key={c.member_contribution_id}>
                            <TableCell className="font-medium">{new Date(c.contribution_date).toLocaleDateString()}</TableCell>
                            <TableCell>{fmt(c.contribution_amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Total Contributions</span>
                    <span className="font-display text-lg font-bold text-primary">{fmt(totalContributions)}</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
