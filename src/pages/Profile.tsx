import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Building, Phone, Shield, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { memberApi, type MemberProfile as ProfileType } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    memberApi.getProfile()
      .then(setProfile)
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
      const updated = await memberApi.updateProfile(profile);
      setProfile(updated);
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const initials = profile ? `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() : "??";

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Member Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account information</p>
        </div>

        {loading ? (
          <div className="glass-elevated rounded-xl p-8 text-center text-muted-foreground">Loading profile…</div>
        ) : profile ? (
          <div className="glass-elevated rounded-xl p-8 animate-fade-in">
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-border">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground">
                <span className="text-2xl font-display font-bold">{initials}</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">{profile.first_name} {profile.last_name}</h2>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                  <Shield className="w-3 h-3" /> Active Member
                </span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10" value={profile.first_name} onChange={(e) => handleChange("first_name", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <Input value={profile.last_name} onChange={(e) => handleChange("last_name", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-10" value={profile.email} type="email" onChange={(e) => handleChange("email", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-10" value={profile.phone ?? ""} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cooperative</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-10" value={profile.cooperative ?? ""} onChange={(e) => handleChange("cooperative", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <Input value={profile.role ?? ""} disabled className="bg-muted" />
              </div>

              <Button type="submit" disabled={saving} className="gradient-primary text-primary-foreground hover:opacity-90">
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Update Profile"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="glass-elevated rounded-xl p-8 text-center text-destructive">Failed to load profile.</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
