# Kilometerdeclaratie Systeem - Documentatie

## Overzicht
Het kilometerdeclaratie systeem is volledig geïmplementeerd met alle gevraagde functionaliteiten voor professionele kilometeradministratie.

## 🚗 Nieuwe Functionaliteiten

### 1. Nummerplaat Registratie
- **Locatie**: Werknemers pagina (`/werknemers`)
- Elke werknemer kan een nummerplaat krijgen toegewezen
- Nummerplaat wordt weergegeven in UPPERCASE format
- Maximaal 10 karakters

### 2. Maandelijkse Km-stand Tracking
- **Begin km-stand**: Kilometerstand aan het begin van de maand
- **Eind km-stand**: Kilometerstand aan het einde van de maand
- **Automatische berekening**: Het verschil wordt automatisch berekend
- **Database model**: `MaandKmStand` met relatie naar werknemer

### 3. Digitale Handtekening
- **Component**: `SignatureCanvas.tsx`
- Werknemers kunnen digitaal tekenen met muis of touchscreen
- Handtekening wordt opgeslagen als base64 encoded PNG image
- Timestamp wordt automatisch toegevoegd bij ondertekening
- Mogelijkheid om handtekening te wissen en opnieuw te tekenen

### 4. KM Declaratie Pagina
- **URL**: http://localhost:3000/km-declaratie
- **Functionaliteiten**:
  - Selecteer werknemer (alleen werknemers met nummerplaat worden getoond)
  - Selecteer maand/jaar
  - Invoer begin en eind km-stand
  - Overzicht van alle kilometers voor de maand
  - Automatische berekening: **Totaal kilometers × €0,40**
  - Digitale handtekening functie
  - Download als PDF

### 5. PDF Export
- **Endpoint**: `/api/km-declaratie/pdf`
- **Inhoud**:
  - Bedrijfsheader met "Kilometerdeclaratie" titel
  - Werknemer naam en nummerplaat
  - Periode (maand/jaar)
  - Begin en eind km-standen in highlighted box
  - Gedetailleerde tabel met:
    - Datum van elke rit
    - Aantal kilometers per rit
    - Bedrag per rit (km × €0,40)
  - Totaal kilometers en totaal bedrag
  - Digitale handtekening (indien aanwezig)
  - Datum/tijd van ondertekening
  - Footer met paginanummering en tarief

## 📊 Tarief Berekening
- **Tarief**: €0,40 per kilometer (constant in code)
- Berekening gebeurt automatisch:
  - In de bulk kilometers pagina
  - In de KM declaratie pagina
  - In de PDF export
  - In de Liantis export

## 🗄️ Database Schema

### MaandKmStand Model
```prisma
model MaandKmStand {
  id            String    @id @default(uuid())
  werknemerId   String
  jaar          Int       // Bijv. 2026
  maand         Int       // 1-12
  beginKmStand  Float     // Km-stand begin van de maand
  eindKmStand   Float?    // Km-stand eind van de maand
  handtekening  String?   // Base64 encoded handtekening
  getekendOp    DateTime? // Datum/tijd van ondertekening
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  werknemer     Werknemer @relation(fields: [werknemerId], references: [id], onDelete: Cascade)
  
  @@unique([werknemerId, jaar, maand])
}
```

### Werknemer Model (bijgewerkt)
```prisma
model Werknemer {
  id                String              @id @default(uuid())
  naam              String
  email             String?             @unique
  nummerplaat       String?             // ⭐ NIEUW
  vakantiedagenTotaal Float           @default(20)
  vakantiedagenOpgenomen Float        @default(0)
  actief            Boolean             @default(true)
  
  urenregistraties  Urenregistratie[]
  afwezigheden      Afwezigheid[]
  kilometers        Kilometer[]
  maandKmStanden    MaandKmStand[]      // ⭐ NIEUW
}
```

## 🔌 API Endpoints

### Maand Km-stand
- `GET /api/maand-km-stand` - Haal km-standen op (met filters)
- `POST /api/maand-km-stand` - Maak nieuwe km-stand aan
- `GET /api/maand-km-stand/[id]` - Haal specifieke km-stand op
- `PUT /api/maand-km-stand/[id]` - Update km-stand
- `DELETE /api/maand-km-stand/[id]` - Verwijder km-stand

### PDF Generatie
- `GET /api/km-declaratie/pdf?id=[maandKmStandId]` - Genereer en download PDF

## 📱 Gebruikershandleiding

### Stap 1: Nummerplaat Toevoegen
1. Ga naar "Werknemers" in de navigatie
2. Bewerk een werknemer of voeg een nieuwe toe
3. Vul het "Nummerplaat" veld in (bijv. "1-ABC-123")
4. Sla op

### Stap 2: Kilometers Registreren
1. Ga naar "Kilometers" → "Bulk Kilometers Invoer"
2. Selecteer de maand
3. Vul kilometers in per dag voor alle werknemers
4. Klik "Alle Wijzigingen Opslaan"

### Stap 3: Maandelijkse Declaratie Maken
1. Ga naar "KM Declaratie" in de navigatie
2. Selecteer een werknemer (met nummerplaat)
3. Selecteer de maand
4. Vul de begin km-stand in
5. Vul de eind km-stand in
6. Klik "Opslaan"
7. Controleer het overzicht:
   - Totaal kilometers wordt automatisch berekend
   - Totaal bedrag (km × €0,40) wordt getoond

### Stap 4: Digitaal Tekenen
1. Na het opslaan van km-standen, klik "Tekenen"
2. Teken uw handtekening met muis of vinger
3. Gebruik "Wissen" om opnieuw te beginnen
4. Klik "Opslaan" om handtekening te bewaren

### Stap 5: PDF Downloaden
1. Klik op "Download PDF" knop
2. PDF wordt automatisch gedownload
3. PDF bevat:
   - Alle km-gegevens
   - Berekeningen
   - Handtekening
   - Datum van ondertekening

### Stap 6: Export naar Liantis
1. Ga naar "Export" in de navigatie
2. Selecteer maand en jaar
3. Klik "Exporteren naar Liantis"
4. Excel bestand wordt gedownload met:
   - **Werkblad 1**: Urenregistraties en afwezigheden
   - **Werkblad 2**: Kilometers met "Te Betalen" kolom

## 🎨 UI Features

### Bulk Kilometers Pagina
- Maandoverzicht met alle werknemers
- Direct kilometers invoeren per dag
- Automatische totalen per werknemer
- Automatische totalen per dag
- **Nieuwe kolom**: "Te Betalen" (€0,40 per km)
- Weekend dagen zijn disabled

### KM Declaratie Overzicht
- 4 summary cards:
  - Werknemer naam
  - Nummerplaat
  - Totaal kilometers (in oranje)
  - Te betalen bedrag (in groen)
- Km-standen in highlighted box
- Handtekening preview
- Details tabel met alle ritten

## 📦 Geïnstalleerde Packages
- `jspdf` - PDF generatie library
- `jspdf-autotable` - Automatische tabellen in PDF

## 🚀 Voordelen voor de Boekhouder

1. **Professionele PDF**: 
   - Alle informatie netjes geformatteerd
   - Handtekening van werknemer
   - Gedetailleerd per rit
   - Totalen duidelijk zichtbaar

2. **Correcte Berekeningen**:
   - Automatisch €0,40 per km
   - Geen rekenfout mogelijk
   - Consistente tarieven

3. **Digitaal Bewijs**:
   - Handtekening met timestamp
   - Traceerbare km-standen
   - Begin en eind kilometerstanden

4. **Excel Export**:
   - Liantis export bevat nu kilometers
   - Aparte worksheet voor kilometers
   - Direct importeerbaar

## 🔐 Beveiliging
- Unique constraint op (werknemerId, jaar, maand)
- Cascade delete: verwijderen werknemer verwijdert ook km-standen
- Validation op API niveau
- Handtekening beveiligd als base64 string in database

## 🌐 URLs
- **Dashboard**: http://localhost:3000/
- **Werknemers**: http://localhost:3000/werknemers
- **Kilometers Bulk**: http://localhost:3000/kilometers/bulk
- **KM Declaratie**: http://localhost:3000/km-declaratie
- **Export**: http://localhost:3000/export

## ✅ Status
Alle gevraagde functionaliteiten zijn volledig geïmplementeerd en getest:
- ✅ Nummerplaat per werknemer
- ✅ Begin km-stand per maand
- ✅ Eind km-stand per maand
- ✅ Digitale handtekening functionaliteit
- ✅ PDF export voor boekhouder
- ✅ Automatische berekening €0,40 per km
- ✅ Integratie met bestaande kilometers systeem
- ✅ Navigation menu bijgewerkt

De applicatie is klaar voor gebruik! 🎉

