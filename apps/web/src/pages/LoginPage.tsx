import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, ArrowRight, Sparkles, User, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError("Please fill out all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Dummy Hackathon Auth: Just hit /api/v1/auth/login with the email
      // We don't even need the password or to distinguish register vs login
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Authentication failed.");
        return;
      }

      const data = await response.json();
      
      if (data.access_token) {
        loginStore(data.access_token);
        navigate("/");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-background">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-70 animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-70 animate-pulse delay-1000" />
      
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-4 transition-transform hover:scale-105">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Antigravity Workspace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in or create an account to access the control panel
          </p>
        </div>

        {/* Card Form */}
        <Card className="border border-border/50 shadow-xl backdrop-blur-sm bg-card/95 transition-all">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {isRegister ? "Create an account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {isRegister 
                ? "Enter your details below to register your workspace account" 
                : "Enter your credentials to access your account"
              }
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-xs font-medium rounded-lg bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200">
                  {error}
                </div>
              )}

              {isRegister && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Password
                  </label>
                  {!isRegister && (
                    <a href="#forgot" className="text-xs text-primary hover:underline font-medium" onClick={(e) => e.preventDefault()}>
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 mt-2">
              <Button 
                type="submit" 
                className="w-full h-10 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isRegister ? "Register" : "Sign In"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>

              <div className="relative flex py-1 items-center w-full">
                <div className="flex-grow border-t border-border/50"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase tracking-wider font-semibold">Or continue with</span>
                <div className="flex-grow border-t border-border/50"></div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-10 hover:bg-muted font-medium cursor-pointer" 
                  onClick={() => {
                    setEmail("admin@example.com");
                    setPassword("admin123");
                    setName("Admin User");
                    setIsRegister(false);
                  }}
                >
                  Demo Admin
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-10 hover:bg-muted font-medium cursor-pointer" 
                  onClick={() => {
                    setEmail("user@example.com");
                    setPassword("user123");
                    setName("Demo User");
                    setIsRegister(false);
                  }}
                >
                  Demo User
                </Button>
              </div>

              <div className="text-center text-sm mt-2">
                <span className="text-muted-foreground">
                  {isRegister ? "Already have an account? " : "New to the template? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                  }}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                  disabled={isLoading}
                >
                  {isRegister ? "Sign In" : "Register now"}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
