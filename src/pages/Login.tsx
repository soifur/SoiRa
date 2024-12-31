import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
      
      // Handle auth errors
      if (event === 'USER_DELETED' || event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully."
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="container mx-auto max-w-md pt-20">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to SoiRa</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Sign up with your email to get started. If you already have an account, sign in.
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
            }
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/login`}
          onError={(error) => {
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message
            });
          }}
        />
      </Card>
    </div>
  );
};

export default Login;