# Multi-Werknemer KM Declaratie - Nieuwe Functionaliteiten

## 🎯 Wat is Nieuw?

### ✅ Optie B Geïmplementeerd: Meerdere Werknemers Tegelijk

De KM Declaratie pagina (`/km-declaratie`) is volledig vernieuwd en ondersteunt nu:

## 🔥 Hoofdfuncties

### 1. **Meerdere Werknemers Selecteren**
- ✅ **Checkbox selectie** voor elke werknemer
- ✅ **Selecteer Alles** knop voor snelle selectie
- ✅ Alleen werknemers **met nummerplaat** worden getoond
- ✅ Teller toont aantal geselecteerde werknemers

### 2. **"Elke Dag Gereden" Veld** ⭐ NIEUW
- Vul in hoeveel **werkdagen** de werknemer heeft gereden
- Bijvoorbeeld: "22 dagen"
- Wordt getoond in de PDF declaratie
- Optioneel veld (kan leeg blijven)

### 3. **Bulk Bewerken**
Voor **elk geselecteerde werknemer** zie je:
- ✅ Begin km-stand
- ✅ Eind km-stand
- ✅ **Elke dag gereden** (aantal dagen)
- ✅ Automatisch berekend verschil
- ✅ Totaal kilometers
- ✅ Te betalen bedrag (€0,40/km)
- ✅ Handtekening status

### 4. **Bulk Opslaan**
- **"Alles Opslaan"** knop bovenaan
- Slaat alle geselecteerde werknemers in één keer op
- Of gebruik individuele "Opslaan" knop per werknemer

### 5. **Individuele Acties**
Per werknemer kun je:
- Opslaan (km-standen)
- Tekenen (digitale handtekening)
- Download PDF (met alle info)

## 📋 Werkwijze

### Stap 1: Maand Selecteren
```
1. Open /km-declaratie
2. Selecteer maand (bijvoorbeeld: December 2026)
```

### Stap 2: Werknemers Selecteren
```
3. Klik op werknemers met checkbox
4. Of gebruik "Selecteer Alles" voor alle werknemers
5. Teller toont: "3 geselecteerd"
```

### Stap 3: Gegevens Invullen
Voor elke geselecteerde werknemer:
```
6. Begin km-stand:    bijv. 45.230 km
7. Eind km-stand:     bijv. 47.180 km
8. Elke dag gereden:  bijv. 22 dagen  ⭐ NIEUW
9. Verschil wordt automatisch berekend: 1.950 km
```

### Stap 4: Opslaan
```
10. Klik "Alles Opslaan" (bovenaan)
    OF
    Klik "Opslaan" per individuele werknemer
```

### Stap 5: Tekenen (per werknemer)
```
11. Klik "Tekenen" knop bij elke werknemer
12. Teken digitale handtekening
13. Klik "Opslaan"
```

### Stap 6: PDF Downloaden
```
14. Klik "Download PDF" per werknemer
15. PDF bevat nu ook "Aantal dagen gereden"
```

## 🎨 UI Verbeteringen

### Overzichtelijke Cards
Elke werknemer heeft 3 summary cards:
- 🟠 **Totaal KM**: Aantal kilometers
- 🟢 **Te Betalen**: Bedrag in euro's
- 🔵 **Status**: ✓ Getekend / ○ Niet getekend

### Visuele Feedback
- **Geselecteerde werknemers**: Blauwe border en achtergrond
- **Niet geselecteerd**: Grijze border
- **Hover effect**: Lichte highlight bij mouse-over
- **Checkboxes**: Gevuld of leeg icoon

### Handtekening Preview
- Handtekening wordt getoond per werknemer
- Datum/tijd van ondertekening zichtbaar
- PDF download knop direct naast handtekening

## 📄 PDF Updates

De PDF bevat nu:
```
✓ Werknemer naam
✓ Nummerplaat
✓ Periode (maand/jaar)
✓ Begin km-stand
✓ Eind km-stand
✓ Verschil
✓ Aantal dagen gereden ⭐ NIEUW
✓ Gedetailleerde rittenlijst
✓ Totalen
✓ Handtekening
✓ Datum ondertekening
```

## 🗄️ Database Wijzigingen

### MaandKmStand Model
Nieuw veld toegevoegd:
```prisma
model MaandKmStand {
  id              String    @id @default(uuid())
  werknemerId     String
  jaar            Int
  maand           Int
  beginKmStand    Float
  eindKmStand     Float?
  elkeDagGereden  Float?    // ⭐ NIEUW VELD
  handtekening    String?
  getekendOp      DateTime?
  
  // ... relaties
}
```

## 🎯 Voordelen

### Voor Jou (Administrator)
1. **Tijdsbesparing**: Bewerk meerdere werknemers tegelijk
2. **Overzicht**: Zie alle werknemers in één scherm
3. **Flexibiliteit**: Selecteer alleen werknemers die je nodig hebt
4. **Bulk save**: Alles in één keer opslaan

### Voor de Boekhouder
1. **Meer detail**: "Elke dag gereden" info in PDF
2. **Complete info**: Alle benodigde gegevens op één PDF
3. **Professioneel**: Netjes geformatteerd met handtekening

## 🔍 Voorbeeld Scenario

### Scenario: 3 werknemers hebben kilometers in December
```
Werknemers met nummerplaat:
✓ Jan Janssen (1-ABC-123)
✓ Piet Peters (2-DEF-456)
✓ Klaas Klaassen (3-GHI-789)
✓ Marie Jansen (4-JKL-012)
```

### Werkwijze:
1. Selecteer maand: December 2026
2. Vink aan: Jan, Piet, Klaas (3 werknemers)
3. Vul voor elk:
   - Begin/eind km-stand
   - Elke dag gereden (bijv. 22, 20, 18 dagen)
4. Klik "Alles Opslaan"
5. Teken per werknemer digitaal
6. Download 3 PDF's

**Tijd bespaard**: Alles in één scherm, geen wisselen tussen pagina's!

## 🚀 Toegang

**URL**: http://localhost:3000/km-declaratie

**Navigatie**: Menu → "KM Declaratie"

## ⚠️ Belangrijk

### Wie wordt getoond?
Alleen werknemers **met nummerplaat** worden getoond in de selectie lijst.

### Opslaan vereist voor tekenen
Je moet eerst "Opslaan" klikken voordat je kunt tekenen (anders is er geen record om de handtekening aan te koppelen).

### Individuele PDF's
Elke werknemer krijgt een eigen PDF (geen gecombineerde PDF). Dit is beter voor de administratie en archivering.

## ✨ Extra Features

### Slim Laden
- Data wordt alleen geladen voor geselecteerde werknemers
- Loading indicator tijdens ophalen data
- Snelle response tijd

### Foutafhandeling
- Validatie op verplichte velden
- Duidelijke foutmeldingen
- Geen data verlies bij fouten

### Responsive Design
- Werkt op desktop, tablet en mobiel
- Checkboxes groot genoeg voor touch
- Tabellen scrollen horizontaal op kleine schermen

## 🎉 Samenvatting

De KM Declaratie pagina is nu **veel krachtiger**:
- ✅ Meerdere werknemers tegelijk
- ✅ "Elke dag gereden" veld toegevoegd
- ✅ Bulk save functionaliteit
- ✅ Overzichtelijker interface
- ✅ Snellere workflow
- ✅ PDF's met meer detail

**Alles is klaar voor gebruik!** 🚗💨

