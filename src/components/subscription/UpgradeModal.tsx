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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-4xl overflow-y-auto",
        isMobile && "h-[90vh] p-4"
      )}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">
            Choose Your Plan
          </DialogTitle>
        </DialogHeader>
        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1" : "grid-cols-3"
        )}>
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