import { Dealer, Vehicle, VehicleWithDealer, Profile, DashboardStats } from '@/types';

// Mock user
export const mockProfile: Profile = {
  id: 'user-1',
  email: 'demo@carvisit.de',
  displayName: 'Demo Nutzer',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Mock dealers with German locations
export const mockDealers: Dealer[] = [
  {
    id: 'dealer-1',
    userId: 'user-1',
    name: 'AutoHaus München Nord',
    address: 'Leopoldstraße 150, 80804 München',
    latitude: 48.1681,
    longitude: 11.5861,
    phone: '+49 89 123456',
    notes: 'Großer Gebrauchtwagenhändler, gute Bewertungen',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'dealer-2',
    userId: 'user-1',
    name: 'Privat - Familie Müller',
    address: 'Bahnhofstraße 42, 85221 Dachau',
    latitude: 48.2603,
    longitude: 11.4340,
    phone: '+49 171 9876543',
    notes: 'Privatverkauf, sehr gepflegt',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: 'dealer-3',
    userId: 'user-1',
    name: 'BMW Niederlassung Freising',
    address: 'Münchner Straße 12, 85354 Freising',
    latitude: 48.4028,
    longitude: 11.7489,
    phone: '+49 8161 123456',
    notes: 'Offizieller BMW Händler, Garantie möglich',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: 'dealer-4',
    userId: 'user-1',
    name: 'Auto-Center Augsburg',
    address: 'Haunstetter Straße 88, 86161 Augsburg',
    latitude: 48.3445,
    longitude: 10.8985,
    phone: '+49 821 555666',
    notes: 'Große Auswahl, verhandelbar',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: 'dealer-5',
    userId: 'user-1',
    name: 'Garage Schmidt',
    address: 'Hauptstraße 5, 82256 Fürstenfeldbruck',
    latitude: 48.1791,
    longitude: 11.2558,
    phone: '+49 8141 789012',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
  },
];

// Mock vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'vehicle-1',
    userId: 'user-1',
    dealerId: 'dealer-1',
    brand: 'Volkswagen',
    model: 'Golf 8 GTI',
    year: 2021,
    price: 32500,
    priority: 5,
    status: 'open',
    listingUrl: 'https://mobile.de/example1',
    notes: 'Top Zustand, Scheckheftgepflegt, DSG Getriebe',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'vehicle-2',
    userId: 'user-1',
    dealerId: 'dealer-2',
    brand: 'BMW',
    model: '320d Touring',
    year: 2020,
    price: 28900,
    priority: 4,
    status: 'open',
    listingUrl: 'https://mobile.de/example2',
    notes: 'Familienfahrzeug, M-Sport Paket',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: 'vehicle-3',
    userId: 'user-1',
    dealerId: 'dealer-3',
    brand: 'BMW',
    model: 'X3 xDrive30d',
    year: 2022,
    price: 52000,
    priority: 3,
    status: 'open',
    listingUrl: 'https://mobile.de/example3',
    notes: 'SUV, viel Platz, hoher Verbrauch',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: 'vehicle-4',
    userId: 'user-1',
    dealerId: 'dealer-4',
    brand: 'Mercedes-Benz',
    model: 'A 200 AMG Line',
    year: 2021,
    price: 31500,
    priority: 4,
    status: 'visited',
    listingUrl: 'https://mobile.de/example4',
    notes: 'Besichtigt am 15.01. - Kleine Kratzer hinten links',
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'vehicle-5',
    userId: 'user-1',
    dealerId: 'dealer-5',
    brand: 'Audi',
    model: 'A4 Avant 40 TFSI',
    year: 2020,
    price: 34900,
    priority: 5,
    status: 'open',
    listingUrl: 'https://mobile.de/example5',
    notes: 'S-Line, Virtual Cockpit, sehr guter Zustand',
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24'),
  },
  {
    id: 'vehicle-6',
    userId: 'user-1',
    dealerId: 'dealer-1',
    brand: 'Skoda',
    model: 'Octavia RS Combi',
    year: 2021,
    price: 29500,
    priority: 3,
    status: 'excluded',
    listingUrl: 'https://mobile.de/example6',
    notes: 'Ausgeschlossen: Unfallwagen laut Carfax',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: 'vehicle-7',
    userId: 'user-1',
    dealerId: 'dealer-3',
    brand: 'Toyota',
    model: 'Corolla Touring Sports Hybrid',
    year: 2023,
    price: 27800,
    priority: 2,
    status: 'open',
    listingUrl: 'https://mobile.de/example7',
    notes: 'Hybrid, sehr sparsam, Werksgarantie',
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
  },
  {
    id: 'vehicle-8',
    userId: 'user-1',
    dealerId: 'dealer-2',
    brand: 'Mazda',
    model: 'CX-5 Skyactiv-D 184',
    year: 2022,
    price: 36500,
    priority: 4,
    status: 'open',
    listingUrl: 'https://mobile.de/example8',
    notes: 'AWD, Premium Ausstattung',
    createdAt: new Date('2024-01-27'),
    updatedAt: new Date('2024-01-27'),
  },
];

// Helper to get vehicles with dealer info
export const getVehiclesWithDealers = (): VehicleWithDealer[] => {
  return mockVehicles.map(vehicle => ({
    ...vehicle,
    dealer: mockDealers.find(d => d.id === vehicle.dealerId) || null,
  }));
};

// Calculate dashboard stats
export const getDashboardStats = (): DashboardStats => {
  const vehicles = mockVehicles;
  const openVehicles = vehicles.filter(v => v.status === 'open');
  const visitedVehicles = vehicles.filter(v => v.status === 'visited');
  const excludedVehicles = vehicles.filter(v => v.status === 'excluded');
  const highPriority = vehicles.filter(v => v.priority >= 4 && v.status === 'open');
  
  const pricesWithValues = vehicles.filter(v => v.price !== null).map(v => v.price as number);
  const avgPrice = pricesWithValues.length > 0 
    ? pricesWithValues.reduce((a, b) => a + b, 0) / pricesWithValues.length 
    : 0;

  return {
    totalVehicles: vehicles.length,
    openVehicles: openVehicles.length,
    visitedVehicles: visitedVehicles.length,
    excludedVehicles: excludedVehicles.length,
    totalDealers: mockDealers.length,
    avgPrice: Math.round(avgPrice),
    highPriorityCount: highPriority.length,
  };
};

// Get unique brands
export const getUniqueBrands = (): string[] => {
  return [...new Set(mockVehicles.map(v => v.brand))].sort();
};
