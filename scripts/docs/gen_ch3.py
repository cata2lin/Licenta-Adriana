# -*- coding: utf-8 -*-
"""Chapter 3: CADRUL LEGISLATIV, FISCAL ȘI CALITATIV — Expanded."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from helpers import open_doc, h1, h2, h3, para, bullet, page_break, add_table, save_doc

doc = open_doc()

h1(doc, "3. CADRUL LEGISLATIV, FISCAL ȘI CALITATIV")

para(doc, "Succesul unei platforme B2B în România este condiționat de integrarea algoritmilor de conformitate direct în fluxul tranzacțional. Acest capitol analizează cadrul complex de reglementare care guvernează tranzacționarea digitală a cerealelor, de la mecanismele fiscale specifice la obligațiile de raportare și protecția participanților la piață.")

# 3.1
h2(doc, "3.1 Regimul Fiscal: Taxarea Inversă (Art. 331)")

h3(doc, "3.1.1 Mecanismul de aplicare și obligațiile de raportare")

para(doc, "Comerțul cu cereale și plante tehnice în România este supus unui regim fiscal special, definit de mecanismul taxării inverse, menit să combată evaziunea fiscală și frauda de tip \"carusel\" [6]. Conform Articolului 331 din Codul Fiscal, pentru anumite categorii de bunuri livrate între persoane impozabile înregistrate în scopuri de TVA, responsabilitatea plății taxei revine beneficiarului, nu furnizorului [6].")

para(doc, "Frauda de tip \"carusel\" funcționează prin crearea unor lanțuri de tranzacții fictive între mai multe entități juridice din diferite state membre UE. Furnizorul colectează TVA-ul de la cumpărător, dar dispare înainte de a-l vărsa la bugetul de stat, în timp ce cumpărătorul solicită deducerea TVA-ului pe care statul nu l-a încasat niciodată. Mecanismul taxării inverse întrerupe acest circuit prin eliminarea fluxului fizic de TVA între părți [6].")

para(doc, "În acest sistem, furnizorul emite factura fără a înscrie taxa colectată, dar cu mențiunea obligatorie \"taxare inversă\". Beneficiarul va calcula TVA-ul aferent și îl va înregistra în decontul de taxă (formularul 300) atât ca taxă colectată, cât și ca taxă deductibilă [6]. Acest tratament contabil are un efect neutru asupra trezoreriei beneficiarului, dar asigură faptul că tranzacția este vizibilă pentru autoritățile fiscale [6]. Condiția sine qua non pentru aplicarea acestui mecanism este ca ambele părți implicate să fie înregistrate în scopuri de TVA conform Art. 316 din Codul Fiscal. În cazul în care furnizorul emite eronat o factură cu TVA pentru bunuri supuse Art. 331, beneficiarul își pierde dreptul de deducere [6].")

h3(doc, "3.1.2 Clasificarea bunurilor și prelungirea cadrului legislativ")

para(doc, "Mecanismul taxării inverse se aplică unei liste specifice de produse agricole, identificate prin codurile din Nomenclatura Combinată (NC) [6]. Conform reglementărilor actuale și prelungirilor succesive introduse prin OUG nr. 85/2022 și Directivei (UE) 2022/890, acest regim este valabil până la data de 31 decembrie 2026 [6].")

add_table(doc,
    ["Cod NC", "Descriere Produs", "Observații"],
    [
        ["1001", "Grâu și meslin", "Include grâul dur și moale"],
        ["1002", "Secară", "Inclusiv secara de iarnă"],
        ["1003", "Orz", "Orz de bere și furajer"],
        ["1004", "Ovăz", "Toate varietățile"],
        ["1005", "Porumb", "Porumb boabe, inclusiv sămânță"],
        ["1008 60 00", "Triticale", "Hibrid grâu-secară"],
        ["1201", "Boabe de soia", "Chiar sfărâmate"],
        ["1205", "Semințe de rapiță", "Inclusiv rapiță sălbatică"],
        ["1206 00", "Semințe de floarea-soarelui", "Chiar sfărâmate"],
        ["1212 91", "Sfeclă de zahăr", "Pentru industria zaharului"],
    ]
)

para(doc, "Monitorizarea acestor tranzacții este realizată de ANAF prin declarația informativă 394, unde operațiunile supuse taxării inverse trebuie raportate separat pentru fiecare cod de înregistrare în scopuri de TVA și pentru fiecare categorie de bunuri [6]. AgriConnect automatizează această logică prin verificarea statusului TVA al participanților via API-ul de validare ANAF și a codurilor NC ale produselor tranzacționate, asigurând că facturile sunt emise corect și că mențiunea \"Taxare inversă\" este inclusă automat când este necesar [6].")

# 3.2
h2(doc, "3.2 Transparență și Monitorizare: DAC7")

h3(doc, "3.2.1 Obligațiile operatorilor de platforme digitale")

para(doc, "Implementarea Directivei (UE) 2021/514, cunoscută sub denumirea de DAC7, reprezintă un pas decisiv către transparența fiscală a economiei digitale. În România, această directivă a fost transpusă prin OG 16/2023 și este reglementată detaliat prin ordinele ANAF nr. 1996/2023 și 1946/2023 [6]. Aceasta impune operatorilor de platforme digitale obligația de a colecta și raporta anual informații despre vânzătorii care desfășoară activități relevante prin intermediul lor [6].")

para(doc, "Sub incidența DAC7 cad atât operatorii de platforme cu rezidență fiscală în Uniunea Europeană, cât și cei din afara UE care facilitează activități pe teritoriul României [6]. O \"platformă\" este definită extensiv drept orice software, inclusiv site-uri web sau aplicații mobile, care permite vânzătorilor să fie conectați cu alți utilizatori în scopul realizării unei activități relevante, cum ar fi vânzarea de bunuri, prestarea de servicii personale, închirierea de bunuri imobile sau închirierea de mijloace de transport [6].")

h3(doc, "3.2.2 Procedura de raportare și praguri de excludere")

para(doc, "Operatorii trebuie să depună formularul electronic F7000 până la data de 31 ianuarie a anului următor celui de raportare [6]. Prima raportare efectivă a avut ca termen limită 31 ianuarie 2024 pentru datele aferente anului 2023 [6]. Procesul de due diligence implică validarea informațiilor furnizate de vânzători contra surselor publice disponibile, cu obligația de a semnala inconsistențe până la 31 decembrie al anului de raportare [6].")

para(doc, "Există praguri de excludere menite să reducă povara administrativă pentru vânzătorii mici. Nu fac obiectul raportării \"vânzătorii excluși\" care îndeplinesc una dintre următoarele condiții [6]:")

bullet(doc, "Entități guvernamentale sau entități ale căror acțiuni sunt tranzacționate la bursă")
bullet(doc, "Vânzători de bunuri care au facilitat mai puțin de 30 de vânzări, iar contraprestația totală nu a depășit 2.000 EUR în perioada de raportare")
bullet(doc, "Entități care oferă cazare prin platforme și au efectuat mai puțin de 2.000 de activități relevante")

add_table(doc,
    ["Pilon Raportare", "Obligația Platformei", "Sancțiune Neconformare"],
    [
        ["Identitate Vânzător", "Colectarea și validarea CIF/TVA și adresei [6]", "Blocarea contului după 60 zile"],
        ["Raportare Financiară", "Agregare remunerație și nr. tranzacții/trimestru [6]", "Amendă până la 20.000 EUR [6]"],
        ["Due Diligence", "Validare contra surselor publice [6]", "Răspundere solidară fiscală"],
        ["Transmitere Formular", "Depunere F7000 până la 31 ianuarie [6]", "Suspendare operațiuni [6]"],
    ]
)

para(doc, "AgriConnect integrează aceste cerințe de raportare direct în modulele IAM și Financial, asigurând că toate datele necesare pentru declarația informativă sunt colectate la punctul tranzacției, nu post-factum. Sistemul generează automat raportul F7000 prin endpoint-ul POST /dac7/generate, agregând datele trimestriale de venit ale fiecărui vânzător activ pe platformă [6].")

# 3.3
h2(doc, "3.3 Sistemul RO e-Transport și Codul UIT")

h3(doc, "3.3.1 Criterii de monitorizare și bunuri cu risc fiscal ridicat")

para(doc, "Sistemul național RO e-Transport completează cadrul de supraveghere fiscală prin monitorizarea în timp real a transporturilor rutiere de bunuri pe teritoriul național [6]. Scopul principal este reducerea evaziunii fiscale prin identificarea punctelor de deturnare a mărfurilor din circuitul legal. Sistemul funcționează prin obligativitatea declarării anticipate a transporturilor și verificarea în trafic a existenței codului UIT [6].")

para(doc, "RO e-Transport monitorizează două mari categorii de transporturi: transporturile internaționale de orice bunuri și transporturile naționale de bunuri cu risc fiscal ridicat (BRFR) [6]. Un transport devine raportabil dacă îndeplinește simultan următoarele condiții [6]:")

bullet(doc, "Este efectuat cu un vehicul cu masa maximă tehnic admisibilă de cel puțin 2,5 tone")
bullet(doc, "Masa brută a mărfurilor depășește 500 kg SAU valoarea totală a mărfurilor depășește 10.000 lei (fără TVA)")
bullet(doc, "Bunurile transportate se încadrează în categoriile BRFR definite de ANAF (inclusiv cerealele sub codurile NC monitorizate)")

h3(doc, "3.3.2 Procesul de obținere și utilizare a codului UIT")

para(doc, "Codul UIT (Unitate de Identificare a Transportului) este elementul central al sistemului. Acesta este un cod unic generat în SPV (Spațiul Privat Virtual) după declararea datelor aferente transportului [6]. Responsabilitatea declarării revine furnizorului (pentru tranzacții interne) sau beneficiarului (pentru achiziții intracomunitare) [6].")

para(doc, "Ciclul de viață complet al unui UIT parcurge mai multe etape: Notificarea inițială (declararea datelor transportului, incluzând expeditor, destinatar, tipul mărfii, cantitate, valoare, vehicul și ruta planificată), Generarea codului UIT de către sistemul ANAF, Comunicarea codului către transportator (care trebuie să îl aibă disponibil în format electronic sau tipărit pe toată durata transportului), și eventual Modificarea sau Anularea declarației dacă condițiile se schimbă [6].")

add_table(doc,
    ["Caracteristică UIT", "Detaliu", "Impact Operațional"],
    [
        ["Valabilitate", "5 zile (național); 15 zile (internațional) [6]", "Planificare anticipată necesară"],
        ["Moment Generare", "Max 3 zile înainte de transport [6]", "Integrare timpurie în fluxul contractual"],
        ["Obligație GPS (2025)", "Transfer date GPS către ANAF [6]", "Hardware GPS pe vehicule obligatoriu"],
        ["Sancțiuni", "Amenzi până la 100.000 lei [6]", "Risc operațional semnificativ"],
        ["Confiscare", "Bunuri fără UIT pot fi confiscate [6]", "Pierdere totală a încărcăturii"],
    ]
)

para(doc, "AgriConnect automatizează întregul ciclu de viață al codului UIT prin integrarea API-ului ANAF v2 în modulul de Transport. Utilizând datele contractuale din contextul Trading, platforma pre-completează declarațiile XML, gestionând automat ciclul: Notificare → Modificare → Confirmare/Anulare [6]. Această integrare asigură că transportul nu este niciodată tratat ca o operațiune pur fizică, ci ca un flux de date coordonat și legal conform [6].")

# 3.4
h2(doc, "3.4 Infrastructura Financiară: PSD2 și Sistemul Escrow")

h3(doc, "3.4.1 Arhitectura conturilor protejate și segregarea fondurilor")

para(doc, "Sistemele de plăți digitale în cadrul marketplace-urilor B2B au fost fundamental restructurate de Directiva Revizuită a Serviciilor de Plată (PSD2), transpusă în legislația națională prin Legea nr. 209/2019 [7]. Această reglementare a catalizat trecerea către Open Banking, permițând furnizorilor de servicii terți (Third-Party Providers - TPPs) să acceseze datele conturilor bancare și să inițieze plăți în numele clienților, cu consimțământul explicit al acestora [7].")

para(doc, "Conceptul de \"safeguarded accounts\" sau conturi de segregare este esențial pentru protejarea capitalului utilizatorilor [7]. Aceste conturi sunt structurate astfel încât fondurile clienților să fie izolate legal și operațional de activele proprii ale platformei. Într-o tranzacție cu cereale, cumpărătorul transferă contravaloarea mărfii într-un cont protejat, unde fondurile rămân blocate până când condițiile contractuale — recepția calitativă și cantitativă a lotului conform specificațiilor din listare — sunt confirmate prin platformă [7].")

h3(doc, "3.4.2 Implementare tehnică și interconectivitate bancară")

para(doc, "Implementarea unui sistem de escrow digital în România necesită o integrare profundă cu API-urile bancare PSD2. O analiză a capabilităților la nivelul principalelor instituții bancare din România relevă o diversitate de protocoale de autentificare și restricții specifice fiecărei bănci [8]:")

add_table(doc,
    ["Instituție Bancară", "Flux Autorizare", "Restricții Cont"],
    [
        ["Banca Transilvania", "BT24 (web) sau BT Go/BT Pay (mobile)", "Nu suportă BT Ultra; exclude depozit/credit [8]"],
        ["BCR", "George (web/mobile)", "Exclude conturi depozit și credit [8]"],
        ["BRD", "MyBRD Mobile / BRD@ffice", "Suportă conturi curente și de card [8]"],
        ["ING Bank", "Home'Bank", "Suportă curente, card, POS, colector [8]"],
        ["Raiffeisen", "Raiffeisen Online / Smart Mobile", "Exclude conturi depozit/credit [8]"],
    ]
)

h3(doc, "3.4.3 Pilonii de securitate PSD2 și Split Payment")

add_table(doc,
    ["Pilon Securitate PSD2", "Cerință Legală", "Implementare în AgriConnect"],
    [
        ["SCA", "Verificare multi-factor [8]", "Protocol 3D Secure 2 pentru toate plățile"],
        ["Dynamic Linking", "Coduri unice sumă/beneficiar [8]", "Afișare destinatar și total pe ecranul auth"],
        ["Open Banking", "Acces cont (XS2A) pentru TPP [8]", "Verificare sold cumpărător via AISP"],
        ["Interzicere Suprataxare", "Fără taxe suplimentare card [8]", "Comisioane marketplace clar afișate"],
    ]
)

para(doc, "Platforma suportă \"Split Payments\", o funcționalitate esențială pentru logistica multi-parte [4]. Într-o tranzacție tipică AgriConnect, suma totală plătită de cumpărător este împărțită automat: 95% către vânzător (fermier), 3% către transportator pentru servicii de fret, și 2% către AgriConnect ca comision de intermediere. Această împărțire este gestionată atomic prin endpoint-ul POST /escrow/:id/release, asigurând că toate cele trei plăți sunt procesate în aceeași tranzacție [4].")

# 3.5
h2(doc, "3.5 Practici Comerciale Neloiale: Legea 81/2022")

para(doc, "Legea nr. 81/2022, care transpune Directiva (UE) 2019/633, a fost introdusă pentru a corecta inechitățile dintre furnizorii de produse agricole (adesea fermieri mici) și cumpărătorii mari (retaileri sau traderi internaționali) prin interzicerea practicilor comerciale neloiale (UTP) [8]. Legea stabilește norme stricte privind comportamentul cumpărătorilor [8]:")

bullet(doc, "Depășirea Termenelor de Plată: maxim 14 zile pentru produse perisabile și 30 de zile pentru restul produselor agricole [8]")
bullet(doc, "Anularea Comenzilor: interzisă cu un preaviz mai mic de 30 de zile pentru produse perisabile [8]")
bullet(doc, "Taxe de Listare și Marketing: cumpărătorul nu poate impune furnizorului plăți pentru listare sau activități promoționale, decât dacă sunt convenite explicit prin contract [8]")
bullet(doc, "Plafonarea Remizelor: este interzisă aplicarea de reduceri care depășesc cumulat 20% din valoarea facturată [8]")
bullet(doc, "Modificări Unilaterale: este interzisă modificarea retroactivă a condițiilor contractuale privind calitatea, cantitatea sau prețul [8]")

para(doc, "Consiliul Concurenței are rolul de autoritate de aplicare, având puterea de a investiga sesizările, de a efectua inspecții inopinate și de a aplica sancțiuni de până la 1% din cifra de afaceri [8]. AgriConnect servește ca un registru neutru al interacțiunilor comerciale — dacă un cumpărător modifică unilateral condițiile contractuale sau depășește termenul de plată, contextul Disputes al platformei semnalizează automat acțiunea ca o potențială încălcare a Legii 81/2022 [8].")

# 3.6
h2(doc, "3.6 GDPR, Privacy by Design și Trasabilitate Farm-to-Fork")

h3(doc, "3.6.1 Protecția datelor prin design în ecosistemele B2B")

para(doc, "O platformă B2B care gestionează volume mari de date comerciale și financiare trebuie să integreze principiile GDPR încă din faza de arhitectură [9]. \"Privacy by Design\" înseamnă că măsurile tehnice și organizatorice sunt integrate în tehnologia de procesare a datelor de la bun început, nu adăugate retroactiv [9]. Acest lucru implică:")

bullet(doc, "Minimizarea Datelor: colectarea doar a informațiilor strict necesare pentru conformitatea fiscală (DAC7) și logistică (e-Transport)")
bullet(doc, "Pseudonimizarea și Criptarea: protejarea datelor de contact ale fermierilor și a detaliilor bancare, cu acces permis doar pe baza principiului \"need-to-know\"")
bullet(doc, "Intersecția GDPR-DAC7: deși operatorii trebuie să raporteze datele vânzătorilor către ANAF sub DAC7, aceștia trebuie să informeze subiecții datelor despre acest proces și să ofere acces la datele raportate la cerere [6]")

h3(doc, "3.6.2 Trasabilitatea alimentară: Regulamentul (CE) 178/2002")

para(doc, "Trasabilitatea este \"coloana vertebrală\" a siguranței alimentare în UE. Regulamentul (CE) nr. 178/2002 stabilește principii generale, impunând operatorilor capacitatea de a identifica orice persoană de la care au fost aprovizionați și orice persoană căreia i-au livrat un produs — principiul \"one-step-forward, one-step-back\" [9]. O implementare digitală a trasabilității presupune identificarea loturilor (fiecare partidă de cereale corelată cu loturile de materii prime), etichetarea corespunzătoare pentru retrageri rapide, și integrarea cu platforma B2B unde documentele de însoțire și certificatele de calitate sunt stocate digital [9]. ANSVSA supraveghează aceste fluxuri în România [9].")

# 3.7
h2(doc, "3.7 Delimitarea juridică: CAEN 4611 vs. Legea 357/2005")

para(doc, "Există o distincție clară între platformele de intermediere (agregatoare de cerere și ofertă) și bursele de mărfuri reglementate. Bursele de mărfuri funcționează în temeiul Legii nr. 357/2005 ca instituții care administrează piețe de interes public, asigurând condiții centralizate de negociere pentru bunuri fungibile [9]. Bursa Română de Mărfuri (BRM) operează terminale specializate pentru gaze, energie și un \"Ring al Cerealelor\" [9].")

para(doc, "AgriConnect operează sub codul CAEN 4611 ca un intermediar digital, facilitând tranzacții bilaterale OTC (over-the-counter) [9]. Diferența majoră rezidă în tipul de instrumente tranzacționate: dacă platforma ar oferi contracte futures sau opțiuni pe marfă, aceasta ar intra sub incidența Legii nr. 126/2018 privind piețele de instrumente financiare, necesitând autorizări complexe de la ASF și capital social ridicat [9]. Pentru tranzacțiile spot cu livrare imediată și contractele forward (cu livrare fizică la o dată viitoare), modelul de intermediere oferă flexibilitate maximă în configurarea licitațiilor și condițiilor specifice de livrare, fără povara regulatorie a unei burse reglementate [9].")

page_break(doc)
save_doc(doc)
print("✓ Capitolul 3 — CADRUL LEGISLATIV — complet (expanded)")
