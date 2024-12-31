import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        toast({
          title: "Error",
          description: "Failed to check login status",
          variant: "destructive",
        });
        return;
      }

      if (session) {
        navigate("/");
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Add a small delay to allow for profile creation
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="container mx-auto max-w-md pt-20">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to SoiRa</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Sign in with your email to get started
        </p>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                }
              }
            },
            className: {
              container: 'flex flex-col gap-4',
              button: 'bg-primary text-primary-foreground hover:bg-primary/90',
              input: 'bg-background',
              label: 'text-foreground',
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
        />
      </Card>
    </div>
  );
};

export default Login;