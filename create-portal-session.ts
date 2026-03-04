// ============================================
// BIENENPLAN – SUPABASE EDGE FUNCTION
// create-portal-session
//
// Erstellt eine Stripe Customer Portal Session
// Damit können Kunden selbst:
// - Abo kündigen / pausieren
// - Zahlungsmethode ändern
// - Rechnungen einsehen
// - Plan wechseln
// ============================================
// Deploy mit: supabase functions deploy create-portal-session --no-verify-jwt
// ============================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // CORS Preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Auth prüfen
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Nicht eingeloggt" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Supabase Client mit User-Token
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Nicht authentifiziert" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Stripe Customer ID holen
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            return new Response(JSON.stringify({ error: "Kein aktives Abonnement gefunden. Bitte zuerst ein Upgrade durchführen." }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Portal Session erstellen
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: "https://bienenplan.de/app.html",
        });

        // 4. URL zurückgeben
        return new Response(
            JSON.stringify({ url: session.url }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );

    } catch (err) {
        console.error("Portal Error:", err);
        return new Response(
            JSON.stringify({ error: err.message }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
