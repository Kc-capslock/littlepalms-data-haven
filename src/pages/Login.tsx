
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
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

  const handleLoginSuccess = (credentialResponse: any) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential) as any;
      
      login({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub
      });
      
      if (isAdmin(password)) {
        setAdminStatus(true);
        toast.success(`Welcome back, ${decoded.name}!`);
        navigate("/");
      } else {
        setLoginError("Incorrect administrator password. Please try again.");
        toast.error("Incorrect administrator password. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  // Handle password-only submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAdmin(password)) {
      // Create a minimal user object if not authenticated via Google
      if (!isAuthenticated) {
        login({
          email: "admin@littlepalms.edu",
          name: "Administrator",
          picture: "/logo-placeholder.png",
          sub: "password-auth"
        });
      }
      
      setAdminStatus(true);
      toast.success("Welcome back, Administrator!");
      navigate("/");
    } else {
      setLoginError("Incorrect administrator password. Please try again.");
      toast.error("Incorrect administrator password. Please try again.");
    }
  };

  // Display a reminder about setting up the Google Client ID
  useEffect(() => {
    toast.info(
      "Note: You need to replace 'YOUR_GOOGLE_CLIENT_ID' in App.tsx with your actual Google OAuth Client ID", 
      { duration: 8000 }
    );
  }, []);

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
              Sign In with Password
            </Button>
            
            <div className="relative flex justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative px-4 text-sm font-medium text-gray-500 bg-white">Or continue with</div>
            </div>
            
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => {
                  console.log("Login Failed");
                  toast.error("Login failed. Please try again.");
                }}
                useOneTap
              />
            </div>
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
