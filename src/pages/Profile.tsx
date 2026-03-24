import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Building, Phone, Shield, Save } from "lucide-react";

const Profile = () => (
  <DashboardLayout>
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Member Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account information</p>
      </div>

      <div className="glass-elevated rounded-xl p-8 animate-fade-in">
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-border">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground">
            <span className="text-2xl font-display font-bold">JD</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">John Doe</h2>
            <p className="text-sm text-muted-foreground">Member since January 2024</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
              <Shield className="w-3 h-3" /> Active Member
            </span>
          </div>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-10" defaultValue="John" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <Input defaultValue="Doe" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" defaultValue="john.doe@cooperative.org" type="email" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" defaultValue="+1 (555) 123-4567" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Cooperative</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" defaultValue="Springfield Credit Union" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option>Board Member</option>
              <option>Manager</option>
              <option>Regular Member</option>
              <option>Observer</option>
            </select>
          </div>

          <Button className="gradient-primary text-primary-foreground hover:opacity-90">
            <Save className="w-4 h-4 mr-2" /> Update Profile
          </Button>
        </form>
      </div>
    </div>
  </DashboardLayout>
);

export default Profile;
