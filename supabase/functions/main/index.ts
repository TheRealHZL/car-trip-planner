// =============================================================================
// SUPABASE EDGE FUNCTIONS - MAIN ENTRY
// Routes requests to individual functions
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Route to geocode-address function
    if (path.includes("/geocode-address")) {
      const { default: geocodeAddress } = await import("../geocode-address/index.ts");
      return geocodeAddress(req);
    }

    // Route to optimize-route function
    if (path.includes("/optimize-route")) {
      const { default: optimizeRoute } = await import("../optimize-route/index.ts");
      return optimizeRoute(req);
    }

    // Default response for unknown routes
    return new Response(
      JSON.stringify({ error: "Function not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
