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

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal = ({ isOpen, onClose }: UpgradeModalProps) => {
  const navigate = useNavigate();

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
      return data;
    }
  });

  const handleUpgrade = (tierId: string) => {
    // For now, just navigate to the upgrade page
    // This will be replaced with actual payment integration
    navigate('/upgrade');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">
            Choose Your Plan
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionTiers?.map((tier) => (
            <SubscriptionTierCard
              key={tier.id}
              name={tier.name}
              description={tier.description}
              price={tier.price}
              features={tier.features}
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