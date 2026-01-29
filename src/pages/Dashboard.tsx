import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { getDashboardStats, getVehiclesWithDealers } from '@/data/mockData';
import { Car, MapPin, CheckCircle, XCircle, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriorityBadge, StatusBadge } from '@/components/ui/status-badges';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = getDashboardStats();
  const vehicles = getVehiclesWithDealers();
  const topVehicles = vehicles
    .filter(v => v.status === 'open')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
