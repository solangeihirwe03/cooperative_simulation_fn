import { Search, Users } from "lucide-react";
import type { AdminMember } from "@/lib/api";

interface MemberListProps {
  members: AdminMember[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  selectedMemberId?: number;
  onSelectMember: (member: AdminMember) => void;
}

const MemberList = ({ members, loading, search, onSearchChange, selectedMemberId, onSelectMember }: MemberListProps) => {
  const filtered = members.filter(
    (m) =>
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lg:col-span-2 glass-elevated rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-foreground">Members</h2>
        <span className="ml-auto text-xs text-muted-foreground">{members.length} total</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading members...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No members found</p>
        ) : (
          filtered.map((m) => (
            <button
              key={m.member_id}
              onClick={() => onSelectMember(m)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm ${
                selectedMemberId === m.member_id
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted border border-transparent"
              }`}
            >
              <p className="font-medium text-foreground">
                {m.first_name} {m.last_name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    m.member_status === "active" ? "bg-success" : "bg-warning"
                  }`}
                />
                <span className="text-xs text-muted-foreground capitalize">{m.member_status}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberList;
