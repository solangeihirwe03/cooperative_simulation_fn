import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useFormik } from "formik";
import * as Yup from "yup";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required")
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await authApi.login({
          email: values.email,
          password: values.password
        });
        setAuth(res.access_token, res.user);
        if (res.role === "admin") {
          navigate("/dashboard");
        } else if (res.role === "member") {
          navigate("/profile");
        } else {
          navigate("/");
        }

        toast({ title: "Logged in successfully!" });
      } catch (err: unknown) {
        console.error("Login error:", err);
        toast({ title: "Login failed", description: (err as Error).message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient">CoopSim</h1>
          <p className="text-muted-foreground mt-2 text-sm">Decision Support System</p>
        </div>

        <div className="glass-elevated rounded-2xl p-8">
          <h2 className="font-display text-xl font-semibold text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

          <form className="space-y-4" onSubmit={formik.handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="email"
                  className={`pl-10${
              formik.touched.email && formik.errors.email ? "border-red-500" : ""
            }`}
                  placeholder="member@cooperative.org"
                  type="email" {...formik.getFieldProps("email")}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="password"
                  className={`pl-10 pr-10 ${
              formik.touched.password && formik.errors.password
                ? "border-red-500"
                : ""
            }`}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"} {...formik.getFieldProps("password")}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>
              <a href="#" className="text-primary hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity mt-2">
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
