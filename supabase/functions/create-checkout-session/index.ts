import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    console.log('Starting checkout session creation...');
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      console.error('Auth error:', userError);
      throw new Error('Authentication failed');
    }

    const user = userData.user;
    const email = user?.email;

    if (!email) {
      console.error('No email found in user data');
      throw new Error('User email not found');
    }

    console.log('Authenticated user:', email);

    // Get the price ID from the request body
    const { priceId } = await req.json();
    console.log('Received priceId:', priceId);
    
    if (!priceId) {
      console.error('No price ID provided in request body');
      throw new Error('Price ID is required');
    }

    // Check if STRIPE_SECRET_KEY is set
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is not configured');
      throw new Error('Stripe configuration error');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Get or create customer
    console.log('Looking up customer for email:', email);
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customer_id = undefined;
    if (customers.data.length > 0) {
      customer_id = customers.data[0].id;
      console.log('Found existing customer:', customer_id);
      
      // Check if already subscribed
      const subscriptions = await stripe.subscriptions.list({
        customer: customer_id,
        status: 'active',
        price: priceId,
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        console.error('User already has an active subscription for this price');
        throw new Error('You already have an active subscription');
      }
    } else {
      console.log('No existing customer found, will create new one during checkout');
    }

    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      customer_email: customer_id ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/settings?tab=subscription`,
      cancel_url: `${req.headers.get('origin')}/settings?tab=subscription`,
    });

    console.log('Checkout session created successfully:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in checkout session creation:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});