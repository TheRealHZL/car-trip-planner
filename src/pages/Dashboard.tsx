import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { useVehiclesWithDealers, useDealers } from '@/hooks/useSupabase';
import { Car, MapPin, CheckCircle, XCircle, Star, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriorityBadge, StatusBadge } from '@/components/ui/status-badges';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

export default function Dashboard() {
  const { data: vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehiclesWithDealers();
  const { data: dealers, isLoading: dealersLoading } = useDealers();

  const stats = useMemo(() => {
    if (!vehicles || !dealers) {
      return {
        totalVehicles: 0,
        totalDealers: 0,
        openVehicles: 0,
        visitedVehicles: 0,
        excludedVehicles: 0,
        highPriorityCount: 0,
        avgPrice: 0,
      };
    }

    const openVehicles = vehicles.filter(v => v.status === 'open').length;
    const visitedVehicles = vehicles.filter(v => v.status === 'visited').length;
    const excludedVehicles = vehicles.filter(v => v.status === 'excluded').length;
    const highPriorityCount = vehicles.filter(v => v.priority >= 4).length;
    const pricesWithValues = vehicles.filter(v => v.price && v.price > 0).map(v => v.price!);
    const avgPrice = pricesWithValues.length > 0
      ? pricesWithValues.reduce((a, b) => a + b, 0) / pricesWithValues.length
      : 0;

    return {
      totalVehicles: vehicles.length,
      totalDealers: dealers.length,
      openVehicles,
      visitedVehicles,
      excludedVehicles,
      highPriorityCount,
      avgPrice,
    };
  }, [vehicles, dealers]);

  const topVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles
      .filter(v => v.status === 'open')
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);
  }, [vehicles]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isLoading = vehiclesLoading || dealersLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (vehiclesError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <XCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Fehler beim Laden der Daten</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Übersicht über deine Fahrzeugsuche und geplante Besuche
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Fahrzeuge gesamt"
            value={stats.totalVehicles}
            subtitle={`${stats.openVehicles} offen`}
            icon={Car}
          />
          <StatCard
            title="Händler"
            value={stats.totalDealers}
            subtitle="Standorte"
            icon={MapPin}
          />
          <StatCard
            title="Besucht"
            value={stats.visitedVehicles}
            subtitle={`von ${stats.totalVehicles}`}
            icon={CheckCircle}
          />
          <StatCard
            title="Hohe Priorität"
            value={stats.highPriorityCount}
            subtitle="Priorität 4-5"
            icon={Star}
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Preisstatistik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatPrice(stats.avgPrice)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Durchschnittspreis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Ausgeschlossen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.excludedVehicles}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Fahrzeuge nicht mehr relevant
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Priority Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top-Priorität Fahrzeuge</CardTitle>
              <CardDescription>
                Fahrzeuge mit hoher Priorität, die noch besucht werden müssen
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/vehicles">Alle anzeigen</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <PriorityBadge priority={vehicle.priority} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {vehicle.year} • {vehicle.dealer?.name || 'Kein Händler'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {vehicle.price && (
                      <span className="text-lg font-semibold text-foreground">
                        {formatPrice(vehicle.price)}
                      </span>
                    )}
                    <StatusBadge status={vehicle.status} />
                  </div>
                </div>
              ))}

              {topVehicles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Keine offenen Fahrzeuge vorhanden
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/vehicles">
              <Car className="mr-2 h-4 w-4" />
              Fahrzeug hinzufügen
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/route">
              <MapPin className="mr-2 h-4 w-4" />
              Route planen
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
