import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface SubscriptionTierProps {
  name: string;
  description: string;
  price: number;
  features: string[];
  isComingSoon?: boolean;
  isCurrentPlan?: boolean;
  onSelect: () => void;
  priceId?: string;
}

export const SubscriptionTierCard = ({
  name,
  description,
  price,
  features,
  isComingSoon,
  isCurrentPlan,
  onSelect,
  priceId,
}: SubscriptionTierProps) => {
  const { toast } = useToast();

  const { data: currentSubscription } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          status,
          subscription_tiers (
            name
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    }
  });

  const handleUpgrade = async () => {
    if (!priceId) {
      toast({
        title: "Error",
        description: "This tier is not available for purchase yet.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating checkout session with price ID:', priceId);
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "Error",
          description: "Failed to start checkout process. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        if (data.code === 'subscription_exists') {
          toast({
            title: "Subscription Active",
            description: data.error,
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
        }
        return;
      }
      
      if (!data?.url) {
        console.error('No checkout URL returned');
        toast({
          title: "Error",
          description: "Invalid checkout response. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Redirecting to checkout:', data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 md:p-6 flex flex-col h-full">
      <div className="mb-3 md:mb-4">
        <h3 className="text-xl md:text-2xl font-bold">{name}</h3>
        <p className="text-muted-foreground text-sm md:text-base">{description}</p>
      </div>
      
      <div className="mb-4 md:mb-6">
        <span className="text-3xl md:text-4xl font-bold">${price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>
      
      <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm md:text-base">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        onClick={isCurrentPlan ? onSelect : handleUpgrade}
        variant={isCurrentPlan ? "outline" : "default"}
        disabled={isComingSoon || !priceId}
        className="w-full text-sm md:text-base"
      >
        {isComingSoon ? "Coming Soon" : isCurrentPlan ? "Current Plan" : "Upgrade"}
      </Button>
    </Card>
  );
};