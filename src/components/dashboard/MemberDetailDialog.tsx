import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { adminApi, type AdminMember, type MemberRole, type MemberStatus } from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";

interface Props {
  member: AdminMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  inactive: "bg-muted text-muted-foreground border-border",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
};

const MemberDetailDialog = ({ member, open, onOpenChange, onUpdated }: Props) => {
  const [updating, setUpdating] = useState(false);

  if (!member) return null;

  const handleRoleChange = async (role: MemberRole) => {
    setUpdating(true);
    try {
      await adminApi.updateMemberRole(member.member_id, role);
      toast.success("Role updated");
      onUpdated();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (status: MemberStatus) => {
    setUpdating(true);
    try {
      await adminApi.updateMemberStatus(member.member_id, status);
      toast.success("Status updated");
      onUpdated();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {member.first_name} {member.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{member.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{member.phone_number}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">Joined {new Date(member.join_date).toLocaleDateString()}</span>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="w-4 h-4 text-primary" />
                Role
              </div>
              <Select defaultValue={member.role} onValueChange={(v) => handleRoleChange(v as MemberRole)} disabled={updating}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Status</span>
              <Select defaultValue={member.member_status} onValueChange={(v) => handleStatusChange(v as MemberStatus)} disabled={updating}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailDialog;
