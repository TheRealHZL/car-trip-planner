import { VehicleWithDealer, RankedVehicle } from '@/types';

// Haversine formula to calculate distance between two points
export function calculateDistance(
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
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Scoring weights (can be made configurable)
export interface ScoringWeights {
  priorityWeight: number;  // Higher = more important
  priceWeight: number;     // Higher = favor lower prices
  distanceWeight: number;  // Higher = favor closer vehicles
}

export const defaultWeights: ScoringWeights = {
  priorityWeight: 40,
  priceWeight: 30,
  distanceWeight: 30,
};

// Calculate visit score for a vehicle
export function calculateVisitScore(
  vehicle: VehicleWithDealer,
  startLat: number,
  startLng: number,
  maxPrice: number,
  weights: ScoringWeights = defaultWeights
): { score: number; distanceKm: number | null } {
  let distanceKm: number | null = null;
  
  // Priority score (1-5 -> 0-100)
  const priorityScore = ((vehicle.priority - 1) / 4) * 100;
  
  // Price score (lower is better, 0-100)
  let priceScore = 50; // Default if no price
  if (vehicle.price && maxPrice > 0) {
    priceScore = Math.max(0, 100 - (vehicle.price / maxPrice) * 100);
  }
  
  // Distance score (closer is better, 0-100)
  let distanceScore = 50; // Default if no coordinates
  if (vehicle.dealer?.latitude && vehicle.dealer?.longitude) {
    distanceKm = calculateDistance(
      startLat,
      startLng,
      vehicle.dealer.latitude,
      vehicle.dealer.longitude
    );
    // Assume max relevant distance is 100km
    distanceScore = Math.max(0, 100 - (distanceKm / 100) * 100);
  }
  
  // Weighted total score
  const totalWeight = weights.priorityWeight + weights.priceWeight + weights.distanceWeight;
  const score = (
    (priorityScore * weights.priorityWeight) +
    (priceScore * weights.priceWeight) +
    (distanceScore * weights.distanceWeight)
  ) / totalWeight;
  
  return { score: Math.round(score * 10) / 10, distanceKm };
}

// Rank vehicles by score
export function rankVehicles(
  vehicles: VehicleWithDealer[],
  startLat: number,
  startLng: number,
  weights: ScoringWeights = defaultWeights
): RankedVehicle[] {
  // Only consider open vehicles
  const openVehicles = vehicles.filter(v => v.status === 'open');
  
  // Find max price for normalization
  const prices = openVehicles
    .filter(v => v.price !== null)
    .map(v => v.price as number);
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 50000;
  
  // Calculate scores
  const rankedVehicles: RankedVehicle[] = openVehicles.map(vehicle => {
    const { score, distanceKm } = calculateVisitScore(
      vehicle,
      startLat,
      startLng,
      maxPrice,
      weights
    );
    return { ...vehicle, score, distanceKm };
  });
  
  // Sort by score descending
  return rankedVehicles.sort((a, b) => b.score - a.score);
}

// Optimize route order using nearest neighbor algorithm
export function optimizeRouteOrder(
  vehicles: RankedVehicle[],
  startLat: number,
  startLng: number
): RankedVehicle[] {
  if (vehicles.length <= 1) return vehicles;
  
  const result: RankedVehicle[] = [];
  const remaining = [...vehicles];
  let currentLat = startLat;
  let currentLng = startLng;
  
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const vehicle = remaining[i];
      if (vehicle.dealer?.latitude && vehicle.dealer?.longitude) {
        const distance = calculateDistance(
          currentLat,
          currentLng,
          vehicle.dealer.latitude,
          vehicle.dealer.longitude
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }
    }
    
    const nearest = remaining.splice(nearestIndex, 1)[0];
    result.push(nearest);
    
    if (nearest.dealer?.latitude && nearest.dealer?.longitude) {
      currentLat = nearest.dealer.latitude;
      currentLng = nearest.dealer.longitude;
    }
  }
  
  return result;
}

// Generate Google Maps route URL
export function generateGoogleMapsUrl(
  vehicles: RankedVehicle[],
  startAddress: string
): string {
  const vehiclesWithCoords = vehicles.filter(
    v => v.dealer?.latitude && v.dealer?.longitude
  );
  
  if (vehiclesWithCoords.length === 0) return '';
  
  const waypoints = vehiclesWithCoords
    .map(v => `${v.dealer!.latitude},${v.dealer!.longitude}`)
    .join('/');
  
  const origin = encodeURIComponent(startAddress);
  const destination = vehiclesWithCoords.length > 0
    ? `${vehiclesWithCoords[vehiclesWithCoords.length - 1].dealer!.latitude},${vehiclesWithCoords[vehiclesWithCoords.length - 1].dealer!.longitude}`
    : origin;
  
  return `https://www.google.com/maps/dir/${origin}/${waypoints}`;
}
