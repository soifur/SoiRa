import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log('Processing event:', event.type);

    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      
      if (!customer.email) {
        throw new Error('No customer email found');
      }

      // Get user by email
      const { data: userData, error: userError } = await supabaseClient
        .from('profiles')
        .select('id, role')
        .eq('email', customer.email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      // Update user role and subscription status
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ 
          role: 'paid_user',
          subscription_status: subscription.status 
        })
        .eq('id', userData.id);

      if (updateError) {
        throw updateError;
      }

      // Update user_subscriptions table
      const { error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: userData.id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end
        });

      if (subscriptionError) {
        throw subscriptionError;
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      
      if (!customer.email) {
        throw new Error('No customer email found');
      }

      // Get user by email
      const { data: userData, error: userError } = await supabaseClient
        .from('profiles')
        .select('id, role')
        .eq('email', customer.email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      // Update user role back to regular user
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ 
          role: 'user',
          subscription_status: 'canceled' 
        })
        .eq('id', userData.id);

      if (updateError) {
        throw updateError;
      }

      // Update user_subscriptions table
      const { error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: true
        })
        .eq('user_id', userData.id);

      if (subscriptionError) {
        throw subscriptionError;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});