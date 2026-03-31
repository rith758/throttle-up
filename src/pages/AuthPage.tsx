import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bike } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  if (user) {
    navigate("/");
    return null;
  }

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(form.email.trim(), form.password);
        toast.success("Welcome back! 🏍️");
      } else {
        if (!form.name.trim()) {
          toast.error("Please enter your name");
          setLoading(false);
          return;
        }
        await signUp(form.email.trim(), form.password, form.name.trim());
        toast.success("Account created! Check your email to confirm.");
      }
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card"
      >
        <div className="mb-8 text-center">
          <Bike className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">
            {isLogin ? "Welcome Back" : "Join the Ride"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin ? "Sign in to your account" : "Create your Throttle Up account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Rider" className="mt-1.5 bg-secondary border-border" maxLength={100} />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="rider@example.com" className="mt-1.5 bg-secondary border-border" maxLength={255} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" className="mt-1.5 bg-secondary border-border" maxLength={128} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-fire text-primary-foreground hover:opacity-90" size="lg">
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
