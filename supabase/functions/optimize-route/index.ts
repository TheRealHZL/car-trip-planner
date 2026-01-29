// =============================================================================
// EDGE FUNCTION: optimize-route
// Optimizes visit order using nearest neighbor algorithm
// =============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Location {
  id: string;
  latitude: number;
  longitude: number;
}

interface OptimizeRouteRequest {
  locations: Location[];
  startLatitude: number;
  startLongitude: number;
}

interface OptimizeRouteResponse {
  orderedIds: string[];
  totalDistanceKm: number;
  segments: Array<{
    fromId: string | null;
    toId: string;
    distanceKm: number;
  }>;
}

// Haversine formula for distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Nearest neighbor algorithm
function optimizeRoute(
  locations: Location[],
  startLat: number,
  startLon: number
): OptimizeRouteResponse {
  if (locations.length === 0) {
    return { orderedIds: [], totalDistanceKm: 0, segments: [] };
  }

  const unvisited = [...locations];
  const ordered: Location[] = [];
  const segments: OptimizeRouteResponse["segments"] = [];
  let currentLat = startLat;
  let currentLon = startLon;
  let totalDistance = 0;
  let previousId: string | null = null;

  while (unvisited.length > 0) {
    // Find nearest unvisited location
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const loc = unvisited[i];
      const distance = calculateDistance(
        currentLat,
        currentLon,
        loc.latitude,
        loc.longitude
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    // Move to nearest location
    const nearest = unvisited.splice(nearestIndex, 1)[0];
    ordered.push(nearest);

    segments.push({
      fromId: previousId,
      toId: nearest.id,
      distanceKm: Math.round(nearestDistance * 100) / 100,
    });

    totalDistance += nearestDistance;
    currentLat = nearest.latitude;
    currentLon = nearest.longitude;
    previousId = nearest.id;
  }

  return {
    orderedIds: ordered.map((loc) => loc.id),
    totalDistanceKm: Math.round(totalDistance * 100) / 100,
    segments,
  };
}

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: OptimizeRouteRequest = await req.json();
    const { locations, startLatitude, startLongitude } = body;

    // Validate input
    if (!locations || !Array.isArray(locations)) {
      return new Response(
        JSON.stringify({ error: "locations array is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (typeof startLatitude !== "number" || typeof startLongitude !== "number") {
      return new Response(
        JSON.stringify({ error: "startLatitude and startLongitude are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Filter locations with valid coordinates
    const validLocations = locations.filter(
      (loc) =>
        loc.id &&
        typeof loc.latitude === "number" &&
        typeof loc.longitude === "number"
    );

    // Optimize route
    const result = optimizeRoute(validLocations, startLatitude, startLongitude);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Route optimization error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Route optimization failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
