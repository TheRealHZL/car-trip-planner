import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RouteMap } from '@/components/map/RouteMap';
import { useVehiclesWithDealers } from '@/hooks/useSupabase';
import { rankVehicles, optimizeRouteOrder, defaultWeights, ScoringWeights, generateGoogleMapsUrl } from '@/lib/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PriorityBadge } from '@/components/ui/status-badges';
import { MapPin, Route, Settings2, Car, Navigation, Loader2, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

// Default start location (Munich center)
const DEFAULT_START = {
  lat: 48.1351,
  lng: 11.5820,
  address: 'München Hauptbahnhof',
};

export default function RoutePlanner() {
  const { data: vehicles, isLoading, error } = useVehiclesWithDealers();

  const [startAddress, setStartAddress] = useState(DEFAULT_START.address);
  const [startLat] = useState(DEFAULT_START.lat);
  const [startLng] = useState(DEFAULT_START.lng);
  const [optimizeRoute, setOptimizeRoute] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [weights, setWeights] = useState<ScoringWeights>(defaultWeights);

  // Calculate ranked vehicles
  const rankedVehicles = useMemo(() => {
    if (!vehicles) return [];

    // Filter only open vehicles with dealers that have coordinates
    const openVehicles = vehicles.filter(v =>
      v.status === 'open' &&
      v.dealer &&
      v.dealer.latitude &&
      v.dealer.longitude
    );

    let ranked = rankVehicles(openVehicles, startLat, startLng, weights);
    if (optimizeRoute) {
      ranked = optimizeRouteOrder(ranked, startLat, startLng);
    }
    return ranked;
  }, [vehicles, startLat, startLng, weights, optimizeRoute]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleExportToMaps = () => {
    const url = generateGoogleMapsUrl(rankedVehicles, startAddress);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Keine Fahrzeuge mit Koordinaten vorhanden');
    }
  };

  const totalDistance = useMemo(() => {
    return rankedVehicles
      .filter(v => v.distanceKm !== null)
      .reduce((sum, v) => sum + (v.distanceKm || 0), 0);
  }, [rankedVehicles]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <X className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Fehler beim Laden der Fahrzeuge</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Routenplanung
            </h1>
            <p className="text-muted-foreground">
              {rankedVehicles.length} offene Fahrzeuge zur Besichtigung
            </p>
          </div>

          <Button onClick={handleExportToMaps} disabled={rankedVehicles.length === 0}>
            <Navigation className="mr-2 h-4 w-4" />
            In Google Maps öffnen
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Column - Settings & List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Start Location */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Startpunkt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input
                    value={startAddress}
                    onChange={(e) => setStartAddress(e.target.value)}
                    placeholder="Adresse eingeben..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Koordinaten: {startLat.toFixed(4)}, {startLng.toFixed(4)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Route Settings */}
            <Collapsible open={showSettings} onOpenChange={setShowSettings}>
              <Card>
                <CardHeader className="pb-3">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        Ranking-Einstellungen
                      </CardTitle>
                      <span className="text-muted-foreground text-sm">
                        {showSettings ? '−' : '+'}
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="optimize">Route optimieren</Label>
                      <Switch
                        id="optimize"
                        checked={optimizeRoute}
                        onCheckedChange={setOptimizeRoute}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Priorität</Label>
                          <span className="text-sm text-muted-foreground">{weights.priorityWeight}%</span>
                        </div>
                        <Slider
                          value={[weights.priorityWeight]}
                          onValueChange={([v]) => setWeights({ ...weights, priorityWeight: v })}
                          max={100}
                          step={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Preis</Label>
                          <span className="text-sm text-muted-foreground">{weights.priceWeight}%</span>
                        </div>
                        <Slider
                          value={[weights.priceWeight]}
                          onValueChange={([v]) => setWeights({ ...weights, priceWeight: v })}
                          max={100}
                          step={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Entfernung</Label>
                          <span className="text-sm text-muted-foreground">{weights.distanceWeight}%</span>
                        </div>
                        <Slider
                          value={[weights.distanceWeight]}
                          onValueChange={([v]) => setWeights({ ...weights, distanceWeight: v })}
                          max={100}
                          step={5}
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setWeights(defaultWeights)}
                    >
                      Zurücksetzen
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Route Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Besuchsreihenfolge
                </CardTitle>
                <CardDescription>
                  Geschätzte Gesamtstrecke: {totalDistance.toFixed(1)} km
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                  {rankedVehicles.map((vehicle, index) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {vehicle.brand} {vehicle.model}
                          </span>
                          <PriorityBadge priority={vehicle.priority} className="scale-90" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {vehicle.dealer?.name}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold">
                          {vehicle.score}
                        </div>
                        {vehicle.distanceKm && (
                          <div className="text-xs text-muted-foreground">
                            {vehicle.distanceKm.toFixed(1)} km
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {rankedVehicles.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Keine offenen Fahrzeuge</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Kartenansicht
                </CardTitle>
                <CardDescription>
                  OpenStreetMap - Klicke auf Marker für Details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] lg:h-[600px]">
                  <RouteMap
                    vehicles={rankedVehicles}
                    startLat={startLat}
                    startLng={startLng}
                    startLabel={startAddress}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Score Explanation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">So wird der Score berechnet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold">{weights.priorityWeight}%</span>
                </div>
                <div>
                  <p className="font-medium">Priorität</p>
                  <p className="text-muted-foreground text-xs">
                    Höhere Priorität = höherer Score
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold">{weights.priceWeight}%</span>
                </div>
                <div>
                  <p className="font-medium">Preis</p>
                  <p className="text-muted-foreground text-xs">
                    Niedrigerer Preis = höherer Score
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold">{weights.distanceWeight}%</span>
                </div>
                <div>
                  <p className="font-medium">Entfernung</p>
                  <p className="text-muted-foreground text-xs">
                    Kürzere Entfernung = höherer Score
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
