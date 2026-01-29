# Car Visit Planner - Docker Setup

Vollständig containerisiertes Fullstack-System mit React Frontend und Supabase Self-Hosted Backend.

## Architektur

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Stack                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐      ┌────────────────────────────────────┐    │
│  │   Frontend      │      │         Supabase Stack              │    │
│  │   (Nginx)       │      │                                     │    │
│  │   Port: 3000    │◄────►│  ┌─────────────┐  ┌─────────────┐  │    │
│  └─────────────────┘      │  │  Kong API   │  │  GoTrue     │  │    │
│                           │  │  Gateway    │  │  (Auth)     │  │    │
│                           │  │  Port: 8000 │  │             │  │    │
│                           │  └──────┬──────┘  └─────────────┘  │    │
│                           │         │                           │    │
│                           │  ┌──────┴──────┐  ┌─────────────┐  │    │
│                           │  │  PostgREST  │  │  Storage    │  │    │
│                           │  │  (REST API) │  │  API        │  │    │
│                           │  └──────┬──────┘  └─────────────┘  │    │
│                           │         │                           │    │
│                           │  ┌──────┴──────┐  ┌─────────────┐  │    │
│                           │  │  PostgreSQL │  │  Edge       │  │    │
│                           │  │  Database   │  │  Functions  │  │    │
│                           │  │  Port: 5432 │  │             │  │    │
│                           │  └─────────────┘  └─────────────┘  │    │
│                           │                                     │    │
│                           │  ┌─────────────┐  ┌─────────────┐  │    │
│                           │  │  Studio     │  │  Analytics  │  │    │
│                           │  │  (Optional) │  │             │  │    │
│                           │  │  Port: 3001 │  │             │  │    │
│                           │  └─────────────┘  └─────────────┘  │    │
│                           └────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Schnellstart

### 1. Umgebungsvariablen konfigurieren

```bash
# .env aus Vorlage erstellen
cp .env.example .env

# Sichere Schlüssel generieren (empfohlen für Produktion)
./scripts/generate-keys.sh

# Die generierten Schlüssel in .env eintragen
```

### 2. Stack starten

```bash
# Alle Services starten
docker compose up -d

# Logs verfolgen
docker compose logs -f

# Status prüfen
docker compose ps
```

### 3. Services aufrufen

| Service | URL | Beschreibung |
|---------|-----|--------------|
| **Frontend** | http://localhost:3000 | Car Visit Planner Web-App |
| **Supabase API** | http://localhost:8000 | Kong API Gateway |
| **Supabase Studio** | http://localhost:3001 | Admin Dashboard (optional) |
| **PostgreSQL** | localhost:5432 | Datenbank (für direkten Zugriff) |

## Services im Detail

### Frontend
- **Container**: `car-planner-frontend`
- **Image**: Multi-stage Build (Node.js → Nginx)
- **Port**: 3000
- **Features**:
  - React + Vite + TypeScript
  - Tailwind CSS + shadcn/ui
  - Leaflet Maps Integration
  - Produktions-optimiert mit Gzip

### Supabase Database
- **Container**: `supabase-db`
- **Image**: `supabase/postgres:15.6.1.143`
- **Port**: 5432
- **Features**:
  - PostgreSQL 15 mit Supabase-Erweiterungen
  - Automatische Schema-Migration
  - Persistente Daten via Volume

### Supabase Auth (GoTrue)
- **Container**: `supabase-auth`
- **Image**: `supabase/gotrue:v2.164.0`
- **Features**:
  - Email/Password Authentication
  - JWT Token Management
  - Row Level Security Integration

### PostgREST (REST API)
- **Container**: `supabase-rest`
- **Image**: `postgrest/postgrest:v12.2.3`
- **Features**:
  - Automatische REST API aus PostgreSQL Schema
  - OpenAPI Dokumentation
  - JWT Authentifizierung

### Supabase Storage
- **Container**: `supabase-storage`
- **Image**: `supabase/storage-api:v1.11.13`
- **Features**:
  - Datei-Upload und -Download
  - Image Transformation (via imgproxy)
  - Bucket Policies

### Edge Functions
- **Container**: `supabase-edge-functions`
- **Image**: `supabase/edge-runtime:v1.58.3`
- **Features**:
  - Deno Runtime
  - `geocode-address`: Adress-zu-Koordinaten
  - `optimize-route`: Routenoptimierung

## Datenbankschema

```sql
-- Tabellen
profiles      -- Benutzerprofile (verknüpft mit auth.users)
dealers       -- Händler/Standorte
vehicles      -- Fahrzeuge mit Priorität und Status
visit_routes  -- Gespeicherte Routen

-- Enum
vehicle_status: 'open' | 'visited' | 'excluded'

-- RLS aktiv auf allen Tabellen
-- user_id = auth.uid()
```

## Nützliche Befehle

```bash
# Stack starten
docker compose up -d

# Stack stoppen
docker compose down

# Stack stoppen und Volumes löschen (Datenverlust!)
docker compose down -v

# Logs eines Services
docker compose logs -f supabase-db

# In Container einloggen
docker compose exec supabase-db psql -U postgres

# Frontend neu bauen
docker compose build frontend

# Alle Images neu bauen
docker compose build --no-cache
```

## Troubleshooting

### Frontend kann Supabase nicht erreichen
1. Prüfen ob Kong läuft: `docker compose ps supabase-kong`
2. CORS Headers in `supabase/volumes/kong/kong.yml` prüfen
3. `VITE_SUPABASE_URL` in `.env` prüfen

### Datenbank-Verbindungsfehler
1. Prüfen ob DB läuft: `docker compose ps supabase-db`
2. Logs prüfen: `docker compose logs supabase-db`
3. `POSTGRES_PASSWORD` stimmt überein?

### Auth-Fehler
1. JWT_SECRET muss in allen Services identisch sein
2. ANON_KEY und SERVICE_ROLE_KEY müssen gültige JWTs sein
3. `./scripts/generate-keys.sh` zum Neugenerieren verwenden

### Speicherplatz-Probleme
```bash
# Ungenutzte Docker-Ressourcen aufräumen
docker system prune -a

# Volumes prüfen
docker volume ls
```

## Produktion

### Sicherheits-Checkliste

- [ ] Neue JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY generieren
- [ ] Starkes POSTGRES_PASSWORD setzen
- [ ] HTTPS via Reverse Proxy aktivieren
- [ ] ENABLE_EMAIL_AUTOCONFIRM=false setzen
- [ ] FUNCTIONS_VERIFY_JWT=true setzen
- [ ] Studio in Produktion deaktivieren oder absichern
- [ ] Firewall: Nur Ports 80/443 exponieren

### Domain-Konfiguration

```env
# .env für Produktion
API_EXTERNAL_URL=https://api.meinedomain.de
SITE_URL=https://meinedomain.de
VITE_SUPABASE_URL=https://api.meinedomain.de
```

### Reverse Proxy (Nginx/Traefik)

Für Produktion wird ein Reverse Proxy empfohlen:
- SSL/TLS Terminierung
- Load Balancing
- Rate Limiting
- WAF Integration

## Entwicklung

### Lokale Entwicklung ohne Docker

```bash
# Frontend lokal starten
npm run dev

# Supabase im Docker, Frontend lokal
docker compose up -d supabase-db supabase-kong supabase-auth supabase-rest
npm run dev
```

### Hot Reload

Das Frontend unterstützt Hot Reload im Development-Modus:
```bash
npm run dev
```

Für Docker-basierte Entwicklung mit Volume-Mounting siehe `docker-compose.override.yml`.
