import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/AuthCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Shield, Eye, EyeOff, Loader2, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, user, isAdmin, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin-dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setIsLoading(false);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      return;
    }

    // Wait a moment for role check to complete
    setTimeout(async () => {
      setIsLoading(false);
      // The useEffect will handle redirect if user is admin
      // If not admin, show error
      toast({
        title: "Checking permissions...",
        description: "Verifying admin access",
      });
    }, 1000);
  };

  // Show message if logged in but not admin
  useEffect(() => {
    if (!authLoading && user && !isAdmin && !isLoading) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges. Please contact support.",
        variant: "destructive",
      });
    }
  }, [user, isAdmin, authLoading, isLoading]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <AuthCard
          title="Admin Login"
          subtitle="Access the administration panel"
          icon={<Shield className="h-6 w-6 text-primary-foreground" />}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={isLoading || authLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login as Admin"
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
            <Shield className="mx-auto mb-1 h-4 w-4" />
            This is a secure admin area. Unauthorized access is prohibited.
          </div>

          <div className="mt-4 text-center">
            <Link 
              to="/client-login" 
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <User className="h-4 w-4" />
              Go to Client Login
            </Link>
          </div>
        </AuthCard>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default AdminLogin;
