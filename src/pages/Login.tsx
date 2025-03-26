
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, setAdminStatus } = useAuth();
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Handle password submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAdmin(password)) {
      // Create a minimal user object
      login({
        email: "admin@littlepalms.edu",
        name: "Administrator",
        picture: "/logo-placeholder.png",
        sub: "password-auth"
      });
      
      setAdminStatus(true);
      toast.success("Welcome back, Administrator!");
      navigate("/");
    } else {
      setLoginError("Incorrect administrator password. Please try again.");
      toast.error("Incorrect administrator password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Little Palms Pre-School</CardTitle>
          <CardDescription>Sign in to access the school management system</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 p-6">
          <img 
            src="/logo-placeholder.png" 
            alt="Little Palms Logo" 
            className="w-24 h-24 rounded-full bg-primary/10 p-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/100?text=LP";
            }}
          />
          
          <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
            {loginError && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
                {loginError}
              </div>
            )}
            
            <div className="w-full">
              <label htmlFor="password" className="text-sm font-medium">
                Administrator Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="mt-1"
              />
            </div>
            
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          Administrator access requires password
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
