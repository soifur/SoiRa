import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, PoundSterling, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface UserSubscription {
  id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  subscription_tiers: {
    name: string;
    price: number;
    description: string;
    features: string[];
  };
}

export const SubscriptionSettings = () => {
  const { toast } = useToast();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['userSubscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          status,
          current_period_end,
          cancel_at_period_end,
          subscription_tiers (
            name,
            price,
            description,
            features
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as UserSubscription;
    }
  });

  const handleCancel = async () => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('id', subscription?.id);

      if (error) throw error;

      toast({
        title: "Subscription cancelled",
        description: "Your subscription will end at the end of the current period",
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  const handleRenew = async () => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ cancel_at_period_end: false })
        .eq('id', subscription?.id);

      if (error) throw error;

      toast({
        title: "Subscription renewed",
        description: "Your subscription will automatically renew",
      });
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to renew subscription",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!subscription) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
          <p className="text-muted-foreground mb-4">Upgrade to access premium features</p>
          <Button>Upgrade Now</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{subscription.subscription_tiers.name}</h3>
          <p className="text-muted-foreground">{subscription.subscription_tiers.description}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xl font-bold">
            <PoundSterling className="h-5 w-5" />
            {subscription.subscription_tiers.price}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Next billing date: {format(new Date(subscription.current_period_end), 'PP')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4" />
          <span>Payment method ending in •••• 4242</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4" />
          <span>
            {subscription.cancel_at_period_end
              ? "Your subscription will end on "
              : "Your subscription will automatically renew on "}
            {format(new Date(subscription.current_period_end), 'PP')}
          </span>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Features</h4>
            {subscription.cancel_at_period_end ? (
              <Button onClick={handleRenew} variant="outline">
                Resume Subscription
              </Button>
            ) : (
              <Button onClick={handleCancel} variant="outline">
                Cancel Subscription
              </Button>
            )}
          </div>
          <ul className="mt-2 space-y-2">
            {subscription.subscription_tiers.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};