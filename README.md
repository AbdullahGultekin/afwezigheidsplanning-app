# Afwezigheidsplanning App 2026

Een professionele web applicatie voor het beheren van werknemersafwezigheden, urenregistratie, kilometers en planning.

## 🚀 Features

### Werknemers Beheer
- Werknemers toevoegen/bewerken
- Nummerplaat registratie
- Vakantiedagen tracking

### Urenregistratie
- Individuele uren invoer
- **Bulk maandoverzicht** (Excel-achtig)
- Automatische totalen per werknemer en per dag

### Kilometers
- Individuele kilometer registratie
- **Bulk maandoverzicht** (Excel-achtig)
- Automatische berekening: €0,40 per kilometer
- Kilometerdeclaratie met handtekening
- PDF export voor boekhouder

### Afwezigheden & Vakantie
- Individuele afwezigheid registratie
- **Bulk maandoverzicht** (Excel-achtig)
- Direct bewerken in tabel
- Visuele indicatoren (Vakantie, Ziek, Persoonlijk)
- **Werkdag logica**:
  - Maandag = Gesloten
  - Weekenden = Werkdagen
  - Feestdagen = Open

### Export & Import
- **Liantis Export**: Excel met uren, afwezigheden en kilometers
- **Excel Import**: Bulk import van data
- **Kilometers Import**: Specifieke import voor kilometer data
- **PDF Export**: Professionele kilometerdeclaraties

## 🛠️ Technologie Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite met Prisma ORM
- **PDF**: jsPDF met autoTable
- **Excel**: XLSX library

## 📋 Vereisten

- Node.js 18+ 
- npm of yarn

## 🔧 Installatie

```bash
# Clone repository
git clone <repository-url>
cd afwezigheidsplanning

# Installeer dependencies
cd afwezigheidsplanning-app
npm install

# Setup database
npx prisma migrate dev

# Start development server
npm run dev
```

## 🚀 Gebruik

### Development Mode
```bash
npm run dev
```
Applicatie draait op: http://localhost:3000

### Production Mode
```bash
npm run build
npm run start
```

## 📁 Project Structuur

```
afwezigheidsplanning/
├── afwezigheidsplanning-app/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── werknemers/        # Werknemers pagina
│   │   ├── uren/              # Urenregistratie
│   │   │   └── bulk/          # Bulk uren overzicht
│   │   ├── kilometers/        # Kilometers
│   │   │   └── bulk/          # Bulk kilometers overzicht
│   │   ├── km-declaratie/     # KM declaratie met handtekening
│   │   ├── afwezigheden/      # Afwezigheden
│   │   │   └── bulk/          # Bulk afwezigheden overzicht
│   │   ├── export/            # Export pagina
│   │   └── import/            # Import pagina
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   ├── prisma/                # Database schema
│   └── public/                # Static files
├── Werknemersafwezigheidsplanning2026.xlsm  # Origineel Excel bestand
└── Kilometer2026.xlsx         # Kilometer Excel bestand
```

## 🗄️ Database Schema

### Models
- **Werknemer**: Werknemers met nummerplaat en vakantiedagen
- **Urenregistratie**: Uren per werknemer per dag
- **Afwezigheid**: Vakantie, ziekte, persoonlijk verlof
- **Kilometer**: Kilometers per werknemer per dag
- **MaandKmStand**: Maandelijkse km-standen met handtekening

## 📖 Documentatie

- `INSTRUCTIES.md` - Algemene instructies
- `KM_DECLARATIE_SYSTEEM.md` - Kilometerdeclaratie documentatie
- `MULTI_WERKNEMER_KM_DECLARATIE.md` - Multi-werknemer features
- `AFWEZIGHEDEN_OVERZICHT.md` - Afwezigheden overzicht
- `WERKDAGEN_UPDATE.md` - Werkdag logica

## 🎯 Belangrijke Features

### Bulk Overzichten
Alle bulk pagina's werken Excel-achtig:
- Direct bewerken in tabel
- Maandoverzicht per werknemer
- Automatische totalen
- Weekend/weekdag handling

### Kilometerdeclaratie
- Begin/eind km-stand per maand
- "Elke dag gereden" tracking
- Digitale handtekening
- PDF export met alle details
- Automatische berekening €0,40/km

### Werkdag Logica
- Maandag = Gesloten (geen werk)
- Weekenden = Werkdagen (open)
- Feestdagen = Open (werkdagen)
- Automatische detectie Nederlandse feestdagen

## 📝 Licentie

Dit project is ontwikkeld voor intern gebruik.

## 👤 Auteur

Ontwikkeld voor afwezigheidsplanning en administratie.

