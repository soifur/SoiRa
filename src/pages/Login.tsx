import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email !== "soifur2@gmail.com" && !isSignUp) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "This application is restricted to authorized users only.",
      });
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'user'
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p className="text-muted-foreground mt-2">
            {isSignUp ? "Please sign up to continue" : "Please sign in to continue"}
          </p>
        </div>
        <form onSubmit={handleAuth} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-4">
            <Button type="submit" className="w-full">
              {isSignUp ? "Sign up" : "Sign in"}
            </Button>
            {!isSignUp && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsSignUp(true)}
              >
                Create new account
              </Button>
            )}
            {isSignUp && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsSignUp(false)}
              >
                Back to login
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;