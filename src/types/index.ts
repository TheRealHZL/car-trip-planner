// Vehicle status enum
export type VehicleStatus = 'open' | 'visited' | 'excluded';

// Priority levels (1-5)
export type Priority = 1 | 2 | 3 | 4 | 5;

// Dealer/Location interface
export interface Dealer {
  id: string;
  userId: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vehicle interface
export interface Vehicle {
  id: string;
  userId: string;
  dealerId: string | null;
  brand: string;
  model: string;
  year: number | null;
  price: number | null;
  priority: Priority;
  status: VehicleStatus;
  listingUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vehicle with dealer info for display
export interface VehicleWithDealer extends Vehicle {
  dealer: Dealer | null;
}

// Visit route interface
export interface VisitRoute {
  id: string;
  userId: string;
  name: string;
  vehicleIds: string[];
  startLatitude: number | null;
  startLongitude: number | null;
  createdAt: Date;
}

// Ranking score result
export interface RankedVehicle extends VehicleWithDealer {
  score: number;
  distanceKm: number | null;
}

// Filter options
export interface VehicleFilters {
  status?: VehicleStatus | 'all';
  minPrice?: number;
  maxPrice?: number;
  minPriority?: Priority;
  maxPriority?: Priority;
  dealerId?: string;
  brand?: string;
}

// Sort options
export type SortField = 'priority' | 'price' | 'brand' | 'createdAt' | 'score';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

// User profile
export interface Profile {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard stats
export interface DashboardStats {
  totalVehicles: number;
  openVehicles: number;
  visitedVehicles: number;
  excludedVehicles: number;
  totalDealers: number;
  avgPrice: number;
  highPriorityCount: number;
}
