import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SubscriptionTierCard } from "./SubscriptionTierCard";

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
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogClose>
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