
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
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
      toast.success(`Welcome back, ${decoded.name}!`);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
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
          
          <div className="w-full space-y-4">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative px-4 text-sm font-medium text-gray-500 bg-white">Continue with</div>
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          Administrator access only
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
