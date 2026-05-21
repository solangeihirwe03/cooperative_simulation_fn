import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import AppSidebar from "./AppSidebar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-card border-b border-border">
        <h1 className="font-display text-lg font-bold text-gradient">CoopSim</h1>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 z-40">
        <AppSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 animate-in slide-in-from-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-[-44px] p-2 rounded-md bg-card border border-border"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <AppSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
