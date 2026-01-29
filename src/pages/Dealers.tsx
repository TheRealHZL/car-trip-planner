import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockDealers, mockVehicles } from '@/data/mockData';
import { Dealer } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MapPin, Phone, Car, ExternalLink, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Dealers() {
  const [dealers] = useState<Dealer[]>(mockDealers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredDealers = dealers.filter(dealer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      dealer.name.toLowerCase().includes(searchLower) ||
      dealer.address.toLowerCase().includes(searchLower)
    );
  });

  const getVehicleCountForDealer = (dealerId: string) => {
    return mockVehicles.filter(v => v.dealerId === dealerId).length;
  };

  const getOpenVehicleCountForDealer = (dealerId: string) => {
    return mockVehicles.filter(v => v.dealerId === dealerId && v.status === 'open').length;
  };

  const handleAddDealer = () => {
    toast.success('Händler hinzugefügt (Mock)', {
      description: 'Im echten System wird der Händler in der Datenbank gespeichert und die Adresse geocodiert.',
    });
    setIsDialogOpen(false);
  };

  const openInMaps = (dealer: Dealer) => {
    const query = encodeURIComponent(dealer.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Händler & Standorte
            </h1>
            <p className="text-muted-foreground">
              {dealers.length} Händler mit {mockVehicles.length} Fahrzeugen
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Händler hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Neuer Händler</DialogTitle>
                <DialogDescription>
                  Füge einen neuen Händler oder Privatverkäufer hinzu
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" placeholder="z.B. AutoHaus München" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input id="address" placeholder="Straße, PLZ Stadt" />
                  <p className="text-xs text-muted-foreground">
                    Die Adresse wird automatisch in Koordinaten umgewandelt
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" type="tel" placeholder="+49 ..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notizen</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Öffnungszeiten, Besonderheiten..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleAddDealer}>
                  Speichern
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Name oder Adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Dealer Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDealers.map((dealer) => {
            const vehicleCount = getVehicleCountForDealer(dealer.id);
            const openCount = getOpenVehicleCountForDealer(dealer.id);

            return (
              <Card key={dealer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{dealer.name}</CardTitle>
                      <CardDescription className="flex items-start gap-1 mt-1">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{dealer.address}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      <Car className="h-3 w-3 mr-1" />
                      {vehicleCount}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dealer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${dealer.phone}`} className="hover:text-foreground">
                        {dealer.phone}
                      </a>
                    </div>
                  )}

                  {dealer.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      {dealer.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm">
                      <span className="font-medium text-foreground">{openCount}</span>
                      <span className="text-muted-foreground"> offen von {vehicleCount}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openInMaps(dealer)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Bearbeiten
                      </Button>
                    </div>
                  </div>

                  {/* Coordinates info */}
                  {dealer.latitude && dealer.longitude && (
                    <p className="text-xs text-muted-foreground">
                      📍 {dealer.latitude.toFixed(4)}, {dealer.longitude.toFixed(4)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredDealers.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="py-12 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Keine Händler gefunden
                </h3>
                <p className="text-muted-foreground mb-4">
                  Füge einen neuen Händler hinzu, um loszulegen.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Händler hinzufügen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
