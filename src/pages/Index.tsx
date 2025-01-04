import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CategoryManagement } from "@/components/categories/CategoryManagement";

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        navigate('/login');
        return;
      }

      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        navigate('/login');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl pt-20 px-4">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-lg">Loading...</div>
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