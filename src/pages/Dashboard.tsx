import { MainLayout } from '@/components/layout/MainLayout';
import { useVehiclesWithDealers, useDealers } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { Car, MapPin, CheckCircle, XCircle, Star, TrendingUp, Loader2, ArrowRight, Route } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriorityBadge, StatusBadge } from '@/components/ui/status-badges';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { data: vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehiclesWithDealers();
  const { data: dealers, isLoading: dealersLoading } = useDealers();
  const { user, isMockMode } = useAuth();

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

  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Benutzer';

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
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-0">
                {isMockMode ? 'Demo-Modus' : 'Live'}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Willkommen zurück, {userName}!
            </h1>
            <p className="text-slate-400 max-w-xl">
              Du hast <span className="text-amber-400 font-semibold">{stats.openVehicles} offene Fahrzeuge</span> zur Besichtigung.
              Plane jetzt deine Route und besuche die besten Angebote.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <Link to="/route">
                  <Route className="mr-2 h-4 w-4" />
                  Route planen
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Link to="/vehicles">
                  <Car className="mr-2 h-4 w-4" />
                  Fahrzeuge ansehen
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Fahrzeuge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalVehicles}</div>
              <p className="text-sm text-muted-foreground">{stats.openVehicles} offen</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Händler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalDealers}</div>
              <p className="text-sm text-muted-foreground">Standorte</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Besucht
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.visitedVehicles}</div>
              <p className="text-sm text-muted-foreground">von {stats.totalVehicles}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Hohe Priorität
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.highPriorityCount}</div>
              <p className="text-sm text-muted-foreground">Priorität 4-5</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Priority Vehicles */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Top-Priorität Fahrzeuge
                </CardTitle>
                <CardDescription>
                  Fahrzeuge mit hoher Priorität, die noch besucht werden müssen
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/vehicles" className="flex items-center gap-1">
                  Alle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-accent/50 transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <PriorityBadge priority={vehicle.priority} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vehicle.year && `${vehicle.year} • `}{vehicle.dealer?.name || 'Kein Händler'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {vehicle.price && (
                        <span className="text-lg font-bold text-foreground">
                          {formatPrice(vehicle.price)}
                        </span>
                      )}
                      <StatusBadge status={vehicle.status} />
                    </div>
                  </div>
                ))}

                {topVehicles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Keine offenen Fahrzeuge vorhanden</p>
                    <Button asChild className="mt-4" variant="outline">
                      <Link to="/vehicles">Fahrzeug hinzufügen</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Durchschnittspreis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatPrice(stats.avgPrice)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  basierend auf {vehicles?.filter(v => v.price).length || 0} Fahrzeugen
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <XCircle className="h-4 w-4 text-red-500" />
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

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                    <Route className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Route planen</p>
                    <p className="text-sm text-muted-foreground">
                      Optimiere deine Besuchsreihenfolge
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link to="/route">
                    Jetzt planen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
