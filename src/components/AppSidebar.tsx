import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, FlaskConical, User, LogOut, Banknote,Wallet } from "lucide-react";

const adminNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/loans", label: "Loan Management", icon: Banknote },
  { to: "/contributions", label: "Contributions", icon: Wallet },
  { to: "/policy", label: "Policy Entry", icon: FileText },
  { to: "/simulation", label: "Simulation", icon: FlaskConical },
  { to: "/profile", label: "Profile", icon: User },
];

const memberNavItems = [
  { to: "/profile", label: "My Profile", icon: User },
];

const AppSidebar = () => {
  const location = useLocation();
  const role = localStorage.getItem("user_role");
  const navItems = role === "admin" ? adminNavItems : memberNavItems;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50">
      <div className="p-6 border-b border-border">
        <h1 className="font-display text-xl font-bold text-gradient">CoopSim</h1>
        <p className="text-xs text-muted-foreground mt-1">Decision Support System</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          to="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
};

export default AppSidebar;