import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
}

const StatCard = ({ title, value, subtitle, icon, trend }: StatCardProps) => (
  <div className="glass-elevated rounded-xl p-6 animate-fade-in">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-display font-bold text-foreground mt-2">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <p className={`text-xs font-medium mt-2 ${trend.positive ? "text-success" : "text-destructive"}`}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground">
        {icon}
      </div>
    </div>
  </div>
);

export default StatCard;
