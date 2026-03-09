# 🌾 AgriTech B2B Platform — Platformă Marketplace Agricol

> Platformă B2B completă pentru tranzacționarea cerealelor și produselor agricole, cu logistică integrată, contracte forward, și conformitate fiscală românească.

## 📋 Cuprins

- [Arhitectura](#arhitectura)
- [Tehnologii](#tehnologii)
- [Instalare Rapidă (Docker)](#instalare-rapidă-docker)
- [Instalare Manuală (Development)](#instalare-manuală-development)
- [Structura Proiectului](#structura-proiectului)
- [Module Backend](#module-backend)
- [Pagini Frontend](#pagini-frontend)
- [API Endpoints](#api-endpoints)
- [Deployment pe Ubuntu](#deployment-pe-ubuntu)

---

## Arhitectura

```
┌─── Frontend (React + Vite) ─────────────────────────────┐
│  11 Pagini → 8 Servicii API → AppContext (fallback)      │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP/JWT
┌──────────────────────────▼──────────────────────────────┐
│  Backend (NestJS + TypeScript) — /api/v1                 │
│  ┌─────┐ ┌────────┐ ┌──────────┐ ┌─────────┐ ┌───────┐│
│  │ IAM │ │Trading │ │Financial │ │Transport│ │Disputes││
│  └─────┘ └────────┘ └──────────┘ └─────────┘ └───────┘│
│  ┌──────────────┐ ┌─────────┐                          │
│  │Notifications │ │ Profile │                          │
│  └──────────────┘ └─────────┘                          │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────▼───────────┐
              │  PostgreSQL + JSONB/GIN │
              └────────────────────────┘
```

## Tehnologii

| Component | Tehnologie |
|-----------|-----------|
| Frontend | React 19, Vite 7, React Router 7, Vanilla CSS |
| Backend | NestJS 11, TypeScript 5, TypeORM 0.3 |
| Database | PostgreSQL 16, JSONB + GIN Indexes |
| Auth | JWT (passport-jwt), bcrypt |
| Deployment | Docker, Docker Compose, Nginx |

## Instalare Rapidă (Docker)

```bash
# 1. Clonează repository-ul
git clone https://github.com/cata2lin/Licenta-Adriana.git
cd Licenta-Adriana

# 2. Copiază și configurează variabilele de mediu
cp .env.example .env
# Editează .env cu credențialele dorite

# 3. Pornește toate serviciile
docker compose up -d --build

# 4. Accesează platforma
# Frontend: http://localhost
# Backend:  http://localhost:3000/api/v1
```

## Instalare Manuală (Development)

### Cerințe
- Node.js 20+
- PostgreSQL 16+

### Backend
```bash
cd agritech-backend
npm install

# Configurare baza de date
cp .env.example .env  # sau creează .env cu:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_DATABASE=agritech_db
# JWT_SECRET=dev-secret-key

npm run start:dev     # Dezvoltare (port 3000)
npm run build         # Compilare producție
npm run start:prod    # Producție
npm test              # Unit tests
```

### Frontend
```bash
cd agritech-frontend
npm install

# Configurare API URL
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env

npm run dev           # Dezvoltare (port 5173)
npm run build         # Build producție
npm run preview       # Preview build
```

## Structura Proiectului

```
Licenta-Adriana/
├── docker-compose.yml          # Orchestrare Docker
├── deploy.sh                   # Script deployment Ubuntu
├── .env.example                # Template variabile mediu
├── .gitignore
│
├── agritech-backend/           # NestJS Backend
│   ├── Dockerfile
│   ├── src/
│   │   ├── main.ts             # Entry point (CORS, ValidationPipe)
│   │   ├── app.module.ts       # Root module (7 modules, 11 entities)
│   │   ├── iam/                # Autentificare & Autorizare
│   │   ├── trading/            # Catalog mărfuri & Contracte Forward
│   │   ├── financial/          # Comenzi, Escrow, DAC7, Chargeback
│   │   ├── transport/          # OSRM, UIT, 123cargo
│   │   ├── disputes/           # ADR Dispute Resolution
│   │   ├── notifications/      # Notificări persistente
│   │   └── profile/            # Profil utilizator/companie
│   └── package.json
│
├── agritech-frontend/          # React Frontend
│   ├── Dockerfile
│   ├── nginx.conf              # Nginx SPA config
│   ├── src/
│   │   ├── pages/              # 11 pagini
│   │   ├── services/           # 8 servicii API
│   │   ├── components/         # Navbar, Toast, UI kit
│   │   ├── context/            # AppContext (state management)
│   │   ├── hooks/              # useApi, useLocalStorage
│   │   ├── data/               # Mock data (fallback)
│   │   └── utils/              # Formatters, helpers
│   └── package.json
│
└── README.md
```

## Module Backend

| # | Modul | Entități | Funcționalități Cheie |
|---|-------|----------|----------------------|
| 1 | **IAM** | User, Company | JWT, ANAF CUI, KYC, Roluri (FARMER/BUYER/ADMIN) |
| 2 | **Trading** | Commodity, Listing, ForwardContract | JSONB/GIN search, Forward contracts, Invoice |
| 3 | **Financial** | Order, EscrowPayment | Split Payment 95/3/2%, DAC7 F7000, Chargeback |
| 4 | **Transport** | Shipment | OSRM routing (24 orașe), UIT, 123cargo bidding |
| 5 | **Disputes** | Dispute, DisputeMessage | ADR (Legea 81/2022), Chat, Refund parțial |
| 6 | **Notifications** | Notification | CRUD, badge count, mark read |
| 7 | **Profile** | (IAM entities) | Get/update profil, preferințe |

## Pagini Frontend

| Pagină | Rută | Descriere |
|--------|------|-----------|
| Landing | `/` | Pagina principală publică |
| Login | `/login` | Autentificare JWT |
| Dashboard | `/dashboard` | Panou general cu statistici |
| Market | `/market` | Piața Spot — listări active |
| Create Listing | `/create-listing` | Creează ofertă nouă |
| Orders | `/orders` | Istoric comenzi și escrow |
| Contracts | `/contracts` | Contracte Forward & facturare |
| Logistics | `/logistics` | Expediții, rutare OSRM |
| Disputes | `/disputes` | Rezolvarea disputelor ADR |
| Profile | `/profile` | Profil companie & setări |
| Admin | `/admin` | Statistici platformă |

## API Endpoints

### IAM (`/api/v1/iam`)
- `POST /register` — Înregistrare cu validare ANAF CUI
- `POST /login` — Autentificare → JWT token

### Trading (`/api/v1/trading`)
- `GET/POST /commodities` — Catalog mărfuri
- `GET/POST /listings` — Listări piață spot
- `GET /listings/search` — Căutare JSONB cu GIN

### Forward Contracts (`/api/v1/trading/forward-contracts`)
- `GET/POST /` — CRUD contracte forward
- `PATCH /:id/status` — Actualizare status
- `GET /:id/invoice` — Generare factură (TVA inversă Art. 331)

### Financial (`/api/v1/financial`)
- `GET/POST /orders` — Comenzi & Split Payment
- `POST /escrow/:id/fund|release|refund` — Operațiuni Escrow
- `POST /dac7/generate` — Raport DAC7 F7000
- `POST /chargeback/:id` — Rutare chargeback

### Transport (`/api/v1/transport`)
- `POST /route` — Calcul rută OSRM
- `POST /bidding/:id` — Simulare licitație 123cargo
- `GET /shipments` — Lista expediții

### Disputes (`/api/v1/disputes`)
- `POST /` — Deschide dispută
- `POST /:id/messages` — Chat conciliere
- `POST /:id/resolve` — Propune rezoluție
- `POST /:id/escalate` — Escalare ADR

### Notifications (`/api/v1/notifications`)
- `GET /` — Lista notificări (paginate)
- `GET /unread` — Număr necitite
- `PATCH /:id/read` — Marchează citit

### Profile (`/api/v1/profile`)
- `GET /` — Profil utilizator
- `PATCH /company` — Actualizare companie
- `PATCH /prefs` — Actualizare preferințe

## Deployment pe Ubuntu

### Metoda 1: Script Automat
```bash
git clone https://github.com/cata2lin/Licenta-Adriana.git
cd Licenta-Adriana
chmod +x deploy.sh
./deploy.sh
```

### Metoda 2: Manual cu Docker Compose
```bash
# Instalare Docker (dacă nu e instalat)
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin

# Clone & Deploy
git clone https://github.com/cata2lin/Licenta-Adriana.git
cd Licenta-Adriana
cp .env.example .env
nano .env                      # Editează credențiale
docker compose up -d --build   # Build & start

# Verificare
docker compose ps              # Status servicii
docker compose logs -f         # Vizualizare loguri
```

### Comenzi Utile
```bash
docker compose down            # Oprire
docker compose up -d --build   # Rebuild complet
docker compose logs backend    # Loguri backend
docker compose exec db psql -U agritech -d agritech_db  # SQL console
```

---

## Conformitate Legală

| Standard | Implementare |
|----------|-------------|
| CAEN 4611 | Intermediar digital, fără clearing |
| Art. 331 CF | Tax Engine cu Taxare Inversă |
| Legea 81/2022 | Conciliere obligatorie (3 mesaje min.) |
| DAC7 (EU 2021/514) | Raport F7000 anual ANAF |
| PSD2/PSD3 | Split payment, Escrow Safeguarded |
| RO e-Transport | Generare coduri UIT |

## Licență

Proiect de licență — Universitate.
