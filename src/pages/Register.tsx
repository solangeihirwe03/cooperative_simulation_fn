import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Building, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RegisterFormValues } from "@/utils/members/members";


const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      cooperativeName: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
      phoneNumber: Yup.string().required("Phone number is required"),
      cooperativeName: Yup.string().required("Cooperative name is required"),
    }),
    onSubmit: async (values: RegisterFormValues) => {
      setLoading(true);
      try {
        const payload = {
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          password: values.password,
          phone_number: values.phoneNumber,
          cooperative_name: values.cooperativeName,
        };
        const res =await authApi.register(payload);
        toast({ title: "Account created!" });
        navigate("/login");
      } catch (err: unknown) {
        toast({ title: "Registration failed", description: (err as Error).message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  });

  const { toast } = useToast();

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient">CoopSim</h1>
          <p className="text-muted-foreground mt-2 text-sm">Decision Support System</p>
        </div>

        <div className="glass-elevated rounded-2xl p-8">
          <h2 className="font-display text-xl font-semibold text-foreground mb-1">Create account</h2>
          <p className="text-sm text-muted-foreground mb-6">Join your cooperative</p>

          <form className="space-y-4" onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    name="firstName"
                    className="pl-10"
                    placeholder="John"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.firstName}
                  />
                </div>
                {formik.touched.firstName &&
                  typeof formik.errors.firstName === "string" && (
                    <p className="text-xs text-destructive">
                      {formik.errors.firstName}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.lastName &&
                  typeof formik.errors.lastName === "string" && (
                    <p className="text-xs text-destructive">
                      {formik.errors.lastName}
                    </p>
                  )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="phoneNumber"
                  type="text"
                  className="pl-10"
                  placeholder="Your phone number"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
              </div>
              {formik.touched.phoneNumber &&
                typeof formik.errors.phoneNumber === "string" && (
                  <p className="text-xs text-destructive">
                    {formik.errors.phoneNumber}
                  </p>
                )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Cooperative</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="cooperativeName"
                  type="text"
                  className="pl-10"
                  placeholder="Your cooperative name"
                  value={formik.values.cooperativeName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
              </div>
              {formik.touched.cooperativeName &&
                typeof formik.errors.cooperativeName === "string" && (
                  <p className="text-xs text-destructive">
                    {formik.errors.cooperativeName}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="email"
                  type="email"
                  className="pl-10"
                  placeholder="member@cooperative.org"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.email &&
                typeof formik.errors.email === "string" && (
                  <p className="text-xs text-destructive">
                    {formik.errors.email}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="password"
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formik.touched.password &&
                typeof formik.errors.password === "string" && (
                  <p className="text-xs text-destructive">{formik.errors.password}</p>
                )}
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity mt-2">
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
