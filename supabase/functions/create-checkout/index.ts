import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

const PRO_MONTHLY_PRICE_ID = "price_1TJvyGCayVIz9m5dR7dycE36";
const LIFETIME_PRO_PRICE_ID = "price_1TJvyHCayVIz9m5dcOFl1nxw";

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
    if (!authHeader) throw new Error("Authorization header not provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email unavailable");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body to determine plan type
    let plan = "pro_monthly";
    try {
      const body = await req.json();
      if (body.plan === "pro_lifetime") plan = "pro_lifetime";
    } catch {
      // Default to monthly if no body
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });

      if (plan === "pro_monthly") {
        // Check if already subscribed
        const subs = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });
        if (subs.data.length > 0) {
          logStep("User already has active subscription");
          return new Response(
            JSON.stringify({ error: "You already have an active subscription." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
      }
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const isLifetime = plan === "pro_lifetime";
    const priceId = isLifetime ? LIFETIME_PRO_PRICE_ID : PRO_MONTHLY_PRICE_ID;

    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isLifetime ? "payment" : "subscription",
      success_url: `${origin}/account?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    };

    // Admin-granted free accounts
    const FREE_COUPON_EMAILS = ["haydengfacey@gmail.com"];
    const FREE_COUPON_ID = "ZR9mAuP1";
    if (!isLifetime && FREE_COUPON_EMAILS.includes(user.email.toLowerCase())) {
      sessionParams.discounts = [{ coupon: FREE_COUPON_ID }];
      logStep("Applying free coupon", { email: user.email });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, plan });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("Error", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
