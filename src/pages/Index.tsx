import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CategoryManagement } from "@/components/categories/CategoryManagement";

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index: Component mounted");
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    console.log("Index: Checking admin status...");
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("Index: User data received:", user);
      
      if (userError) {
        console.error("Index: Error fetching user:", userError);
        setDebugInfo(prev => ({ ...prev, userError }));
        navigate('/login');
        return;
      }

      if (!user) {
        console.log("Index: No user found, redirecting to login");
        setDebugInfo(prev => ({ ...prev, noUser: true }));
        navigate('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log("Index: Profile data received:", profile);
      
      if (profileError) {
        console.error("Index: Error fetching profile:", profileError);
        setDebugInfo(prev => ({ ...prev, profileError }));
        navigate('/login');
        return;
      }

      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        console.log("Index: User is not admin, redirecting");
        setDebugInfo(prev => ({ 
          ...prev, 
          notAdmin: true, 
          userRole: profile?.role 
        }));
        navigate('/login');
        return;
      }

      console.log("Index: User confirmed as admin");
      setDebugInfo(prev => ({ 
        ...prev, 
        isAdmin: true, 
        userRole: profile.role 
      }));
      setIsAdmin(true);
      setLoading(false);
    } catch (error) {
      console.error("Index: Unexpected error:", error);
      setDebugInfo(prev => ({ ...prev, unexpectedError: error }));
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl pt-20 px-4">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-lg mb-4">Loading...</div>
          <div className="text-sm text-muted-foreground">
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-w-xl">
              Debug Information:
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl pt-20 px-4">
      <CategoryManagement />
    </div>
  );
};

export default Index;