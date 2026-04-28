# -*- coding: utf-8 -*-
"""Chapter 2: ARHITECTURA SISTEMULUI ȘI TEHNOLOGII — Expanded with Code Snippets."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from helpers import open_doc, h1, h2, h3, para, mixed, bullet, page_break, add_table, add_code_block, save_doc

doc = open_doc()

h1(doc, "2. ARHITECTURA SISTEMULUI ȘI TEHNOLOGII")

para(doc, "Construirea unui sistem B2B scalabil și rezilient pentru tranzacții agricole necesită o abordare arhitecturală care să poată gestiona complexitatea domeniului fără a introduce datorie tehnică excesivă. Alegerea tehnologiilor NestJS pentru backend și React pentru frontend, alături de o strategie de stocare hibridă în PostgreSQL, oferă echilibrul necesar între performanță, flexibilitate și mentenabilitate pe termen lung [6].")

# 2.1
h2(doc, "2.1 Strategic Design: Domain-Driven Design (DDD)")

h3(doc, "2.1.1 Bounded Contexts și Ubiquitous Language")

para(doc, "La baza DDD se află conceptul de Bounded Context, care definește granița conceptuală în interiorul căreia un model de domeniu specific se aplică. În interiorul acestor granițe, modelele, regulile și termenii rămân consecvenți și semnificativi [6]. Pentru AgriConnect, faza de design strategic identifică mai multe subdomenii distincte, fiecare izolat în propriul Bounded Context pentru a preveni confuzia \"polisemică\" unde același termen ar putea avea sensuri diferite în contexte diferite [6].")

para(doc, "Un exemplu concret al acestei ambiguități apare cu termenul \"Contract\". În contextul Trading, un contract descrie un acord comercial forward cu specificații de calitate și termene de livrare. În contextul Financial, același termen ar putea fi interpretat ca un instrument financiar cu obligații de plată și scadențe. Fără Bounded Contexts, aceste semnificații s-ar amesteca inevitabil în cod, ducând la bug-uri subtile și la o bază de cod greu de întreținut [6].")

add_table(doc,
    ["Bounded Context", "Responsabilitate Primară", "Entități și Agregate Cheie"],
    [
        ["Identity and Access Management (IAM)", "Verificare corporativă, KYB, RBAC", "User, Corporate Entity, Verification Report [6]"],
        ["Trading Context", "Listări spot/forward, negociere prețuri, contractare", "Listing, Bid, Contract, Commodity Attribute [6]"],
        ["Financial Context", "Escrow, split payments, comisioane, conformitate fiscală", "Escrow Account, Transaction, Payment Split [6]"],
        ["Logistics and Routing", "Freight matching, optimizare rute, orchestrare UIT", "Transport Load, Route, Vehicle Profile, UIT Code [6]"],
        ["Dispute Resolution", "Dispute calitate, neconformitate contractuală", "Dispute Case, Evidence, Resolution Path [6]"],
    ]
)

para(doc, "Implementarea unui \"Ubiquitous Language\" este centrală în acest design. Dezvoltatorii și experții de domeniu — precum graderii de cereale și managerii de logistică — colaborează pentru a defini un vocabular partajat [6]. În domeniul tranzacționării de cereale, termeni precum \"Proteină\", \"Greutate Hectolitrică\" și \"Material Străin\" au semnificații precise guvernate de standardele internaționale [3]. Prin încorporarea acestor termeni direct în cod ca parte a modelului de domeniu, AgriConnect asigură că implementarea tehnică reflectă cu fidelitate realitatea comercială a pieței de cereale [6].")

para(doc, "Arhitecții utilizează tehnici de cartografiere strategică, precum EventStorming și Domain Storytelling, pentru a identifica punctele naturale de clivaj în domeniul de business [6]. Aceste granițe se aliniază adesea cu capabilitățile de business mai degrabă decât cu straturile tehnice. O greșeală frecventă în designul monolitului modular este persistența \"tăierii orizontale\" — separarea codului în straturi de prezentare, logică de business și date care traversează întreaga aplicație — ceea ce previne efectiv modularitatea reală [6]. În schimb, \"tăierea verticală\", unde fiecare modul conține propriile straturi interne (Hexagonal sau Clean Architecture), asigură că modulul rămâne cu adevărat independent și potențial extractibil într-un microserviciu în viitor [6].")

h3(doc, "2.1.2 Modular Monolith vs. Microservicii")

para(doc, "După un deceniu de migrare prematură către microservicii, industria a ajuns la un consens care favorizează monolitul modular ca echilibrul optim între viteza de dezvoltare și sustenabilitatea operațională [6]. Spre deosebire de monolitele tradiționale \"Big Ball of Mud\", unde o modificare într-un singur tabel de bază de date poate avea consecințe neprevăzute în întregul sistem, un monolit modular se bazează pe conceptul DDD al Bounded Context pentru a izola complexitatea [6].")

para(doc, "Principalul avantaj al monolitului modular este că oferă beneficiile izolării modulare fără complexitatea operațională a microserviciilor: nu există overhead de comunicare prin rețea, nu necesită orchestrare de containere (Kubernetes), nu implică probleme de consistență distribuită (Saga Pattern), iar debugging-ul rămâne simplu deoarece toate modulele rulează în același proces [6]. Martin Fowler descrie această abordare ca \"Monolith First\" — începe simplu, apoi extrage microservicii doar când beneficiile de scalabilitate justifică costul operațional [6].")

add_table(doc,
    ["Caracteristică", "Monolit Tradițional", "Monolit Modular", "Microservicii"],
    [
        ["Deployment", "Unitate Unică", "Unitate Unică", "Unități Multiple [6]"],
        ["Comunicare", "Apeluri funcții directe", "API/Evenimente in-memory", "Rețea (REST/gRPC/Msg) [6]"],
        ["Consistența Datelor", "Tranzacții ACID", "ACID/Eventual", "Eventual Consistency [6]"],
        ["Complexitate Operațională", "Scăzută", "Scăzută", "Ridicată (Infra) [6]"],
        ["Scalabilitate", "Verticală", "Verticală/Limitată", "Foarte Orizontală [6]"],
        ["Debugging", "Stack trace unic", "Stack trace unic", "Tracing distribuit necesar [6]"],
        ["Timp de Dezvoltare", "Rapid (spaghetti risk)", "Rapid (structurat)", "Lent (orchestrare) [6]"],
    ]
)

h3(doc, "2.1.3 Outbox Pattern și Domain Events")

para(doc, "Menținerea consistenței datelor peste granițele modulelor într-un monolit este mai simplă decât în microservicii, deoarece dezvoltatorii pot utiliza tranzacții locale de bază de date [6]. Totuși, pe măsură ce sistemul crește și apare nevoia de consistență eventuală, distincția dintre Domain Events (interne unui modul) și Integration Events (contracte publice pentru alte module) devine vitală [6].")

para(doc, "Pentru a asigura că un Integration Event nu este niciodată pierdut — cum ar fi eșecul notificării modulului Financial după plasarea unei comenzi — se utilizează Outbox Pattern [6]. În acest pattern, evenimentul este salvat într-o tabelă specializată \"outbox\" în aceeași tranzacție ca actualizarea datelor de business. Un worker de fundal apoi interoghează această tabelă și publică evenimentele către un message broker (ex: BullMQ), asigurând semantici de livrare at-least-once chiar și în cazul crash-urilor de proces [6].")

para(doc, "Această separare între Domain Events și Integration Events permite refactorizarea internă a unui modul fără a afecta consumatorii externi. De exemplu, modulul Trading poate restructura complet modul în care procesează o comandă intern, atât timp cât Integration Event-ul \"OrderConfirmed\" continuă să fie publicat cu aceeași schemă. Acest principiu, cunoscut sub numele de \"Contract Testing\", este esențial pentru mentenabilitatea pe termen lung a sistemelor modulare [6].")

# 2.2
h2(doc, "2.2 Backend: NestJS și TypeScript")

h3(doc, "2.2.1 Dependency Injection și structura modulară")

para(doc, "NestJS a emergut ca framework-ul premier TypeScript pentru monolite modulare enterprise datorită structurii sale opinionate, care oglindește obiectivele de modularitate ale DDD [6]. Framework-ul oferă un sistem robust de Dependency Injection (DI) care automatizează ciclul de viață al serviciilor și repository-urilor, facilitând cuplarea slabă necesară sistemelor modulare [6].")

para(doc, "Codul sursă de mai jos ilustrează modul în care Bounded Context-ul pentru Trading este implementat ca un modul izolat în NestJS, importând doar dependențele necesare și expunând public doar serviciile care reprezintă API-ul său extern:")

add_code_block(doc, """import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingController } from './controllers/trading.controller';
import { ListingService } from './services/listing.service';
import { ContractService } from './services/contract.service';
import { ListingEntity } from './entities/listing.entity';
import { ForwardContractEntity } from './entities/contract.entity';
import { IamModule } from '../iam/iam.module';
import { FinancialModule } from '../financial/financial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListingEntity, ForwardContractEntity]),
    IamModule, // Bounded Context import (read-only verification)
    FinancialModule // Event integration
  ],
  controllers: [TradingController],
  providers: [ListingService, ContractService],
  exports: [ContractService] // Only ContractService is public
})
export class TradingModule {}""", "typescript")

para(doc, "În NestJS, fiecare funcționalitate este încapsulată într-un @Module, care acționează ca un container pentru controllere, servicii și provideri asociați [6]. Providerii sunt înregistrați în cadrul modulului, iar vizibilitatea lor către alte module este strict controlată prin array-ul exports [6]. Acest control explicit asupra API-ului public al unui modul este esențial pentru prevenirea eroziunii arhitecturale într-un monolit [6].")

para(doc, "Ciclul de viață al providerilor în NestJS este gestionat automat de containerul DI. În mod implicit, toți providerii sunt singleton (o singură instanță partajată pe durata de viață a aplicației), dar NestJS suportă și scopuri REQUEST (o instanță nouă per cerere HTTP) și TRANSIENT (o instanță nouă per injecție). Această flexibilitate permite optimizarea utilizării memoriei în funcție de natura serviciului: servicii stateless pot fi singleton, în timp ce servicii care mențin stare specifică cererii (ex: context de audit) pot fi scoped [6].")

add_table(doc,
    ["Componentă Framework", "Responsabilitate", "Best Practice Enterprise"],
    [
        ["Controllers", "Gestionarea cererilor HTTP", "Lean; delegare logică la servicii [6]"],
        ["Services", "Încapsularea logicii de business", "@Injectable() și constructor injection [6]"],
        ["Repositories", "Stratul de acces la date", "Repository pattern pentru izolarea ORM [6]"],
        ["Pipes", "Validare/transformare input", "class-validator combinat cu DTOs [6]"],
        ["Guards", "Autentificare/Autorizare", "Centralizare logică RBAC la nivel de rută [6]"],
        ["Interceptors", "Cross-cutting concerns", "Logging, caching, transformare răspuns [6]"],
        ["Exception Filters", "Gestiune centralizată erori", "Standardizare răspunsuri eroare (RFC 7807) [6]"],
    ]
)

h3(doc, "2.2.2 TypeORM și Repository Pattern")

para(doc, "TypeORM 0.3 servește ca stratul de Object-Relational Mapping, permițând dezvoltatorilor să lucreze cu entități TypeScript în loc de SQL brut [6]. Fiecare entitate este decorată cu @Entity(), iar proprietățile cu @Column(), @PrimaryGeneratedColumn(), etc. Repository Pattern este implementat prin injectarea serviciilor repository generate automat de TypeORM, asigurând că logica de acces la date este izolată de logica de business [6].")

para(doc, "Un aspect critic al configurării TypeORM în NestJS este tratarea relațiilor lazy-loaded vs. eager-loaded. Într-un marketplace cu entități complexe (Listing → Commodity → QualityAttributes → Reviews), încărcarea eager a tuturor relațiilor la fiecare interogare ar genera interogări SQL excesive (\"N+1 query problem\"). TypeORM oferă query builder-ul createQueryBuilder care permite controlul granular al JOIN-urilor, asigurând că doar datele necesare sunt preluate din baza de date [6].")

h3(doc, "2.2.3 Performanță și scalabilitate cu Fastify")

para(doc, "Deși NestJS folosește implicit adaptorul HTTP Express.js, aplicațiile enterprise schimbă adesea acest adaptor cu Fastify pentru a obține un throughput semnificativ mai ridicat [6]. Fastify este proiectat pentru overhead minim și performanță ridicată, oferind adesea o creștere de 2x până la 3x în viteza de procesare a cererilor comparativ cu Express [6]. Acest swap este posibil datorită stratului de abstractizare al NestJS, care permite dezvoltatorilor să interacționeze cu o interfață canonică în loc de biblioteca HTTP subiacentă [6].")

# 2.3
h2(doc, "2.3 Baze de Date: Stocare Hibridă cu PostgreSQL JSONB")

h3(doc, "2.3.1 Avantajele JSONB și provocarea TOAST")

para(doc, "Una dintre provocările principale în marketplace-urile agricole este diversitatea mărfurilor tranzacționate. Deși grâul, porumbul și semințele de floarea-soarelui sunt toate cereale, ele sunt caracterizate de atribute de calitate diferite. Grâul este evaluat pentru conținutul de proteină și greutatea hectolitrică, în timp ce semințele de floarea-soarelui sunt evaluate primar pentru conținutul de ulei [3]. O schemă relațională rigidă ar necesita migrări frecvente și disruptive ale bazei de date [6].")

para(doc, "AgriConnect abordează această provocare utilizând tipul de date JSONB din PostgreSQL, definit direct în entitățile TypeORM:")

add_code_block(doc, """import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

@Entity('listings')
export class ListingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  category: string; // e.g., 'WHEAT_MILLING'

  @Column('decimal', { precision: 10, scale: 2 })
  base_price_ron: number;

  @Column('int')
  quantity_mt: number;

  // Stocare hibridă: atribute dinamice de calitate
  @Index('idx_listings_quality', { type: 'gin' })
  @Column({ type: 'jsonb' })
  quality_attributes: {
    protein_pct?: number;
    moisture_pct?: number;
    besatz_pct?: number;
    falling_number_sec?: number;
  };

  @CreateDateColumn()
  created_at: Date;
}""", "typescript")

para(doc, "Pentru căutări de performanță înaltă, platforma creează indecși GIN (Generalized Inverted Index) pe aceste coloane JSONB. Mai jos este exemplificată modalitatea prin care backend-ul execută interogări pe date JSON structurate folosind operatorul de containment `@>`:")

add_code_block(doc, """// Exemplu de interogare repository folosind query builder și JSONB
async findMatchingListings(minProtein: number, maxMoisture: number): Promise<ListingEntity[]> {
  return await this.listingRepository.createQueryBuilder('listing')
    .where('listing.category = :category', { category: 'WHEAT_MILLING' })
    .andWhere('listing.quality_attributes @> :minProteinJson', {
      minProteinJson: { protein_pct: minProtein }
    })
    .andWhere("CAST(listing.quality_attributes->>'moisture_pct' AS FLOAT) <= :maxMoisture", {
      maxMoisture
    })
    .orderBy('listing.base_price_ron', 'ASC')
    .getMany();
}""", "typescript")

para(doc, "Totuși, stocarea documentelor mari poate duce la \"TOASTing\" (The Oversize Attribute Storage Technique), unde PostgreSQL stochează atributele mai mari de 2 KB într-o tabelă secundară pentru a menține paginile principale de date la dimensiunea standard de 8 KB [6]. Deși TOASTing-ul este gestionat automat, poate introduce latență la citire din cauza necesității de reconstrucție și decompresie a datelor [6]. Analiza performanței arată că, în scenarii de actualizare intensivă (update-heavy workloads), PostgreSQL poate prezenta o utilizare ridicată a CPU, deoarece fiecare actualizare JSONB implică o rescriere a întregului document JSONB, chiar dacă doar un singur câmp se modifică [7].")

h3(doc, "2.3.2 Indexare GIN de înaltă performanță")

para(doc, "Pentru ca un marketplace să fie eficient, cumpărătorii trebuie să poată filtra sute de listări pe baza atributelor specifice de calitate aproape instantaneu. Indecșii B-tree tradiționali sunt ineficienți pentru căutarea în interiorul unui document JSONB, deoarece indexează documentul ca un tot opac [7]. În schimb, AgriConnect utilizează Generalized Inverted Indexes (GIN), un tip de index specializat pentru tipuri de date compozite [8].")

para(doc, "Un index GIN funcționează prin descompunerea valorii compozite JSONB în elementele sale constituente (chei și valori) și indexarea lor individuală. Acest lucru permite executarea eficientă a interogărilor de tip \"containment\" folosind operatorul @> (ex: SELECT * FROM listings WHERE attributes @> '{\"protein\": 12.5}') [7]. PostgreSQL oferă două clase de operatori pentru indecșii GIN pe JSONB: jsonb_ops (implicit, indexează fiecare cheie și valoare, suportă operatorii @>, ?, ?|, ?&) și jsonb_path_ops (indexează doar căi de valori, ~50% mai compact, optimizat pentru @>) [8].")

add_table(doc,
    ["Strategie Index", "Dimensiune", "Operatori Suportați", "Utilizare în AgriConnect"],
    [
        ["B-tree (Standard)", "Compact", "=, <, >, BETWEEN", "Filtrare id, date, category [7]"],
        ["GIN (jsonb_ops)", "Mare", "@>, ?, ?|, ?&", "Filtrare generală atribute [7]"],
        ["GIN (jsonb_path_ops)", "~50% mai mic", "Doar @>", "Filtrare performantă calitate [8]"],
        ["Expression Index", "Compact", "=, <, >", "Ultra-rapid pe câmpuri specifice [6]"],
    ]
)

para(doc, "Implementarea GIN în PostgreSQL include tehnica \"Fast Update\", care utilizează o listă de așteptare pentru a bufferiza intrările noi [8]. Această îmbunătățește semnificativ vitezele INSERT și UPDATE, vital pentru o platformă unde prețurile și disponibilitatea se schimbă frecvent [8]. Totuși, o listă de așteptare mare poate încetini interogările SELECT, necesitând o configurare atentă a parametrului gin_pending_list_limit [6].")

h3(doc, "2.3.3 Validare JSON Schema și Auditare")

para(doc, "Flexibilitatea JSONB poate duce la probleme de integritate a datelor dacă nu este gestionată corect. PostgreSQL 17 abordează aceasta prin introducerea funcțiilor native pentru validare JSON, precum IS JSON, și prin permiterea aplicării JSON Schema în constrângeri CHECK [8]. Aceasta asigură că datele invalide nu ajung niciodată la stratul de persistență, o cerință critică pentru domenii sensibile precum KYC [8].")

para(doc, "JSONB este formatul ideal pentru audit trails. O singură tabelă de audit poate stoca old_data și new_data ale oricărei tabele din baza de date ca blob-uri JSONB, permițând reconstrucția istorică complexă prin operatori SQL standard [8]. Această abordare oferă un mecanism universal de auditare care supraviețuiește schimbărilor de schemă și gestionează structuri de date polimorfe fără a necesita coloane suplimentare [8].")

# 2.4
h2(doc, "2.4 Frontend: React 19 și State Management Modern")

h3(doc, "2.4.1 React Server Components și paradigma 2026")

para(doc, "Arhitectura frontend din 2026 s-a îndepărtat de mentalitatea \"Redux pentru orice\" către o abordare mai nuanțată, multi-stratificată a stării [8]. Aplicațiile React SPA categorisesc acum starea în patru tipuri distincte, fiecare necesitând o strategie de management diferită: stare UI locală (useState), stare complexă coordonată (useReducer), stare client globală (Context/Zustand) și stare server (TanStack Query/SWR) [8].")

para(doc, "Lansarea React 19 și maturizarea React Server Components (RSC) au schimbat fundamental locul unde rezidă starea [8]. Permițând componentelor să acceseze date pe server și să le transmită prin streaming către client, RSC-urile elimină necesitatea multor boilerplate tradițional asociat cu data fetching în SPA-uri [8]. React 19 introduce \"Actions\" — o modalitate de a gestiona mutațiile de date care gestionează automat stările de pending și error handling. Hook-ul useOptimistic permite dezvoltatorilor să ofere feedback UI instant în timp ce o cerere asincronă este în curs, cu rollback automat al stării dacă cererea eșuează [9].")

h3(doc, "2.4.2 Context API vs. Zustand: problema re-render-ului")

para(doc, "Context API-ul built-in al React este adesea prima alegere pentru partajarea stării între componente fără \"prop drilling\" [9]. Deși eficient pentru date care se schimbă rar, precum teme sau setări de localizare, Context API nu este un instrument optimizat de state management [8]. Limitarea sa principală este \"problema re-render-ului\": când o valoare de context se schimbă, fiecare componentă care consumă acel context este forțată să se re-rendeze, chiar dacă folosește doar o porțiune a stării care a rămas neschimbată [9].")

para(doc, "Pentru actualizări de înaltă frecvență sau slice-uri complexe de stare, biblioteci precum Zustand sau Jotai sunt preferate [8]. Zustand utilizează selectori pentru a asigura re-render-uri granulare — componentele se re-rendează doar când slice-ul specific de stare la care sunt abonate se schimbă, nu la orice modificare a store-ului global [8].")

add_code_block(doc, """import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface MarketState {
  searchQuery: string;
  activeFilters: Record<string, any>;
  selectedListing: string | null;
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
}

export const useMarketStore = create<MarketState>()(
  devtools(
    persist(
      (set) => ({
        searchQuery: '',
        activeFilters: {},
        selectedListing: null,
        setSearchQuery: (query) => set({ searchQuery: query }),
        setFilter: (key, value) => set((state) => ({
          activeFilters: { ...state.activeFilters, [key]: value }
        })),
        clearFilters: () => set({ activeFilters: {} })
      }),
      { name: 'market-storage' }
    )
  )
);""", "typescript")

para(doc, "Zustand permite componentelor să se aboneze exclusiv la părțile relevante de stare (ex: `const searchQuery = useMarketStore(state => state.searchQuery)`). Orice modificare a filtrelor active nu va re-randa bara de căutare, ceea ce constituie o diferență fundamentală de optimizare arhitecturală față de Context API.")

add_table(doc,
    ["Instrument", "Tip Stare", "Re-render", "Complexitate", "Caz de Utilizare AgriConnect"],
    [
        ["useState", "UI Local", "Țintit", "F. Scăzută [8]", "Toggle-uri, form inputs"],
        ["useReducer", "UI Coordonat", "Țintit", "Medie [8]", "Stări complexe formulare"],
        ["Context API", "Global Static", "Cascadare", "Scăzută [9]", "Tema, limba, auth state"],
        ["Zustand", "Global Dinamic", "Selectiv", "Scăzută [8]", "Cart, filtre piață"],
        ["TanStack Query", "Cache Server", "Inteligent", "Medie [8]", "Listări, comenzi, prețuri"],
    ]
)

# 2.5
h2(doc, "2.5 Design UI: Dark Mode și Glassmorphism pentru B2B")

para(doc, "Interfețele digitale prin care comercianții de mărfuri interacționează cu datele de piață au evoluat pentru a prioritiza eficiența și concentrarea. Două tendințe proeminente sunt dark mode și glassmorphism, care abordează nevoile funcționale ale profesioniștilor care petrec ore extinse în dashboard-uri digitale [9].")

para(doc, "Dark mode a trecut de la o preferință de nișă la o cerință critică pentru software-ul profesional. Până în 2026, studiile sugerează că 82% dintre utilizatori preferă dark mode în medii profesionale [9]. Driverul principal este reducerea oboselii oculare și a expunerii la lumină albastră, care este înjumătățită în multe teme dark [9]. Pentru aplicațiile mobile de trading, dark mode pe ecrane OLED poate reduce consumul de baterie cu 40-60%, un avantaj semnificativ pentru utilizatorii din teren [9].")

para(doc, "Glassmorphism-ul este un stil UI caracterizat prin transparență, layout-uri multi-stratificate și un efect de blur \"sticlă mată\" implementat prin proprietatea CSS backdrop-filter: blur() [9]. În dashboard-urile B2B complexe, servește ca un \"instrument de focalizare\", evidențiind zonele interactive precum butoanele de execuție și barele de navigare, menținând în același timp un sens de profunzime și minimalism [9]. AgriConnect utilizează overlay-uri semi-opace (10-30% opacitate) cu blur de 10-20px pentru a atenua zgomotul de fundal și a asigura lizibilitatea textului pe toate componentele de navigare și modal-urile de tranzacție.")

page_break(doc)
save_doc(doc)
print("✓ Capitolul 2 — ARHITECTURA SISTEMULUI — complet (expanded + snippets)")
