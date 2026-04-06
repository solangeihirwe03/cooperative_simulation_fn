import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      navigate("/register");
      return;
    }

    navigate(role === "admin" ? "/dashboard" : "/profile");
  };
  return (
    <div className="min-h-screen gradient-hero">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <h1 className="font-display text-xl font-bold text-gradient">CoopSim</h1>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-foreground hover:bg-accent">Sign In</Button>
          </Link>
          <Button
            onClick={handleGetStarted}
            className="gradient-primary text-primary-foreground hover:opacity-90"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="max-w-2xl animate-fade-in">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground mb-6">
            Cooperative Decision Support
          </span>
          <h2 className="font-display text-5xl font-extrabold text-foreground leading-tight">
            Simulate policies<br />
            <span className="text-gradient">before you implement</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-6 leading-relaxed max-w-lg">
            Make data-driven decisions for your cooperative. Compare current and proposed policies with real-time simulation and impact analysis.
          </p>
          <div className="flex items-center gap-4 mt-8">
            <Button
              onClick={handleGetStarted}
              className="gradient-primary text-primary-foreground hover:opacity-90 px-6 py-3"
              size="lg"
            >
              Start Simulating
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Link to="/login">
              <Button variant="outline" className="border-border text-foreground hover:bg-accent" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <BarChart3 className="w-6 h-6" />, title: "Policy Comparison", desc: "Side-by-side comparison of current vs proposed policies with visual analytics." },
            { icon: <Zap className="w-6 h-6" />, title: "Real-Time Simulation", desc: "Instant impact analysis showing projected outcomes across key metrics." },
            { icon: <Shield className="w-6 h-6" />, title: "Risk Assessment", desc: "Comprehensive risk scoring to ensure policy changes protect member interests." },
          ].map((f) => (
            <div key={f.title} className="glass-elevated rounded-xl p-6 animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground mb-4">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
};

export default Index;
