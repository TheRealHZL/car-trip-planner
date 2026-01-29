// =============================================================================
// EDGE FUNCTION: geocode-address
// Converts address strings to latitude/longitude coordinates
// Uses Nominatim (OpenStreetMap) for geocoding
// =============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export default async function geocodeAddress(req: Request): Promise<Response> {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();

    if (!address || typeof address !== "string") {
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use Nominatim API (OpenStreetMap) for geocoding
    const encodedAddress = encodeURIComponent(address);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "CarVisitPlanner/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding service error: ${response.status}`);
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({ error: "Address not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result: GeocodeResult = {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
      displayName: results[0].display_name,
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Geocoding error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Geocoding failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
