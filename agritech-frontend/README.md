# AgriConnect B2B — Frontend

> Piața Agricolă Digitală B2B pentru România. Conectează producătorii agricoli cu cumpărătorii comerciali folosind Escrow PSD2, verificare ANAF și logistică integrată.

## Quick Start

```bash
npm install
npm run dev          # Development server → http://localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build
```

---

## Arhitectura Proiectului

```
src/
├── components/          # Componente UI reutilizabile
│   ├── ui/              # Componente generice (izolate)
│   │   ├── Modal.jsx         # Overlay modal cu Escape, click-outside, scroll-lock
│   │   ├── PageHeader.jsx    # Titlu pagină + buton Înapoi (44px touch target)
│   │   ├── StatCard.jsx      # Card statistici pentru dashboards
│   │   ├── ConfirmDialog.jsx # Dialog confirmare acțiuni distructive
│   │   └── index.js          # Barrel export
│   ├── Navbar.jsx       # Navigație principală (auth-aware, notificări)
│   └── Toast.jsx        # Notificări toast animate
├── context/
│   └── AppContext.jsx   # State management global (Auth, Listings, Orders, Notifications)
├── data/                # Date mock (în producție → API calls)
│   ├── listings.js      # Oferte spot market + tipuri + metadata mărfuri
│   └── orders.js        # Comenzi, notificări, constante taxe platformă
├── hooks/
│   └── useLocalStorage.js   # Hook personalizat pentru persistență localStorage
├── pages/               # Pagini (1 per rută)
│   ├── Landing.jsx      # Pagina principală cu hero, features, prețuri live
│   ├── Login.jsx        # Autentificare + Înregistrare + simulare ANAF CUI
│   ├── Dashboard.jsx    # Dashboard fermier (stats, oferte, comenzi, activitate)
│   ├── Market.jsx       # Piața Spot (căutare, filtrare, sortare, negociere)
│   ├── CreateListing.jsx # Formular adăugare ofertă (slidere, auto NC/Standard)
│   ├── Orders.jsx       # Comenzi & Contracte (tab-uri, escrow, timeline)
│   ├── Logistics.jsx    # Logistică (curse, status, calculator Make-or-Buy)
│   ├── Disputes.jsx     # Soluționare dispute (chat, refund slider, ADR)
│   ├── Profile.jsx      # Profil companie (4 tab-uri: info, banking, docs, setări)
│   └── Admin.jsx        # Panou admin (KPIs, KYC queue, DAC7, grafice)
├── utils/
│   └── formatters.js    # Funcții formatare (RON, procente, date, ID-uri)
├── App.jsx              # Router + Provider wrapper
├── main.jsx             # Entry point
└── index.css            # Design system global (dark theme, green/gold)
```

---

## Principii de Design

### Modularitate (DDD / Agile Sprint)
- **Fiecare fișier** are o singură responsabilitate
- **Componentele UI** din `components/ui/` sunt 100% izolate — nu importă context
- **Datele mock** din `src/data/` pot fi înlocuite cu API calls fără a modifica UI-ul
- **Contextul** grupează acțiunile pe domenii (Auth / Listings / Orders / Notifications)
- **Modificarea unui modul NU impactează celelalte** — ex: schimbarea logicii de filtrare a pieței nu afectează comenzile

### UX pentru Fermieri
- **Butoane mari** — minim 44px înălțime (standard accesibilitate)
- **Buton "Înapoi"** pe toate paginile secundare (CreateListing → Market, Orders → Dashboard)
- **Confirmare** înainte de acțiuni distructive (ștergere ofertă, eliberare escrow)
- **Notificări vizuale** — toast-uri animate la fiecare acțiune
- **Limbă română** — toate textele sunt în română
- **Navigație simplă** — navbar persistent cu evidențiere pagină activă
- **Persistență** — datele se salvează în localStorage (refresh nu pierde nimic)

### Scalabilitate
- **Custom hooks** (`useLocalStorage`) elimină duplicarea codului
- **Barrel exports** (`components/ui/index.js`) pentru import-uri curate
- **Funcții utilitare** centralizate (`formatRON`, `formatDate`, `generateId`)
- **Constante** separate de logică (`PLATFORM_FEES`, `COMMODITY_TYPES`)

---

## Pagini & Funcționalități

### 🏠 Landing Page (`/`)
- Hero section, features (Escrow PSD2, ANAF, Logistică), prețuri live
- CTA-uri: "Începe Acum" → Login, "Explorează Piața" → Market

### 🔐 Login / Register (`/login`)
- Tab-uri Autentificare / Înregistrare
- Simulare verificare CUI la ANAF (onBlur cu loading state)
- Roluri: Fermier, Cumpărător Comercial, Transportator
- Redirect automat la Dashboard după auth
- Navbar ascuns pe această pagină

### 📊 Dashboard Fermier (`/dashboard`)
- KPIs calculate din date reale: oferte active, contracte, venituri, rating
- Tabel oferte cu buton **Șterge** (cu confirmare)
- Timeline activitate din notificări
- Tabel ultimele comenzi cu link rapid

### 🛒 Piața Spot (`/market`)
- Căutare live (marfă, firmă, locație)
- Filtru tip marfă + Sortare (preț ↑↓, cantitate)
- **Modal Detalii** — parametri biochimici, cod NC, standard, valoare
- **Modal Negociere** — preț editabil, calcul discount, creare comandă Escrow
- Buton "+ Adaugă Ofertă" pentru utilizatori autentificați

### ➕ Adaugă Ofertă (`/create-listing`)
- **Buton ← Înapoi** la Piața Spot
- Slidere interactive parametri biochimici
- Auto-fill Cod NC + Standard la schimbarea mărfii
- Calcul live Valoare Totală + Comision 2%
- Publicare → oferta apare instant în Piața Spot

### 📋 Comenzi & Contracte (`/orders`)
- **Buton ← Înapoi** la Dashboard
- Tab-uri cu contoare (Active, În Tranzit, Finalizate, Dispute)
- Click pe rând → detalii contract cu Timeline + Escrow Breakdown
- **Confirmă Recepția** (cu dialog confirmare) → eliberare fonduri
- **Deschide Dispută** → redirect la pagina Dispute

### 🚛 Logistică & Transport (`/logistics`)
- Creare cursă nouă (de la, către, marfă)
- Actualizare status: Programat → În drum → Livrat (cu generare cod UIT)
- Panel detalii cu comparație cost (Flotă Proprie vs Piața Liberă)
- Calculator Make-or-Buy interactiv

### ⚖️ Soluționare Dispute (`/disputes`)
- Comparație parametri (contractat vs recepționat)
- Chat funcțional (text + Enter)
- Slider refund cu calcul live procentual
- Acțiuni: Propune Reducere, Acceptă Soluția, Escaladează ADR

### 👤 Profil Companie (`/profile`)
- **Informații Generale** — editare nume, adresă, telefon, email, descriere
- **Date Bancare** — IBAN, vIBAN Mangopay, sold wallet, istoric plăți
- **Documente** — upload/re-upload cu status KYC dinamic
- **Setări** — toggle-uri notificări, limbă, monedă, zona periculoasă

### 🔧 Panou Admin (`/admin`)
- KPIs din date reale (utilizatori, tranzacții, dispute, comisioane)
- Grafice volum tranzacții + distribuție mărfuri
- KYC queue cu approve/reject + activity log live
- Generare raport DAC7 (F7000) cu loading state

---

## State Management (Hybrid: API + localStorage)

| Domeniu | Sursă | Acțiuni |
|---------|-------|---------|
| Auth (user) | API → localStorage fallback | `login()`, `register()`, `logout()` |
| JWT Token | localStorage | Auto-inject via `api.js` |
| Listings (oferte) | localStorage (→ API migration) | `addListing()`, `removeListing()` |
| Orders (comenzi) | localStorage (→ API migration) | `addOrder()`, `updateOrderStatus()` |
| Notifications | session-only | `addNotification()`, `markNotificationRead()` |
| Toasts | ephemeral (4s auto-dismiss) | `addToast()` |

---

## API Service Layer (`src/services/`)

```
services/
├── api.js              # Base HTTP client (JWT auto-inject, CORS, error handling)
├── authService.js      # POST /iam/login, /iam/register
├── tradingService.js   # /trading/commodities, /trading/listings (JSONB search)
├── financialService.js # /financial/orders, /financial/escrow
├── transportService.js # /transport/shipments, /transport/route
├── disputesService.js  # /disputes, /disputes/:id/messages, propose/accept/escalate
└── index.js            # Barrel export
```

**Import:** `import { authService, tradingService } from '../services';`

**Hybrid auth:** Login/Register tries the backend API first. If the backend is unreachable (network error), falls back to localStorage mock login for demo mode.

---

## Componente Reutilizabile

| Component | Utilizare | Props |
|-----------|-----------|-------|
| `Modal` | Market, Disputes | `isOpen`, `onClose`, `title`, `width`, `children` |
| `PageHeader` | Toate paginile | `title`, `highlight`, `showBack`, `backTo`, `children` |
| `StatCard` | Dashboard, Admin, Logistics | `title`, `value`, `suffix`, `icon`, `badge` |
| `ConfirmDialog` | Dashboard, Orders | `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `type` |

---

## Cum să adaugi o pagină nouă

1. Creează fișier în `src/pages/NouaPagina.jsx`
2. Importă componentele UI: `import { PageHeader, Modal } from '../components/ui'`
3. Importă datele: `import { COMMODITY_TYPES } from '../data/listings'`
4. Importă contextul: `import { useApp } from '../context/AppContext'`
5. Adaugă ruta în `src/App.jsx`: `<Route path="/noua" element={<NouaPagina />} />`
6. Adaugă link-ul în `src/components/Navbar.jsx`

---

## Deploy

### Frontend
```bash
npm run build              # Build producție → dist/
# Deploy pe: Vercel, Netlify, Firebase Hosting, nginx, Apache
```

### Backend (NestJS)
```bash
cd agritech-backend
npm install
# Configurează .env: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, JWT_SECRET
npm run start:dev          # Dev server → http://localhost:3000/api/v1
# După prima pornire, rulează migrațiile:
psql -d agritech_db -f migrations/001_gin_indexes.sql
psql -d agritech_db -f migrations/002_seed_commodities.sql
```

### Environment Variables

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:3000/api/v1
```

**Backend** (`.env`):
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=agritech_db
JWT_SECRET=your-production-secret-key-here
PORT=3000
```

---

## Tech Stack

- **React 18** + **React Router 6** — Frontend
- **NestJS** + **TypeORM** — Backend (5 moduli DDD izolate)
- **PostgreSQL** + **JSONB/GIN** — Database (căutare biochimică sub-ms)
- **Vite 5** — Build tool
- **Vanilla CSS** — Design system custom (dark theme, glassmorphism)
- **JWT + bcrypt** — Autentificare securizată

## Backend API (40+ endpoint-uri)

| Modul | Prefix | Funcționalitate |
|-------|--------|-----------------|
| IAM | `/api/v1/iam` | Register, Login, JWT |
| Trading | `/api/v1/trading` | Commodities CRUD, Listings JSONB Search |
| Financial | `/api/v1/financial` | Orders (95/3/2% split), Escrow, Tax Engine |
| Transport | `/api/v1/transport` | Shipments, OSRM routing, UIT, 123cargo bidding |
| Disputes | `/api/v1/disputes` | ADR disputes, Chat, Propose/Accept, Escalate |
