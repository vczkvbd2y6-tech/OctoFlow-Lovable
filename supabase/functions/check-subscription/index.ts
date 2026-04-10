import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No auth header — returning 401");
      return new Response(JSON.stringify({ error: "Authorization header not provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Auth error", { message: userError.message });
      return new Response(JSON.stringify({ error: `Authentication error: ${userError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email unavailable");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Stripe customer found", { customerId });

    // Check for active recurring subscription (Pro Monthly)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      const subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: sub.id });
      return new Response(
        JSON.stringify({ subscribed: true, tier: "pro_monthly", subscription_end: subscriptionEnd }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check for trialing subscription
    const trialSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    });
    if (trialSubs.data.length > 0) {
      const sub = trialSubs.data[0];
      const subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      logStep("Trialing subscription found", { subscriptionId: sub.id });
      return new Response(
        JSON.stringify({ subscribed: true, tier: "pro_monthly", subscription_end: subscriptionEnd }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check for lifetime one-time payment (succeeded payment for Lifetime Pro product)
    const LIFETIME_PRODUCT_ID = "prod_UIX2veQW1UTJhR";
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 20,
    });

    for (const pi of paymentIntents.data) {
      if (pi.status !== "succeeded") continue;
      // Check if this payment was for the lifetime product via checkout session
      try {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: pi.id,
          limit: 1,
        });
        for (const sess of sessions.data) {
          if (sess.status === "complete") {
            const lineItems = await stripe.checkout.sessions.listLineItems(sess.id, { limit: 5 });
            for (const item of lineItems.data) {
              if (item.price?.product === LIFETIME_PRODUCT_ID) {
                logStep("Lifetime purchase found", { paymentIntentId: pi.id });
                return new Response(
                  JSON.stringify({ subscribed: true, tier: "pro_lifetime", subscription_end: null }),
                  { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
                );
              }
            }
          }
        }
      } catch (e) {
        logStep("Error checking payment intent", { piId: pi.id, error: String(e) });
      }
    }

    logStep("No active subscription or lifetime purchase found");
    return new Response(
      JSON.stringify({ subscribed: false, tier: "free", subscription_end: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("Error", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
