import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubscriptionTierCard } from "./SubscriptionTierCard";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[] | string;
  is_active: boolean;
}

export const UpgradeModal = ({ isOpen, onClose }: UpgradeModalProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Clean up pointer-events when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.removeProperty('pointer-events');
    };
  }, []);

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: subscriptionTiers } = useQuery({
    queryKey: ['subscriptionTiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      return data as SubscriptionTier[];
    }
  });

  const handleUpgrade = (tierId: string) => {
    navigate('/upgrade');
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      document.body.style.removeProperty('pointer-events');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={`
          w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6
          ${isMobile ? 'z-[300]' : ''}
        `}
      >
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">
            Choose Your Plan
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {subscriptionTiers?.map((tier) => (
            <SubscriptionTierCard
              key={tier.id}
              name={tier.name}
              description={tier.description}
              price={tier.price}
              features={Array.isArray(tier.features) ? tier.features : [tier.features]}
              isComingSoon={tier.name === 'Pro'}
              isCurrentPlan={tier.name === 'Free' && userProfile?.subscription_status === 'free'}
              onSelect={() => handleUpgrade(tier.id)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};