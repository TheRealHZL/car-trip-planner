import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RankedVehicle } from '@/types';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RouteMapProps {
  vehicles: RankedVehicle[];
  startLat: number;
  startLng: number;
  startLabel?: string;
  className?: string;
}

export function RouteMap({ 
  vehicles, 
  startLat, 
  startLng, 
  startLabel = 'Start',
  className = '' 
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([startLat, startLng], 10);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers and lines
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add start marker
    const startIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: hsl(217, 33%, 32%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">S</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([startLat, startLng], { icon: startIcon })
      .addTo(map)
      .bindPopup(`<strong>${startLabel}</strong><br>Startpunkt`);

    // Add vehicle markers
    const vehiclesWithCoords = vehicles.filter(
      v => v.dealer?.latitude && v.dealer?.longitude
    );

    const bounds = L.latLngBounds([[startLat, startLng]]);

    vehiclesWithCoords.forEach((vehicle, index) => {
      const lat = vehicle.dealer!.latitude!;
      const lng = vehicle.dealer!.longitude!;
      
      bounds.extend([lat, lng]);

      // Priority-based color
      const priorityColors: Record<number, string> = {
        1: '#9ca3af',
        2: '#0ea5e9',
        3: '#22c55e',
        4: '#f59e0b',
        5: '#ef4444',
      };
      const color = priorityColors[vehicle.priority] || '#6b7280';

      const vehicleIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${index + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const formatPrice = (price: number) => 
        new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(price);

      L.marker([lat, lng], { icon: vehicleIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong style="font-size: 14px;">${vehicle.brand} ${vehicle.model}</strong><br>
            <span style="color: #666;">${vehicle.dealer?.name}</span><br>
            ${vehicle.price ? `<strong style="color: #16a34a;">${formatPrice(vehicle.price)}</strong><br>` : ''}
            <span style="font-size: 12px;">Score: ${vehicle.score} | Priorität: ${vehicle.priority}</span>
            ${vehicle.distanceKm ? `<br><span style="font-size: 12px;">${vehicle.distanceKm.toFixed(1)} km entfernt</span>` : ''}
          </div>
        `);
    });

    // Draw route line
    if (vehiclesWithCoords.length > 0) {
      const routePoints: L.LatLngExpression[] = [
        [startLat, startLng],
        ...vehiclesWithCoords.map(v => [v.dealer!.latitude!, v.dealer!.longitude!] as L.LatLngExpression),
      ];

      L.polyline(routePoints, {
        color: 'hsl(217, 33%, 32%)',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10',
      }).addTo(map);
    }

    // Fit map to bounds
    if (vehiclesWithCoords.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([startLat, startLng], 10);
    }
  }, [vehicles, startLat, startLng, startLabel]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full min-h-[400px] rounded-lg ${className}`}
    />
  );
}
