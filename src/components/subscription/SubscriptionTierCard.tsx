import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionTierProps {
  name: string;
  description: string;
  price: number;
  features: string[];
  isComingSoon?: boolean;
  isCurrentPlan?: boolean;
  onSelect: () => void;
}

export const SubscriptionTierCard = ({
  name,
  description,
  price,
  features,
  isComingSoon,
  isCurrentPlan,
  onSelect,
}: SubscriptionTierProps) => {
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
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
        disabled={isComingSoon}
        className="w-full text-sm md:text-base"
      >
        {isComingSoon ? "Coming Soon" : isCurrentPlan ? "Current Plan" : "Upgrade"}
      </Button>
    </Card>
  );
};