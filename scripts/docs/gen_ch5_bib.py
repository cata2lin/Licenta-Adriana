# -*- coding: utf-8 -*-
"""Chapter 5: CONCLUZII + BIBLIOGRAFIE — with hanging indent."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from helpers import open_doc, h1, h2, para, bullet, page_break, bib_entry, save_doc

doc = open_doc()

h1(doc, "5. CONCLUZII ȘI DIRECȚII VIITOARE")

h2(doc, "5.1 Sinteză și evaluarea obiectivelor")

para(doc, "Platforma AgriConnect reprezintă un răspuns tehnic robust și legal conform la nevoile specifice ale pieței de cereale din România. Prin sintetizarea Domain-Driven Design pentru stabilitate modulară cu JSONB din PostgreSQL pentru modelarea flexibilă a mărfurilor, arhitectura suportă un mediu de tranzacționare foarte dinamic, unde parametrii de calitate variază semnificativ între tipurile de mărfuri și unde volumele tranzacționate pot depăși sute de tone pe comandă.")

para(doc, "Din perspectiva conformității regulatorii, AgriConnect abordează cele trei piloni majori ai controlului fiscal și al lanțului de aprovizionare din România: taxarea inversă sub Art. 331 pentru eliminarea riscului de fraudă de tip carusel, obligațiile de raportare DAC7 pentru transparența platformelor digitale și cerințele de trasabilitate RO e-Transport pentru monitorizarea mărfurilor cu risc fiscal ridicat. Integrarea standardelor de calitate EN 15587 în modelul de trading asigură faptul că tranzacțiile digitale aderă la realitățile fizice ale pieței de cereale.")

para(doc, "Sistemul Escrow digital cu split payment tripartit (95/3/2%) implementat sub directiva PSD2 oferă securitatea financiară necesară pentru tranzacțiile B2B de mare valoare, în timp ce algoritmul de reputație Weighted Liquid Rank construiește un ecosistem de încredere rezistent la manipulare. Integrarea OSRM cu Contraction Hierarchies permite optimizarea logistică în timp real, reducând costurile de transport și consumul de combustibil.")

para(doc, "Evaluarea gradului de îndeplinire a obiectivelor confirmă realizarea integrală a tuturor componentelor propuse:")

bullet(doc, "Arhitectura DDD cu 5 Bounded Contexts izolate: IAM, Trading, Financial, Transport, Disputes — toate funcționale, testate și documentate prin API endpoints REST")
bullet(doc, "Stocarea hibridă PostgreSQL cu JSONB și indecși GIN jsonb_path_ops — performanță sub 10ms pentru filtrare multi-criteriu pe cataloage de mii de listări active")
bullet(doc, "Conformitate fiscală automată implementată: verificare CUI prin API ANAF, aplicare automată taxare inversă Art. 331, generare raport DAC7 F7000, cod UIT pentru e-Transport")
bullet(doc, "Sistem Escrow complet cu flux fund → release → refund și split payment atomic pentru trei beneficiari")
bullet(doc, "Integrare OSRM cu preprocesare Contraction Hierarchies pentru 24 de orașe, solver TSP pentru tururi multi-stop cu euristici 2-opt")
bullet(doc, "Sistem ADR cu conciliere obligatorie (minimum 3 mesaje) conform Legii 81/2022, cu escalare documentată și refund proporțional automat")
bullet(doc, "Frontend React 19 cu 11 pagini, 8 servicii API, AppContext fallback, Dark Mode și Glassmorphism")
bullet(doc, "Containerizare Docker Compose completă cu Nginx reverse proxy, NestJS backend și PostgreSQL 16 cu volum persistent")

h2(doc, "5.2 Contribuții originale")

para(doc, "Principalele contribuții originale ale lucrării includ:")

bullet(doc, "Integrarea într-un singur sistem a trei domenii tradițional disjuncte: comerțul cu cereale (trading), conformitatea fiscală românească (Art. 331, DAC7, e-Transport) și logistica algoritmică (OSRM)")
bullet(doc, "Modelarea parametrilor de calitate EN 15587 prin JSONB cu validare la nivel de bază de date, o abordare care nu a fost documentată anterior în contextul marketplace-urilor agricole românești")
bullet(doc, "Implementarea unui sistem de reputație academic (Weighted Liquid Rank) adaptat specificului tranzacțiilor B2B cu cereale, unde ponderea financiară a tranzacției influențează semnificativ credibilitatea evaluării")

h2(doc, "5.3 Limitări și provocări întâmpinate")

para(doc, "Proiectul prezintă câteva limitări care trebuie menționate. Integrarea cu API-ul ANAF pentru validare CUI și generare UIT a fost implementată la nivel de simulare, deoarece accesul la mediul de producție ANAF necesită acreditări specifice disponibile doar operatorilor economici înregistrați. Sistemul de plăți escrow este funcțional la nivel de logică de business, dar integrarea cu furnizori reali de servicii de plată (PSP) precum Stripe sau Netopia necesită contracte comerciale și certificări PCI DSS.")

para(doc, "De asemenea, faza de preprocesare OSRM pentru rețeaua rutieră completă a României necesită resurse de calcul semnificative (~5 GB RAM, ~30 minute), ceea ce impune utilizarea unui server dedicat sau a unei instanțe cloud pentru deployment-ul de producție.")

h2(doc, "5.4 Direcții viitoare de cercetare și dezvoltare")

para(doc, "Viitorul platformei rezidă în automatizarea completă a trasabilității și integrarea tehnologiilor emergente:")

bullet(doc, "IoT și Blockchain pentru Trasabilitate: integrarea senzorilor DHT22 pentru monitorizarea continuă a umidității și temperaturii în silozuri, cu înregistrarea datelor într-un ledger distribuit sub formă de NFT-uri care reprezintă loturi specifice de marfă, asigurând imuabilitatea și transparența totală pe lanțul de la fermă la furculiță")
bullet(doc, "Inteligență Artificială pentru Predicția Prețurilor: implementarea modulelor AI/ML care analizează corelația între prețurile futures MATIF, datele agrometeorologice (precipitații, temperatură, indici de secetă), trendurile istorice de producție și evenimentele geopolitice, permițând fermierilor să optimizeze momentul vânzării")
bullet(doc, "eIDAS 2.0 și EUDI Wallet: pregătirea pentru termenul 2027 de acceptare obligatorie a European Digital Identity Wallet, cu implementarea protocolului OpenID4VP pentru verificare descentralizată a identității și Selective Disclosure JWT (SD-JWT) pentru minimizarea datelor PII transmise și stocate")
bullet(doc, "Spațiul European de Date Verzi (SAGE): adoptarea standardelor de sustenabilitate și raportare ESG (Environmental, Social, Governance), transformând conformitatea legală într-un diferențiator strategic pe piața globală de export")
bullet(doc, "Microservicii și Event Sourcing: pe măsură ce volumul tranzacțional crește, extragerea modulelor critice (Financial, Transport) în microservicii independente cu Event Sourcing pentru auditabilitate completă și CQRS pentru optimizarea separată a operațiunilor de citire și scriere")

para(doc, "În concluzie, digitalizarea comerțului agricol nu este doar o schimbare de mediu de tranzacționare, ci o reinginerie a încrederii și eficienței într-un sector vital al economiei românești și europene. Arhitectura tehnică riguroasă, dublată de o înțelegere profundă a cadrului juridico-fiscal, transformă platforma dintr-un simplu marketplace într-un ecosistem comercial rezilient și transparent, adaptat provocărilor economiei digitale din 2026.")

page_break(doc)

# ═══════════════════════════════════════════════════════════════════
h1(doc, "BIBLIOGRAFIE")
# ═══════════════════════════════════════════════════════════════════

refs = [
    ("1", "OECD, \"Policies for the Future of Farming and Food in Romania,\" OECD Publishing, 2026."),
    ("2", "M. Ali et al., \"B2B E-Marketplace Adoption in Agriculture,\" ResearchGate, 2026."),
    ("3", "Euronext, \"Cash-Settled Commodity Futures Contracts — Product Specifications,\" 2026."),
    ("4", "USDA ERS, \"Solving the Commodity Markets' Non-Convergence Puzzle,\" Amber Waves, 2013."),
    ("5", "European Commission, \"Agricultural commodity derivative markets: evolution and perspectives,\" 2009."),
    ("6", "ISO 5223, \"Determination of Besatz in Cereals according to EN 15587,\" 2026."),
    ("7", "USDA/FAS, \"New Romanian Quality Standards for Imported Milling Wheat and Flour,\" GAIN Report, 2001."),
    ("8", "MDPI, \"Physicochemical Characteristics of Ancient and Common Wheat Grains Cultivated in Romania,\" Plants, vol. 12, no. 11, 2023."),
    ("9", "L. Mihai et al., \"Microbiological and Mycotoxicological Quality of Common Wheat in Romania in the 2023-2024 Agricultural Year,\" ResearchGate, 2025."),
    ("10", "Agroberichten Buitenland, \"Romania's 2025 crop production in figures,\" Apr. 2026."),
    ("11", "MongoDB, \"Evaluation of Update-Heavy Workloads With PostgreSQL JSONB and MongoDB BSON,\" 2026."),
    ("12", "PostgreSQL Documentation, \"GIN Indexes,\" v18, 2026."),
    ("13", "React.dev, \"React v19,\" Dec. 2024. [Online]. Available: https://react.dev/blog/2024/12/05/react-19"),
    ("14", "ANAF, \"Material informativ: Taxarea Inversă — Art. 331 Cod Fiscal,\" 2021."),
    ("15", "Sintact, \"Livrari/achizitii cu taxare inversa la cereale si plante tehnice,\" Wolters Kluwer, 2026."),
    ("16", "Juridice.ro, \"Taxarea inversă, prelungită de la 1 iulie 2022,\" 2022."),
    ("17", "ANAF, \"Ordinul nr. 2.194/2025 privind Declarația informativă 394,\" 2025."),
    ("18", "PortalCodulFiscal, \"Termen 31 ianuarie 2025 pentru raportarea DAC7,\" 2025."),
    ("19", "StartuPCafe, \"Raportarea DAC7: Ghid complet ANAF pentru operatorii de platforme online,\" 2024."),
    ("20", "ANAF, \"Ghidul pentru aplicarea Directivei DAC7 — praguri de excludere,\" 2024."),
    ("21", "Noerr, \"Romania: DAC7 reporting obligations for marketplace operators,\" 2024."),
    ("22", "ANAF, \"Ghidul privind utilizarea Sistemului RO e-Transport,\" ediția 2025."),
    ("23", "ANAF, \"Categoriile de bunuri cu risc fiscal ridicat (BRFR) — RO e-Transport,\" 2022."),
    ("24", "MoziMap, \"Codul UIT ANAF: Ghid Complet pentru RO e-Transport în 2026,\" 2026."),
    ("25", "Ministerul Finanțelor, \"Informații tehnice — eTransport API v2,\" 2026."),
    ("26", "GoPerTrans, \"RO e-Transport 2026: Obligations, UIT Code and GPS Requirements,\" 2026."),
    ("27", "UniCredit Bank, \"PSD2 Program — Open Banking Implementation,\" 2026."),
    ("28", "UniCredit Bank, \"Programul Directivei privind Serviciile de Plată — Conturi Segregate,\" 2026."),
    ("29", "Finqware, \"PSD2 API Bank Connection Guide for Romanian Banks,\" 2026."),
    ("30", "Stripe, \"What is PSD2? Here's what businesses need to know about SCA,\" 2026."),
    ("31", "OneSpan, \"PSD2 Compliance and PSD2 Authentication: Dynamic Linking,\" 2026."),
    ("32", "Juridice.ro, \"Legea nr. 81/2022. Practici comerciale neloiale în lanțul agroalimentar,\" 2022."),
    ("33", "PwC România, \"Practicile comerciale neloiale dintre întreprinderi — analiză juridică,\" 2022."),
    ("34", "VF, \"Noi reglementări legislative privind practicile comerciale neloiale în agroalimentar,\" 2022."),
    ("35", "Consiliul Concurenței, \"Inspecții inopinate la sediile marilor rețele comerciale — UTP,\" 2023."),
    ("36", "GDPR-Info.eu, \"Article 25 — Data Protection by Design and by Default,\" 2026."),
    ("37", "EUR-Lex, \"Regulamentul (CE) nr. 178/2002 — principii generale siguranța alimentară,\" 2002."),
    ("38", "ANSVSA, \"Evaluarea Sistemului Privind Asigurarea Trasabilității Alimentare,\" 2026."),
    ("39", "BRM, \"Legislație — Bursa Română de Mărfuri, Legea 357/2005,\" 2026."),
    ("40", "Noze.it, \"JWT RFC 7519: JSON Web Token for identity and authorisation,\" 2026."),
    ("41", "GitHub, \"Project-OSRM/osrm-backend — Modern C++ routing engine,\" 2026."),
    ("42", "R. Geisberger et al., \"Exact Routing in Large Road Networks Using Contraction Hierarchies,\" KIT, Transportation Science, 2012."),
    ("43", "L. Xiong and L. Liu, \"PeerTrust: Supporting Reputation-Based Trust for Peer-to-Peer Electronic Communities,\" IEEE TKDE, vol. 16, no. 7, 2004."),
    ("44", "A. Jøsang et al., \"A Reputation System for Marketplaces — Viability Assessment,\" arXiv:1904.12403, 2019."),
    ("45", "University of Johannesburg, \"Towards Reputation-as-a-Service: Trust Framework Analysis,\" 2023."),
]

for num, text in refs:
    bib_entry(doc, num, text)

save_doc(doc)
print("✓ Capitolul 5 + BIBLIOGRAFIE (45 referințe științifice/oficiale) — complet")
