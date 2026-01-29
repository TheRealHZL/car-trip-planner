import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getVehiclesWithDealers, getUniqueBrands, mockDealers } from '@/data/mockData';
import { VehicleWithDealer, VehicleStatus, Priority, VehicleFilters } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityBadge, StatusBadge } from '@/components/ui/status-badges';
import { Plus, ExternalLink, Search, Filter, X, Car } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Vehicles() {
  const [vehicles] = useState<VehicleWithDealer[]>(getVehiclesWithDealers());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<VehicleFilters>({ status: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const brands = getUniqueBrands();

  const filteredVehicles = vehicles.filter(vehicle => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      vehicle.brand.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.dealer?.name.toLowerCase().includes(searchLower) ||
      vehicle.notes?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Status filter
    if (filters.status && filters.status !== 'all' && vehicle.status !== filters.status) {
      return false;
    }

    // Price filters
    if (filters.minPrice && vehicle.price && vehicle.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && vehicle.price && vehicle.price > filters.maxPrice) {
      return false;
    }

    // Priority filters
    if (filters.minPriority && vehicle.priority < filters.minPriority) {
      return false;
    }

    // Brand filter
    if (filters.brand && vehicle.brand !== filters.brand) {
      return false;
    }

    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const clearFilters = () => {
    setFilters({ status: 'all' });
    setSearchTerm('');
  };

  const handleAddVehicle = () => {
    toast.success('Fahrzeug hinzugefügt (Mock)', {
      description: 'Im echten System wird das Fahrzeug in der Datenbank gespeichert.',
    });
    setIsDialogOpen(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Fahrzeuge
            </h1>
            <p className="text-muted-foreground">
              {filteredVehicles.length} von {vehicles.length} Fahrzeugen
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Fahrzeug hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neues Fahrzeug</DialogTitle>
                <DialogDescription>
                  Füge ein neues Fahrzeug zu deiner Liste hinzu
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marke *</Label>
                    <Input id="brand" placeholder="z.B. Volkswagen" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modell *</Label>
                    <Input id="model" placeholder="z.B. Golf 8 GTI" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Baujahr</Label>
                    <Input id="year" type="number" placeholder="z.B. 2021" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preis (€)</Label>
                    <Input id="price" type="number" placeholder="z.B. 32500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorität</Label>
                    <Select defaultValue="3">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Niedrig</SelectItem>
                        <SelectItem value="2">2 - Gering</SelectItem>
                        <SelectItem value="3">3 - Mittel</SelectItem>
                        <SelectItem value="4">4 - Hoch</SelectItem>
                        <SelectItem value="5">5 - Sehr hoch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealer">Händler</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Händler wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDealers.map(dealer => (
                          <SelectItem key={dealer.id} value={dealer.id}>
                            {dealer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listingUrl">Link zum Inserat</Label>
                  <Input id="listingUrl" type="url" placeholder="https://mobile.de/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notizen</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Zusätzliche Informationen zum Fahrzeug..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleAddVehicle}>
                  Speichern
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Marke, Modell, Händler..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          {(searchTerm || filters.status !== 'all' || filters.brand || filters.minPrice) && (
            <Button variant="ghost" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Zurücksetzen
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => setFilters({ ...filters, status: value as VehicleStatus | 'all' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle</SelectItem>
                      <SelectItem value="open">Offen</SelectItem>
                      <SelectItem value="visited">Besucht</SelectItem>
                      <SelectItem value="excluded">Ausgeschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marke</Label>
                  <Select
                    value={filters.brand || ''}
                    onValueChange={(value) => setFilters({ ...filters, brand: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle Marken" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Alle Marken</SelectItem>
                      {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Min. Priorität</Label>
                  <Select
                    value={filters.minPriority?.toString() || ''}
                    onValueChange={(value) => setFilters({ ...filters, minPriority: value ? parseInt(value) as Priority : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Keine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Keine</SelectItem>
                      <SelectItem value="3">3 - Mittel</SelectItem>
                      <SelectItem value="4">4 - Hoch</SelectItem>
                      <SelectItem value="5">5 - Sehr hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max. Preis (€)</Label>
                  <Input
                    type="number"
                    placeholder="z.B. 40000"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle List */}
        <div className="grid gap-4">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Vehicle Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Car className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <PriorityBadge priority={vehicle.priority} />
                      <StatusBadge status={vehicle.status} />
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        {vehicle.year && `${vehicle.year} • `}
                        {vehicle.dealer?.name || 'Kein Händler zugeordnet'}
                      </p>
                      {vehicle.dealer?.address && (
                        <p className="text-xs">{vehicle.dealer.address}</p>
                      )}
                      {vehicle.notes && (
                        <p className="text-xs mt-2 italic">{vehicle.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-6">
                    {vehicle.price && (
                      <div className="text-xl font-bold text-foreground">
                        {formatPrice(vehicle.price)}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {vehicle.listingUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={vehicle.listingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Inserat
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Bearbeiten
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredVehicles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Keine Fahrzeuge gefunden
                </h3>
                <p className="text-muted-foreground mb-4">
                  Passe deine Filter an oder füge ein neues Fahrzeug hinzu.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Fahrzeug hinzufügen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
