# -*- coding: utf-8 -*-
"""Chapter 1: INTRODUCERE ȘI STADIUL ACTUAL AL PIEȚEI — Expanded academic depth."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from helpers import open_doc, h1, h2, h3, para, mixed, bullet, page_break, add_table, save_doc

doc = open_doc()

# ═══════════════════════════════════════════════════════════════════
h1(doc, "1. INTRODUCERE ȘI STADIUL ACTUAL AL PIEȚEI")
# ═══════════════════════════════════════════════════════════════════

# 1.1
h2(doc, "1.1 Argumentarea necesității și importanța temei")

para(doc, "Lanțul agroalimentar global se află într-un punct de inflexiune tehnologică, unde ineficiențele structurale ale comerțului tradițional sunt provocate de apariția platformelor digitale de tip marketplace B2B. Transformarea digitală a comerțului cu mărfuri agricole, în special pe piața cerealelor din România, reprezintă o evoluție semnificativă de la metodele tradiționale și fragmentate la ecosisteme integrate și bazate pe date [1]. România ocupă o poziție unică în acest peisaj, caracterizându-se prin cel mai mare număr de ferme din Uniunea Europeană — aproximativ 2.9 milioane — și o structură duală ce cuprinde un număr vast de ferme de subzistență alături de un grup restrâns de corporații agroindustriale profesionale care gestionează mai mult de jumătate din terenul agricol național [1].")

para(doc, "Această fragmentare, combinată cu complexitățile logistice ale transportului mărfurilor vrac către hub-urile majore de export precum Portul Constanța, necesită un intermediar digital robust. Platforma \"AgriConnect\" este concepută pentru a funcționa ca acest intermediar, operând sub codul NACE 4611 (Intermedieri în comerțul cu materii prime agricole, animale vii, materii prime textile și cu semifabricate), conectând actorii principali ai lanțului de aprovizionare: fermieri, cumpărători corporativi și operatori de transport [1].")

para(doc, "Problemele fundamentale ale lanțului agroalimentar clasic includ opacitatea prețurilor, costurile logistice ridicate și riscul de contraparte semnificativ. Intermediarii adaugă margini comerciale fără a adăuga valoare proporțională în termeni de calitate sau trasabilitate, ceea ce duce la o eroziune a profitului producătorului [1]. Digitalizarea, prin intermediul marketplace-urilor B2B, promite eliminarea acestor verigi inutile (disintermediere), permițând o recuperare a marginilor de profit de 10% până la 25% la nivel de achiziție [1]. Totuși, spre deosebire de comerțul electronic B2C, platformele B2B pentru agricultură trebuie să gestioneze tranzacții de mare valoare, adesea depășind 10.000 USD sau chiar 1 milion USD în cazul cargourilor vrac, ceea ce impune mecanisme riguroase de securitate financiară și conformitate legală [1].")

para(doc, "Ecosistemul AgTech B2B a evoluat în direcția unor modele de tip \"platformă cu valoare adăugată\", unde marketplace-ul nu este un simplu panou de anunțuri, ci oferă servicii integrate de logistică, analize de sol, instrumente de tip SaaS pentru managementul fermei și mecanisme de finanțare a comerțului [1]. Această abordare creează un efect de rețea puternic: pe măsură ce mai mulți fermieri adoptă platforma, baza de date privind calitatea, prețurile și disponibilitatea cerealelor devine mai valoroasă pentru cumpărătorii corporativi, care la rândul lor atrag mai mulți fermieri — un cerc virtuos descris în economia de rețea ca \"efectul de flot\" (network flywheel) [1].")

# 1.2
h2(doc, "1.2 Contextul pieței și mecanismele de descoperire a prețului")

h3(doc, "1.2.1 Piețele futures și benchmark-ul MATIF Euronext")

para(doc, "Bursa de mărfuri Euronext operează ca un clearing house vital pentru managementul riscului în sectorul agricol european. Suita de contracte, concentrată pe grâul de morărit, porumb și rapiță, este proiectată în jurul principiului livrării fizice ca \"piață de ultim resort\" [1]. Acest mecanism asigură faptul că prețul futures reflectă cu acuratețe dinamica cererii și ofertei pentru mărfurile fizice la momentul expirării contractului.")

para(doc, "În contracte lichide precum \"Euronext Milling Wheat No. 2\", mecanismul livrării fizice asigură ancorarea instrumentului financiar la marfa subiacentă, prevenind alocarea eronată a resurselor [1]. Prețul de livrare (DSP — Delivery Settlement Price) este determinat pe baza mediei ponderate cu volum (VWAP) din ultimele 10 minute de tranzacționare ale sesiunii de expirare. Pentru mărfurile unde livrarea fizică este logistic dificilă, Euronext utilizează contracte decontate în numerar (cash-settled), precum cel pentru grâul dur, unde prețul EDSP (Exchange Delivery Settlement Price) este calculat pe baza unei medii a prețurilor zilnice furnizate de Sitagri [1].")

para(doc, "Mecanismul de clearing al Euronext funcționează prin interpunerea casei de compensare între cumpărător și vânzător, eliminând riscul de contraparte bilateral. Fiecare participant depune o marjă inițială și este supus apelurilor zilnice de marjă (marked-to-market), asigurând solvabilitatea continuă a pozițiilor deschise. Acest mecanism de garantare este esențial pentru integritatea pieței și servește drept model conceptual pentru sistemul de escrow digital implementat în AgriConnect [1].")

add_table(doc,
    ["Caracteristică", "Livrare Fizică (ex: Grâu Morărit)", "Decontare Numerar (ex: Grâu Dur)"],
    [
        ["Determinare Preț", "DSP bazat pe VWAP final 10 min", "EDSP bazat pe index piață fizică"],
        ["Rezultat Operațional", "Transfer mărfuri la silozuri aprobate", "Ajustare financiară profit/pierdere"],
        ["Mecanism Convergență", "Legătură directă futures-fizic", "Dependența de acuratețea indexului"],
        ["Risc Principal", "Complexitatea organizării livrării", "Vulnerabilitate la inexactitatea indexului"],
        ["Utilizatori Tipici", "Comercianți, procesatori, fermieri mari", "Speculatori, fonduri de investiții [1]"],
    ]
)

h3(doc, "1.2.2 Problema non-convergenței și impactul PAC")

para(doc, "Un risc semnificativ pe piețele de mărfuri este non-convergența susținută între prețurile cash și futures. Când aceste prețuri diverg, eficacitatea acoperirii riscului (hedge) este compromisă, trimițând semnale confuze participanților la piață și ducând potențial la o alocare eronată a resurselor [1]. Pe piețele interne, această non-convergență este adesea atribuită manipulării structurale a \"instrumentelor de livrare\" — firmele care caută să convertească contractele futures în mărfuri fizice primesc adesea un instrument derivat în loc de cereale reale [1].")

para(doc, "Cercetările USDA Economic Research Service au identificat mai mulți factori care contribuie la non-convergență: capacitatea limitată de depozitare aprobată, costurile de transport către punctele de livrare desemnate și discrepanțele de calitate între mărfurile contractuale și cele disponibile fizic [1]. Aceste probleme sunt amplificate de comportamentul speculatorilor financiari care nu au intenția de a livra sau recepționa mărfuri fizice, dar ale căror activități de tranzacționare influențează semnificativ prețul de decontare [1].")

para(doc, "Reformele Politicii Agricole Comune (PAC) din Uniunea Europeană au accentuat importanța acestor mecanisme de piață. Pe măsură ce prețurile de intervenție garantate au fost reduse, comercianții au devenit mai dependenți de Euronext pentru hedging și descoperirea prețului, ducând la creșterea lichidității și activității pe bursele europene [2]. Comisia Europeană a documentat această evoluție în rapoartele sale privind piețele derivatelor pe mărfuri agricole, subliniind necesitatea unei reglementări echilibrate care să prevină speculația excesivă fără a diminua funcția esențială de descoperire a prețului [2].")

h3(doc, "1.2.3 Digitalizarea comerțului fizic: de la brokeri la marketplace-uri")

para(doc, "Istoric, tranzacționarea cerealelor fizice s-a bazat pe o rețea de brokeri regionali care conectau producătorii cu procesatorii și exportatorii. Această rețea, deși robustă în termeni de relații interpersonale și cunoaștere locală a pieței, prezintă dezavantaje structurale semnificative: opacitatea prețurilor (fiecare broker negociază individual, fără transparență față de piața mai largă), asimetria informațională (brokerii au acces la date de piață inaccesibile fermierilor mici) și costuri tranzacționale ridicate (fiecare intermediar adaugă o marjă de 2-5% din valoarea mărfii) [1].")

para(doc, "Marketplace-urile digitale B2B perturbă acest model prin trei mecanisme fundamentale: transparența prețurilor (toți participanții văd ofertele și cererea în timp real), eficiența logistică (algoritmii de rutare optimizează transportul, reducând costurile cu 15-30%) și securitatea tranzacțiilor (sistemele de escrow digital elimină riscul de contraparte, care în comerțul tradițional poate ajunge la 3-5% din valoarea tranzacției sub formă de pierderi din neplată) [1]. Aceste avantaje sunt amplificate de efectele de rețea: pe măsură ce baza de utilizatori crește, lichiditatea platformei se îmbunătățește, atrăgând în continuare participanți din ambele părți ale pieței [1].")

# 1.3
h2(doc, "1.3 Analiza comparativă: burse clasice vs. marketplace-uri digitale")

para(doc, "O analiză comparativă între soluțiile existente evidențiază diferențele critice de funcționare între bursele clasice și marketplace-urile digitale emergente. Bursele precum MATIF sau CME Group se concentrează pe standardizarea contractelor (calitate U.S. No. 2 Yellow Corn, cantitate 5.000 bușeli) și pe lichiditatea oferită de speculatori [1]. În schimb, marketplace-urile B2B AgTech se concentrează pe execuția fizică, oferind servicii cu valoare adăugată precum logistica integrată, analize de sol și instrumente de tip SaaS pentru managementul fermei, adesea oferite gratuit pentru a captura fluxul de marfă al fermierului [1].")

add_table(doc,
    ["Caracteristică", "Bursa de Mărfuri (ex: MATIF)", "Marketplace B2B (AgTech)"],
    [
        ["Obiectiv principal", "Descoperirea prețului și hedging [1]", "Eficiență în achiziție și logistică [1]"],
        ["Natura contractului", "Standardizat (Cantitate/Calitate fixă) [1]", "Personalizabil (Loturi specifice) [2]"],
        ["Livrare fizică", "Rar (<2% din tranzacții) [1]", "Obligatorie (Core business) [1]"],
        ["Rolul tehnologiei", "Trading de înaltă frecvență", "Trasabilitate, SaaS, Escrow [1]"],
        ["Intermediari", "Brokeri, Case de compensare", "Disintermediere directă [1]"],
        ["Barieră de intrare", "Capital ridicat, cunoștințe financiare [1]", "Smartphone și acces internet [2]"],
        ["Conformitate legală", "Reglementare de tip bursier (ASF)", "NACE 4611, intermediere digitală [1]"],
    ]
)

para(doc, "AgriConnect se poziționează strategic la intersecția acestor două modele, oferind funcționalități de marketplace cu transparența prețurilor (inspirată de mecanismele de descoperire ale burselor) combinată cu flexibilitatea contractuală specifică tranzacțiilor OTC (over-the-counter). Platforma nu funcționează ca o bursă reglementată (evitând astfel obligațiile Legii 357/2005), ci ca un intermediar digital care facilitează negocierea bilaterală cu garanții de execuție prin escrow [1].")

# 1.4
h2(doc, "1.4 Standarde de calitate a cerealelor: SR EN 15587 (Besatz)")

para(doc, "Fungibilitatea mărfurilor agricole pe bursele internaționale depinde de standardizarea riguroasă a parametrilor de calitate. În Europa, principalul benchmark pentru puritatea cerealelor și determinarea \"Besatz\" (impurități) este standardul EN 15587, definit de Comitetul European de Standardizare (CEN) [2]. Metodologia de testare specifică trei categorii de examinare: caracteristici sanitare (absența dăunătorilor/mucegaiurilor), caracteristici fizice (dimensiune/puritate) și caracteristici intrinseci (umiditate/proteină/ulei) [2].")

para(doc, "Termenul \"Besatz\" cuprinde toate materiile străine dintr-o mostră de cereale, incluzând boabe sparte, zbârcite, afectate de dăunători, semințe de buruieni (\"Schwarzbesatz\") și fragmente minerale [2]. Pentru inspecția manuală, EN 15587 specifică dimensiuni exacte ale sitelor pentru diferite tipuri de cereale — pentru grâul comun, standardul necesită un sită cu orificii oblonge de 2.00 mm [2]. Procesul implică prelevarea unei porțiuni reprezentative — de obicei 50-100 g, conținând cel puțin 2.500 de boabe — pentru a asigura validitatea statistică [2].")

add_table(doc,
    ["Categorie Besatz", "Componente", "Prag Maxim Admis"],
    [
        ["Boabe Sparte", "Boabe cu porțiuni lipsă și endosperm vizibil", "2.0% pentru grâul de morărit [2]"],
        ["Impurități Cereale", "Boabe zbârcite, alte cereale, dăunători, boabe pătate", "5.0% total [2]"],
        ["Boabe Încolțite", "Boabe cu modificări fizice vizibile ale germenului", "2.5% [2]"],
        ["Schwarzbesatz", "Impurități diverse: semințe buruieni, pietre, ergot", "1.0% strict [2]"],
        ["Umiditate", "Conținut de apă determinat prin uscare la cuptor", "14.0% maxim [2]"],
    ]
)

h3(doc, "1.4.1 Parametrii de calitate ai grâului românesc")

para(doc, "România, ca producător semnificativ în UE, aderă atât la standardele europene, cât și la reglementări naționale specifice pentru cerealele importate. Ministerul Agriculturii a stabilit istoric standarde ridicate pentru grâul importat, depășind adesea normele internaționale pentru parametri precum glutenul umed și indicele de cădere (falling number) [3]. Determinarea conținutului de proteină prin metoda Kjeldahl este o practică standard, calculată prin măsurarea azotului total multiplicat cu factorul convențional de 5.7 pentru grâu [3].")

add_table(doc,
    ["Parametru Calitate", "Standard Import Grâu", "Standard Import Făină", "Metodă Verificare"],
    [
        ["Umiditate", "Max 14.0%", "Max 14.5%", "Cuptor uscare (ICC 110/1)"],
        ["Greutate Hectolitrică", "Min 80.0 kg/hl", "N/A", "Măsurare densitate vrac"],
        ["Gluten Umed", "Min 30.0%", "Min 32.0%", "Glutomatic 2200 (ICC 137/1)"],
        ["Indice de Cădere", "Min 300 sec", "260-320 sec", "Metoda Hagberg"],
        ["Proteină Brută", "Min 13.0%", "Min 12.5%", "Kjeldahl (ICC 105/2)"],
        ["Material Străin", "Max 0.5%", "N/A", "Sortare manuală/Sitare"],
    ]
)

para(doc, "Anul agricol 2023-2024 a fost marcat de evenimente agrometeorologice extreme — recolta din 2024 a fost afectată de un val de căldură semnificativ și secetă în iunie, cea mai caldă din 1850 [3]. Interesant, deși productivitatea a fost mai scăzută comparativ cu 2023, calitatea cerealelor a fost adesea superioară în termeni de concentrație de proteină și gluten, datorită stresului de mediu care concentrează compușii nutritivi în bobul mai mic [3]. Până în 2025, producția a înregistrat o recuperare spectaculoasă, cu producția de grâu crescând cu 36.6% la 12.69 milioane tone, confirmând rolul României ca pilon esențial al aprovizionării cerealiere a UE [4].")

para(doc, "Aceste fluctuații evidențiază importanța unui sistem digital care să poată captura și disemina rapid informațiile de calitate, permițând cumpărătorilor să ia decizii informate bazate pe date obiective, nu pe estimări subiective ale brokerilor tradiționali. AgriConnect adresează această nevoie prin stocarea parametrilor de calitate în coloane JSONB, permițând interogări structurate care reflectă fidelul realitățile fizice ale fiecărui lot de cereale tranzacționat.")

# 1.5
h2(doc, "1.5 Obiectivele proiectului")

para(doc, "Proiectul AgriConnect își propune atingerea următoarelor obiective tehnice și funcționale:")

bullet(doc, "Dezvoltarea unei platforme B2B complete pentru tranzacționarea cerealelor și produselor agricole, cu suport pentru contracte spot și forward, incluzând un mecanism de negociere a prețurilor și generare automată de facturi")
bullet(doc, "Implementarea unei arhitecturi modulare bazate pe Domain-Driven Design (DDD), cu izolarea completă a contextelor de business: IAM, Trading, Financial, Transport și Disputes, fiecare cu propriul model de domeniu și API intern")
bullet(doc, "Integrarea unui sistem de stocare hibridă PostgreSQL cu JSONB și indecși GIN pentru gestionarea flexibilă a parametrilor de calitate a cerealelor conform SR EN 15587, cu suport pentru validare JSON Schema")
bullet(doc, "Realizarea unui modul de conformitate fiscală automată: taxare inversă (Art. 331 Cod Fiscal), raportare DAC7 (formularul F7000) și generare coduri UIT pentru RO e-Transport, cu verificare automată a statutului de plătitor TVA prin API-ul ANAF")
bullet(doc, "Implementarea unui sistem Escrow digital cu split payment tripartit (95% vânzător / 3% transportator / 2% comision platformă) sub directiva PSD2, cu autentificare SCA (Strong Customer Authentication)")
bullet(doc, "Integrarea motorului OSRM (Open Source Routing Machine) pentru optimizarea rutelor de transport, utilizând algoritmi Contraction Hierarchies cu preprocesare a grafului rutier și solver TSP pentru tururi multi-stop")
bullet(doc, "Dezvoltarea unui sistem de rezolvare alternativă a disputelor (ADR) conform Legii 81/2022 privind practicile comerciale neloiale, cu conciliere obligatorie, chat în platformă și mecanisme de escalare")
bullet(doc, "Implementarea unui sistem de reputație ponderat (Weighted Liquid Rank) rezistent la atacuri de manipulare (shilling/smearing), cu degradare temporală și ponderare bazată pe valoarea tranzacției")
bullet(doc, "Containerizarea completă cu Docker și Docker Compose pentru deployment pe infrastructură Ubuntu, cu Nginx ca reverse proxy și configurare SPA routing")

# 1.6
h2(doc, "1.6 Structura lucrării")

para(doc, "Prezenta lucrare este organizată în cinci capitole principale, structurate progresiv de la fundamentele teoretice la implementarea practică și evaluarea rezultatelor:")

mixed(doc, [("Capitolul 1 — Introducere și Stadiul Actual al Pieței", True), (" prezintă argumentarea necesității proiectului, contextul piețelor de mărfuri agricole, mecanismele de descoperire a prețului pe bursele MATIF, standardele de calitate EN 15587 și obiectivele tehnice și funcționale ale platformei.", False)])
mixed(doc, [("Capitolul 2 — Arhitectura Sistemului și Tehnologii", True), (" detaliază fundamentele Domain-Driven Design (Bounded Contexts, Modular Monolith), stiva tehnologică NestJS/React 19/PostgreSQL, paradigmele de state management (Context API vs. Zustand) și principiile de design UI (Dark Mode, Glassmorphism).", False)])
mixed(doc, [("Capitolul 3 — Cadrul Legislativ, Fiscal și Calitativ", True), (" analizează cadrul de reglementare: taxarea inversă Art. 331 Cod Fiscal, directiva DAC7 (F7000), sistemul RO e-Transport și codurile UIT, directiva PSD2 și conturile de segregare, Legea 81/2022 (practici comerciale neloiale), GDPR, trasabilitatea Farm-to-Fork și delimitarea juridică CAEN 4611 vs. Legea 357/2005.", False)])
mixed(doc, [("Capitolul 4 — Implementarea Proiectului", True), (" descrie în detaliu modulele backend (IAM, Trading, Financial, Transport, Disputes) și frontend (11 pagini React), algoritmii de rutare OSRM cu Contraction Hierarchies, sistemul de reputație Weighted Liquid Rank, securitatea JWT/Argon2id și deployment-ul Docker Compose.", False)])
mixed(doc, [("Capitolul 5 — Concluzii și Direcții Viitoare", True), (" sintetizează rezultatele obținute, evaluează gradul de îndeplinire a obiectivelor și propune direcții viitoare: IoT/Blockchain pentru trasabilitate, AI pentru predicția prețurilor, eIDAS 2.0 și EUDI Wallet.", False)])

page_break(doc)

save_doc(doc)
print("✓ Capitolul 1 — INTRODUCERE ȘI STADIUL ACTUAL AL PIEȚEI — complet (expanded)")
