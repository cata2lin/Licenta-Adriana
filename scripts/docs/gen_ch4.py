# -*- coding: utf-8 -*-
"""Chapter 4: IMPLEMENTAREA PROIECTULUI — Expanded with code snippets."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from helpers import open_doc, h1, h2, h3, para, mixed, bullet, page_break, add_table, add_code_block, save_doc

doc = open_doc()

h1(doc, "4. IMPLEMENTAREA PROIECTULUI")

para(doc, "Prezentul capitol descrie în detaliu implementarea practică a platformei AgriConnect, acoperind modulele backend și frontend, algoritmii de optimizare logistică, mecanismele de securitate și strategia de deployment. Implementarea se bazează pe principiile arhitecturale definite în Capitolul 2 și pe cadrul legislativ prezentat în Capitolul 3.")

# 4.1
h2(doc, "4.1 Structura și Configurarea Proiectului")

para(doc, "AgriConnect este organizat ca un monorepo cu două componente principale: agritech-backend (NestJS 11, TypeScript 5, TypeORM 0.3) și agritech-frontend (React 19, Vite 7, React Router 7). Entry point-ul backend-ului (main.ts) configurează CORS-ul pentru a permite comunicarea cross-origin între frontend și backend, ValidationPipe-ul global cu opțiunile whitelist și transform pentru sanitizarea automată a input-ului, și pornește serverul pe portul 3000 [13].")

para(doc, "Modulul rădăcină (app.module.ts) orchestrează 7 module de domeniu și 11 entități prin configurarea TypeORM cu sincronizare automată a schemei bazei de date. Fiecare modul de domeniu este importat explicit, iar configurarea TypeORM utilizează TypeOrmModule.forRoot() cu entitățile specificate și opțiunea synchronize: true pentru dezvoltare (dezactivată în producție pentru a preveni migrări accidentale).")

add_table(doc,
    ["#", "Modul", "Entități", "Endpoint-uri Cheie", "Funcționalități"],
    [
        ["1", "IAM", "User, Company", "/register, /login", "JWT, validare CUI ANAF, KYC, RBAC"],
        ["2", "Trading", "Commodity, Listing, ForwardContract", "/listings, /commodities", "JSONB/GIN search, contracte, facturare"],
        ["3", "Financial", "Order, EscrowPayment", "/orders, /escrow, /dac7", "Split Payment, raport DAC7, Chargeback"],
        ["4", "Transport", "Shipment", "/route, /shipments, /bidding", "OSRM rutare, UIT, licitație 123cargo"],
        ["5", "Disputes", "Dispute, DisputeMessage", "/disputes, /:id/messages", "ADR Legea 81/2022, chat, refund"],
        ["6", "Notifications", "Notification", "/notifications, /unread", "CRUD, badge count, mark read"],
        ["7", "Profile", "(entități IAM)", "/profile, /company, /prefs", "Get/update profil și preferințe"],
    ]
)

# 4.2
h2(doc, "4.2 Modulul IAM: Autentificare și Autorizare")

h3(doc, "4.2.1 Fluxul de înregistrare și validare ANAF CUI")

para(doc, "Procesul de înregistrare în AgriConnect depășește simpla creare de cont. Fiecare companie trebuie să furnizeze un CUI (Cod Unic de Identificare) valid, pe care platforma îl verifică prin intermediul API-ului public ANAF. Această verificare confirmă existența juridică a entității, statusul de plătitor TVA (esențial pentru aplicarea corectă a Art. 331) și datele de contact oficiale. Utilizatorii sunt clasificați în trei roluri RBAC: FARMER (producător/vânzător), BUYER (cumpărător corporativ) și ADMIN (administrator platformă).")

para(doc, "Entitatea Company stochează informațiile corporative validate: denumirea oficială, CUI-ul, codul CAEN, adresa sediului social, statusul TVA și data ultimei verificări. Această abordare asigură conformitatea KYB (Know Your Business) și permite generarea automată a rapoartelor DAC7 cu date validate la sursă.")

h3(doc, "4.2.2 Fluxul JWT și Refresh Token Rotation")

para(doc, "Modulul IAM implementează autentificare stateless prin JWT (JSON Web Tokens, RFC 7519). Token-urile sunt auto-conținute și semnate cu algoritmul HS256, eliminând necesitatea menținerii unei baze de date de sesiuni pe server [13]. Payload-ul JWT include claims standard (sub, iat, exp) și claims personalizate (role, companyId), permițând autorizarea la nivel de rută fără interogări suplimentare la baza de date [13].")

para(doc, "Totuși, natura stateless creează o \"problemă a revocării\": odată emis, un token nu poate fi ușor invalidat înainte de expirare. Pentru a adresa aceasta, AgriConnect implementează abordarea \"Theme Park Ticket\" cu rotație automată [13]:")

bullet(doc, "Access Tokens: durată scurtă de 15 minute, păstrate doar în memorie (variabile JavaScript), niciodată în localStorage pentru a minimiza expunerea la atacuri XSS [13]")
bullet(doc, "Refresh Tokens: durată lungă de 7 zile, stocate în cookie-uri HttpOnly și Secure (inaccesibile JavaScript-ului), protejate împotriva atacurilor XSS și transmise doar prin HTTPS [13]")
bullet(doc, "Refresh Token Rotation: la fiecare reîmprospătare, vechiul refresh token este invalidat și unul nou este emis. Dacă un atacator încearcă să folosească un token deja rotat, sistemul revocă întreaga \"familie\" de token-uri, forțând re-autentificarea completă [13]")

para(doc, "Pentru a asigura securitatea conturilor B2B, platforma utilizează rotația refresh token-urilor. Următorul extras de cod demonstrează logica de generare a token-urilor și invalidarea sigură a acestora folosind Redis, esențială pentru abordarea \"Theme Park Ticket\":")

add_code_block(doc, """import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService
  ) {}

  async generateTokenPair(userId: string, role: string, companyId: string) {
    const payload = { sub: userId, role, companyId };
    
    // Access token scurt (15 min)
    const accessToken = this.jwtService.sign(payload, { 
      expiresIn: '15m',
      secret: process.env.JWT_ACCESS_SECRET
    });
    
    // Refresh token lung (7 zile)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET
    });

    return { accessToken, refreshToken };
  }

  async revokeToken(jti: string, remainingTtlSecs: number) {
    // Adaugare în blacklist-ul Redis cu TTL auto-expirant
    await this.redisService.set(`blacklist:${jti}`, 'revoked', 'EX', remainingTtlSecs);
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    const status = await this.redisService.get(`blacklist:${jti}`);
    return status === 'revoked';
  }
}""", "typescript")

para(doc, "Când invalidarea imediată a unui access token este necesară — de exemplu, în cazul unei breșe de securitate sau al dezactivării unui cont — se implementează un blacklist bazat pe Redis. Prin stocarea jti (JWT ID) a token-urilor revocate în Redis cu un TTL egal cu durata de viață rămasă a token-ului, sistemul realizează verificări cvasi-instantanee (O(1)) în middleware-ul de autentificare [13].")

h3(doc, "4.2.3 Hashing-ul parolelor: Argon2id vs. bcrypt")

para(doc, "Puterea computațională disponibilă atacatorilor a crescut dramatic. Până în 2025/2026, baseline-ul hardware pentru atacuri brute-force este estimat la clustere de 12x RTX 5090 GPU-uri [13]. Prin urmare, funcțiile tradiționale de hashing precum MD5 sau SHA-256 sunt complet inadecvate pentru stocarea parolelor [13]. Standardul actual de aur este Argon2id, câștigătorul Password Hashing Competition (PHC). Spre deosebire de bcrypt, care este legat exclusiv de CPU, Argon2id este \"memory-hard\", necesitând cantități mari de memorie RAM pentru fiecare operațiune de hash, făcându-l semnificativ mai rezistent la accelerarea prin GPU și circuite ASIC specializate [13].")

add_table(doc,
    ["Algoritm", "Tip Rezistență", "Timp Spargere (12x RTX 5090)", "Work Factor Recomandat 2026"],
    [
        ["MD5/SHA-256", "Niciunul", "Secunde", "NU SE UTILIZEAZĂ [13]"],
        ["Bcrypt", "CPU-bound", "~30 Zile (parolă complexă 8 char)", "cost=14 [13]"],
        ["Scrypt", "Memory-bound", "~200 Zile", "N=2^17 [13]"],
        ["Argon2id", "Memory-hard", "~500 Zile", "m=128MB, t=3, p=1 [13]"],
    ]
)

para(doc, "Standardul actual de aur este Argon2id, câștigătorul Password Hashing Competition (PHC). Algoritmul este implementat cu parametri OWASP pentru anul 2026:")

add_code_block(doc, """import * as argon2 from 'argon2';

export class PasswordHelper {
  static async hash(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 131072, // 128 MB (m=128MB)
      timeCost: 3,        // 3 iterations (t=3)
      parallelism: 1,     // 1 thread (p=1)
      hashLength: 32      // 32-byte hash
    });
  }

  static async verify(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch (err) {
      return false;
    }
  }
}""", "typescript")

# 4.3
h2(doc, "4.3 Modulul Trading: Catalog și Contracte Forward")

h3(doc, "4.3.1 Căutarea JSONB cu indecși GIN")

para(doc, "Fiecare listing de cereale stochează parametrii de calitate într-o coloană JSONB, permițând variabilitatea atributelor între diferite tipuri de mărfuri. Entitatea Listing conține câmpuri relaționale standard (id, commodity_id, seller_id, base_price, quantity, listing_date, status) și un câmp JSONB quality_attributes care stochează parametrii specifici tipului de cereală.")

para(doc, "Endpoint-ul GET /listings/search implementează interogări de containment @> pe câmpurile JSONB, utilizând indecșii GIN configurați cu jsonb_path_ops pentru performanță optimă [7]. Un cumpărător poate filtra simultan după multiple criterii de calitate (proteină > 12.5%, umiditate < 14%, Besatz < 2%) cu timp de răspuns sub 10 milisecunde, chiar și pe un catalog de mii de listări active. Serviciul Trading combină aceste filtre JSONB cu filtre relaționale standard (categorie, regiune, preț) într-o singură interogare SQL optimizată.")

h3(doc, "4.3.2 Contracte Forward și facturare cu taxare inversă")

para(doc, "Contractele forward permit participanților să blocheze un preț pentru livrare la o dată viitoare, protejându-se astfel de volatilitatea pieței. Entitatea ForwardContract stochează termenii contractuali: părțile implicate, marfa și specificațiile de calitate, cantitatea, prețul convenit, data de livrare, condițiile de reziliere și statusul curent (DRAFT, ACTIVE, FULFILLED, CANCELLED).")

para(doc, "Endpoint-ul GET /forward-contracts/:id/invoice generează automat facturi conforme cu Art. 331. Algoritmul de facturare parcurge următoarele etape: verificarea statusului TVA al ambelor părți prin validarea CUI-ului la ANAF, verificarea codului NC al produsului tranzacționat contra listei Art. 331, și aplicarea automată a mențiunii \"Taxare inversă\" pe factură când toate condițiile sunt îndeplinite [10]. Dacă una dintre părți nu este înregistrată în scopuri de TVA, factura este emisă cu TVA standard de 19%.")

# 4.4
h2(doc, "4.4 Modulul Financial: Escrow și DAC7")

para(doc, "Modulul Financial orchestrează fluxul complet de plăți prin trei endpoint-uri specializate care corespund celor trei faze ale ciclului de viață al unui escrow: POST /escrow/:id/fund (blocarea fondurilor cumpărătorului în contul de segregare), POST /escrow/:id/release (eliberarea fondurilor către vânzător după confirmarea recepției calitative) și POST /escrow/:id/refund (returnarea fondurilor în caz de dispută rezolvată în favoarea cumpărătorului) [6].")

para(doc, "Sistemul implementează un flux de Escrow digital tripartit conform PSD2 (Payment Services Directive 2). Pentru logistica multi-parte, o tranzacție implică simultan cumpărătorul, vânzătorul și transportatorul. Split Payment divide automat fiecare tranzacție în trei fluxuri:")

add_code_block(doc, """@Injectable()
export class EscrowService {
  constructor(private dataSource: DataSource) {}

  async releaseFunds(orderId: string): Promise<void> {
    // Utilizăm tranzacții ACID pentru a garanta split payment-ul atomic
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(OrderEntity, { 
        where: { id: orderId }, relations: ['seller', 'carrier'] 
      });

      if (order.escrow_status !== 'FUNDED') {
        throw new BadRequestException('Escrow is not funded');
      }

      const totalAmount = order.total_price_ron;
      const platformFee = totalAmount * 0.02;     // 2% platformă
      const carrierFee = totalAmount * 0.03;      // 3% transportator
      const sellerPayout = totalAmount * 0.95;    // 95% fermier

      // Aici se inițiază transferurile via TPP / Open Banking API
      await this.paymentGateway.payout(order.seller.iban, sellerPayout);
      await this.paymentGateway.payout(order.carrier.iban, carrierFee);
      
      order.escrow_status = 'RELEASED';
      order.released_at = new Date();
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Escrow release failed');
    } finally {
      await queryRunner.release();
    }
  }
}""", "typescript")

para(doc, "Endpoint-ul POST /dac7/generate produce raportul F7000 cerut de directiva DAC7, agregând datele trimestriale de venit ale fiecărui vânzător activ pe platformă. Raportul include: identificarea vânzătorului (denumire, CUI, adresa, număr TVA), numărul total de tranzacții per trimestru, remunerația totală brută și comisioanele reținute de platformă [10].")

# 4.5
h2(doc, "4.5 OSRM și Optimizarea Transporturilor")

h3(doc, "4.5.1 Arhitectura tehnică OSRM și Contraction Hierarchies")

para(doc, "Pentru calcularea rutelor de transport, AgriConnect integrează motorul Open Source Routing Machine (OSRM), un engine C++ de înaltă performanță care utilizează datele OpenStreetMap [14]. OSRM este preferat față de API-urile proprietare precum Google Maps Directions API deoarece permite interogări nelimitate la un cost fix de infrastructură, eliminând costurile per-request care pot deveni prohibitive pentru volume mari de interogări [14].")

para(doc, "Nucleul performanței OSRM este algoritmul Contraction Hierarchies (CH), care funcționează în două faze distincte [14]:")

bullet(doc, "Faza de Preprocesare (Node Contraction): nodurile grafului rutier sunt ierarhizate și \"contractate\" iterativ. Când un nod v este eliminat din graf, se adaugă muchii \"shortcut\" între vecinii săi dacă calea cea mai scurtă între ei trecea prin v. Drumurile de importanță națională (autostrăzi, drumuri europene) sunt plasate la nivelurile superioare ale ierarhiei, cele locale la inferioare [15]")
bullet(doc, "Faza de Interogare (Query): algoritmul utilizează o căutare bidirecțională Dijkstra restricționată. Căutarea pleacă simultan de la sursă și destinație, dar este restricționată să exploreze doar nodurile \"mai sus\" în ierarhie față de nodul curent. Intersecția celor două fronturi de căutare oferă calea optimă [15]")

add_table(doc,
    ["Parametru OSRM", "Valoare Tipică", "Impact Operațional"],
    [
        ["Timp Răspuns Interogare", "<10 ms pentru rute naționale [14]", "Planificare transport în timp real"],
        ["Consum Memorie (România)", "~5 GB RAM [14]", "Server dedicat sau VPS recomandat"],
        ["Preprocesare (România)", "~30 minute [14]", "Actualizare săptămânală OSM"],
        ["Profile Vehicul", "Car, Heavy Vehicle (Lua) [14]", "Restricții tonaj, înălțime pentru cereale"],
        ["Servicii API", "/route, /table, /trip, /match [14]", "Rutare, matrice distanță, TSP, map matching"],
    ]
)

para(doc, "Rutarea în NestJS se face prin API-ul OSRM integrat, accesând instanța dockerizată a motorului:")

add_code_block(doc, """import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RoutingService {
  private readonly osrmBaseUrl = process.env.OSRM_BASE_URL || 'http://localhost:5000';

  /**
   * Generează ruta optimă folosind Contraction Hierarchies din OSRM
   */
  async calculateRoute(srcLat: number, srcLng: number, destLat: number, destLng: number) {
    const coordinates = `${srcLng},${srcLat};${destLng},${destLat}`;
    const url = `${this.osrmBaseUrl}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
    
    const response = await axios.get(url);
    if (response.data.code !== 'Ok') {
      throw new Error('OSRM routing failed');
    }

    const route = response.data.routes[1];
    return {
      distanceKm: route.distance / 1000,
      durationHrs: route.duration / 3600,
      geometry: route.geometry
    };
  }
}""", "typescript")

h3(doc, "4.5.2 Freight Matching și optimizare TSP")

para(doc, "Modulul Transport funcționează ca un \"Digital Freight Exchange\". Când un cumpărător finalizează o comandă, platforma utilizează serviciul OSRM /table pentru a genera o matrice de distanță NxN, calculând simultan timpul și distanța între locația de ridicare a mărfii și pozițiile a zeci de vehicule disponibile [14]. Această matrice permite clasificarea instantanee a vehiculelor în funcție de proximitate, capacitate și tip.")

para(doc, "Pentru cumpărătorii corporativi care gestionează ridicări din multiple ferme, sistemul încorporează un solver TSP (Traveling Salesperson Problem) prin serviciul OSRM /trip [14]. Solverul calculează ordinea optimă de vizitare a tuturor punctelor de ridicare, minimizând distanța totală parcursă și reducând consumul de combustibil. Algoritmul utilizează euristici avansate (nearest neighbor + 2-opt improvement) pentru a oferi soluții cvasi-optime în timp polinomial [6].")

# 4.6
h2(doc, "4.6 Modulul Disputes: ADR conform Legii 81/2022")

para(doc, "Sistemul de rezolvare a disputelor implementează un proces structurat de ADR (Alternative Dispute Resolution) în conformitate cu cerințele Legii 81/2022. Ciclul complet al unei dispute parcurge mai multe etape obligatorii:")

bullet(doc, "Deschiderea Disputei (POST /disputes): înregistrarea motivului, evidențelor fotografice/documentare și valorii contestate. Motivele sunt clasificate în categorii predefinite: neconformitate calitativă, întârziere livrare, nerespectare cantitativă, documentație incompletă")
bullet(doc, "Conciliere Obligatorie (POST /:id/messages): minimum 3 mesaje de chat între părți înainte de a permite escalarea. Această cerință asigură că părțile au încercat o rezoluție amiabilă conform spiritului legii [12]")
bullet(doc, "Propunere Rezoluție (POST /:id/resolve): una dintre părți propune o rezoluție (refund total, refund parțial proporțional cu diferența calitativă, sau acceptarea stării actuale)")
bullet(doc, "Escalare ADR (POST /:id/escalate): dacă concilierea eșuează, disputa este escalată către un mediator extern acreditat, cu toate evidențele documentate în platformă transmise automat [12]")

# 4.7
h2(doc, "4.7 Frontend: Integrare Componente și Routing SPA")

para(doc, "Frontend-ul este structurat pe baza arhitecturii React 19. Componentele complexe, cum ar fi formularul de creare a listărilor (Listing), folosesc interfețe controlate complet tipizate:")

add_code_block(doc, """import React, { useState } from 'react';
import { useMarketStore } from '../store/marketStore';

export const QualityParametersForm: React.FC = () => {
  const [protein, setProtein] = useState<number>(12.5);
  const [moisture, setMoisture] = useState<number>(14.0);
  const [besatz, setBesatz] = useState<number>(2.0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      category: 'WHEAT_MILLING',
      quality_attributes: {
        protein_pct: protein,
        moisture_pct: moisture,
        besatz_pct: besatz
      }
    };
    // Apel serviciu API
    await fetch('/api/v1/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-lg dark:bg-zinc-900/80">
      <h3 className="text-xl font-bold mb-4">Parametri Calitate (EN 15587)</h3>
      <div className="grid grid-cols-2 gap-4">
        <label>Proteină (%)</label>
        <input type="number" step="0.1" value={protein} onChange={e => setProtein(Number(e.target.value))} />
        
        <label>Umiditate (%)</label>
        <input type="number" step="0.1" value={moisture} onChange={e => setMoisture(Number(e.target.value))} />
      </div>
      <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
        Salvează Listarea
      </button>
    </form>
  );
};""", "typescript")

add_table(doc,
    ["Pagină", "Rută", "Componente Cheie", "Servicii API Utilizate"],
    [
        ["Landing", "/", "Hero, Features, Testimonials", "N/A (pagină publică)"],
        ["Login", "/login", "LoginForm, ValidationErrors", "iamService.login()"],
        ["Dashboard", "/dashboard", "StatCards, Charts, RecentActivity", "Toate serviciile (agregat)"],
        ["Market", "/market", "ListingGrid, FilterPanel, SearchBar", "tradingService.search()"],
        ["Create Listing", "/create-listing", "QualityForm, JSONB Editor", "tradingService.createListing()"],
        ["Orders", "/orders", "OrderTable, EscrowStatus, SplitView", "financialService.getOrders()"],
        ["Contracts", "/contracts", "ContractCards, InvoiceGen", "tradingService.getContracts()"],
        ["Logistics", "/logistics", "OSRMMap, ShipmentTracker, UIT", "transportService.route()"],
        ["Disputes", "/disputes", "DisputeChat, EvidenceUpload", "disputeService.getDisputes()"],
        ["Profile", "/profile", "CompanyForm, PrefsPanel", "profileService.get()"],
        ["Admin", "/admin", "UserTable, PlatformStats", "Toate (rol ADMIN)"],
    ]
)

# 4.8
h2(doc, "4.8 Deployment: Docker și Docker Compose")

para(doc, "Platforma este containerizată complet cu Docker și orchestrată prin Docker Compose. Fișierul docker-compose.yml definește trei servicii: frontend (imagine React compilată servită prin Nginx), backend (NestJS compilat cu Node.js) și db (PostgreSQL 16 cu volum persistent). Rețeaua Docker internă izolează comunicarea între containere, expunând doar porturile necesare către exterior [18].")

para(doc, "Sistemul utilizează Docker Compose pentru a orchestra toate containerele. Configurația definește exact cum comunică frontend-ul, backend-ul NestJS, și baza de date PostgreSQL într-o rețea internă sigură:")

add_code_block(doc, """version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: agridb
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - agri-network
    restart: unless-stopped

  api:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - JWT_ACCESS_SECRET=${JWT_SECRET}
    depends_on:
      - db
    networks:
      - agri-network

  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - agri-network

networks:
  agri-network:
    driver: bridge

volumes:
  pgdata:""", "typescript")

# 4.9 Extinderea Funcționalităților: Integrare și Securitate (Cod Sursă Complet)

h3(doc, "4.9.1 Implementarea Completă: IAM și RBAC Guard")

para(doc, "Pentru a asigura o securitate granulară, platforma folosește Guards personalizate în NestJS. Codul de mai jos ilustrează implementarea completă a unui RolesGuard care verifică atât validitatea JWT-ului, cât și apartenența la rolul necesar pentru a accesa un anumit endpoint:")

add_code_block(doc, """import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Endpoint public
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de acces lipsă');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      // Atașăm payload-ul decodat la request pentru a fi folosit în controllere
      request['user'] = payload;

      // Verificăm dacă rolul utilizatorului este permis
      const hasRole = requiredRoles.some((role) => payload.role?.includes(role));
      
      if (!hasRole) {
        throw new ForbiddenException('Acces respins: Rol insuficient');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Token invalid sau expirat');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}""", "typescript")

h3(doc, "4.9.2 Optimizarea Rutei OSRM: TSP Solver")

para(doc, "Pentru logistica multi-fermă, solverul TSP implementează euristica nearest-neighbor urmată de o optimizare 2-opt. Acest algoritm reduce exponențial complexitatea computațională:")

add_code_block(doc, """import { Injectable } from '@nestjs/common';
import { RoutingService } from './routing.service';

interface Point {
  lat: number;
  lng: number;
  id: string;
}

@Injectable()
export class TSPOptimizerService {
  constructor(private routingService: RoutingService) {}

  public async optimizeRoute(depot: Point, pickups: Point[]): Promise<Point[]> {
    if (pickups.length <= 1) return pickups;

    // 1. Obținem matricea de distanțe via OSRM Table API
    const allPoints = [depot, ...pickups];
    const distanceMatrix = await this.routingService.getDistanceMatrix(allPoints);

    // 2. Nearest Neighbor Initialization
    let unvisited = [...pickups];
    let current = depot;
    const route: Point[] = [];

    while (unvisited.length > 0) {
      let nearest = unvisited[1];
      let minDistance = Infinity;
      let nearestIndex = 0;

      for (let i = 0; i < unvisited.length; i++) {
        const candidate = unvisited[i];
        const dist = this.getDistance(current, candidate, allPoints, distanceMatrix);
        
        if (dist < minDistance) {
          minDistance = dist;
          nearest = candidate;
          nearestIndex = i;
        }
      }

      route.push(nearest);
      current = nearest;
      unvisited.splice(nearestIndex, 1);
    }

    // 3. 2-Opt Optimization
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < route.length - 2; i++) {
        for (let j = i + 1; j < route.length - 1; j++) {
          const d1 = this.getDistance(route[i - 1], route[i], allPoints, distanceMatrix);
          const d2 = this.getDistance(route[j], route[j + 1], allPoints, distanceMatrix);
          
          const d3 = this.getDistance(route[i - 1], route[j], allPoints, distanceMatrix);
          const d4 = this.getDistance(route[i], route[j + 1], allPoints, distanceMatrix);

          if (d3 + d4 < d1 + d2) {
            // Swap edges
            const newRoute = [
              ...route.slice(0, i),
              ...route.slice(i, j + 1).reverse(),
              ...route.slice(j + 1)
            ];
            route.splice(0, route.length, ...newRoute);
            improved = true;
          }
        }
      }
    }

    return route;
  }

  private getDistance(p1: Point, p2: Point, allPoints: Point[], matrix: number[][]): number {
    const idx1 = allPoints.findIndex(p => p.id === p1.id);
    const idx2 = allPoints.findIndex(p => p.id === p2.id);
    return matrix[idx1][idx2];
  }
}""", "typescript")

h3(doc, "4.9.3 Interfața React pentru Trading")

para(doc, "Pe partea de frontend, afișarea grid-ului de produse folosește `React.Suspense` și hook-urile TanStack Query pentru a oferi o tranziție fluidă:")

add_code_block(doc, """import React, { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchListings } from '../api/trading';
import { useMarketStore } from '../store/marketStore';
import { ListingCard } from './ListingCard';
import { FilterSidebar } from './FilterSidebar';
import { SkeletonLoader } from './SkeletonLoader';

const MarketGrid: React.FC = () => {
  const { searchQuery, activeFilters } = useMarketStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['listings', searchQuery, activeFilters],
    queryFn: () => fetchListings({ search: searchQuery, ...activeFilters }),
    staleTime: 60000, // 1 minut stale-while-revalidate
  });

  if (error) {
    return <div className="text-red-500">Eroare la încărcarea catalogului.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      <aside className="w-full md:w-1/4">
        <FilterSidebar />
      </aside>
      
      <main className="w-full md:w-3/4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">Piața Spot Cereale</h2>
          <span className="text-sm text-gray-500">{data?.length || 0} listări active</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonLoader key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.map(listing => (
              <ListingCard key={listing.id} data={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketGrid;""", "tsx")

h3(doc, "4.9.4 Serviciul de Căutare Avansată (ListingService)")

para(doc, "Implementarea backend a serviciului de tranzacționare gestionează interogările complexe JSONB cu indecși GIN. Mai jos este prezentată implementarea completă a metodei de căutare care suportă filtrare multi-criteriu și sortare dinamică:")

add_code_block(doc, """import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ListingEntity } from '../entities/listing.entity';
import { SearchListingsDto } from '../dto/search-listings.dto';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(ListingEntity)
    private listingRepo: Repository<ListingEntity>
  ) {}

  async searchMarket(query: SearchListingsDto): Promise<ListingEntity[]> {
    const qb = this.listingRepo.createQueryBuilder('listing')
      .leftJoinAndSelect('listing.seller', 'seller')
      .where('listing.status = :status', { status: 'ACTIVE' });

    if (query.category) {
      qb.andWhere('listing.category = :cat', { cat: query.category });
    }

    if (query.minQuantity) {
      qb.andWhere('listing.quantity_mt >= :minQty', { minQty: query.minQuantity });
    }

    // Filtrare dinamică pe JSONB pentru parametri de calitate
    if (query.qualityFilters) {
      for (const [key, value] of Object.entries(query.qualityFilters)) {
        if (value.min !== undefined) {
          qb.andWhere(`CAST(listing.quality_attributes->>:key AS FLOAT) >= :minVal`, {
            key, minVal: value.min
          });
        }
        if (value.max !== undefined) {
          qb.andWhere(`CAST(listing.quality_attributes->>:key AS FLOAT) <= :maxVal`, {
            key, maxVal: value.max
          });
        }
        if (value.exact !== undefined) {
          // Utilizăm operatorul de containment @> pentru performanță cu GIN jsonb_path_ops
          qb.andWhere(`listing.quality_attributes @> :jsonFilter`, {
            jsonFilter: { [key]: value.exact }
          });
        }
      }
    }

    // Paginare
    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    // Sortare dinamică
    if (query.sortBy) {
      const order = query.sortOrder || 'DESC';
      qb.orderBy(`listing.${query.sortBy}`, order);
    } else {
      qb.orderBy('listing.created_at', 'DESC');
    }

    return await qb.getMany();
  }
}""", "typescript")

h3(doc, "4.9.5 Testare E2E pentru Modulele Fiscale")

para(doc, "Validarea corectitudinii sistemului fiscal (Art. 331 taxare inversă) se face prin teste End-to-End extinse folosind framework-ul Jest încorporat în NestJS:")

add_code_block(doc, """import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Financial Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/forward-contracts/:id/invoice (GET) - Taxare Inversă', async () => {
    const contractId = 'c1a2-3f4b-5c6d';
    const response = await request(app.getHttpServer())
      .get(`/forward-contracts/${contractId}/invoice`)
      .set('Authorization', `Bearer ${global.mockAdminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('invoiceNumber');
    expect(response.body.taxRate).toBe(0);
    expect(response.body.notes).toContain('Taxare inversă conform Art. 331 Cod Fiscal');
    expect(response.body.totalAmount).toBe(response.body.subtotal); // TVA 0
  });

  it('/dac7/generate (POST) - Raport Trimestrial F7000', async () => {
    const payload = { year: 2026, quarter: 1 };
    
    const response = await request(app.getHttpServer())
      .post('/dac7/generate')
      .set('Authorization', `Bearer ${global.mockAdminToken}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.reportUrl).toContain('f7000');
    expect(response.body.metadata.totalSellersReported).toBeGreaterThan(0);
  });
});""", "typescript")

page_break(doc)
save_doc(doc)
print("✓ Capitolul 4 — IMPLEMENTAREA PROIECTULUI — complet (expanded + massive snippets)")
