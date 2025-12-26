# Afwezigheidsplanning App 2026

Een professionele Electron desktop applicatie voor het beheren van werknemersafwezigheden, urenregistratie, kilometers, dagontvangsten en gratis cola.

## 🚀 Features

### Werknemers Beheer
- Werknemers toevoegen/bewerken/verwijderen
- Nummerplaat registratie
- Vakantiedagen tracking

### Urenregistratie
- Individuele uren invoer
- **Bulk maandoverzicht** (Excel-achtig)
- Automatische totalen per werknemer en per dag
- Automatisch opslaan (2 seconden na wijziging)

### Kilometers
- Individuele kilometer registratie
- **Bulk maandoverzicht** (Excel-achtig)
- Automatische berekening: €0,40 per kilometer
- Kilometerdeclaratie met handtekening
- PDF export voor boekhouder
- Automatisch opslaan

### Afwezigheden & Vakantie
- Individuele afwezigheid registratie
- **Bulk maandoverzicht** (Excel-achtig)
- Direct bewerken in tabel
- Visuele indicatoren (Vakantie, Ziek, Persoonlijk)
- **Werkdag logica**:
  - Maandag = Gesloten
  - Weekenden = Werkdagen
  - Feestdagen = Open
- Automatisch opslaan

### Dagontvangsten
- BTW percentages per dag (6%, 12%, 21%)
- Automatische berekening dagtotaal
- Maandoverzicht
- PDF export
- Automatisch opslaan

### Gratis Cola
- Gratis en verkocht tracking per dag
- Automatische berekening totaal (verkocht × €2,30)
- Jaaroverzicht
- PDF export
- Automatisch opslaan

### Export & Import
- **Liantis Export**: Excel met uren, afwezigheden en kilometers
- **Excel Import**: Bulk import van data voor alle pagina's
- **PDF Export**: Professionele exports voor alle pagina's

## 🛠️ Technologie Stack

- **Frontend**: HTML, CSS, JavaScript (Electron)
- **Backend**: Electron Main Process
- **Database**: JSON-based (simpel, geen externe dependencies)
- **PDF**: jsPDF met autoTable
- **Excel**: XLSX library

## 📋 Vereisten

- Node.js 18+ 
- npm

## 🔧 Installatie

```bash
# Clone repository
git clone <repository-url>
cd afwezigheidsplanning

# Installeer dependencies
cd afwezigheidsplanning-app
npm install
```

## 🚀 Gebruik

### Electron App Starten

```bash
cd afwezigheidsplanning-app
npm run start:electron
```

De applicatie opent automatisch in een Electron venster.

### Windows Build

**Portable Versie (Aanbevolen):**
```bash
npm run build:electron:win:portable
```
Maakt een direct uitvoerbaar .exe bestand (geen installatie nodig).

**Installer Versie:**
```bash
npm run build:electron:win:installer
```
Maakt een professionele NSIS installer met shortcuts.

**Beide:**
```bash
npm run build:electron:win
```

**Via Script (Windows):**
Dubbelklik op `scripts\build-exe.bat` en kies build type.

Zie `docs/WINDOWS_INSTALLATIE_GUIDE.md` voor gedetailleerde instructies.

## 📁 Project Structuur

```
afwezigheidsplanning/
├── README.md                    # Dit bestand
├── docs/                        # Documentatie
│   ├── INSTRUCTIES.md
│   ├── KM_DECLARATIE_SYSTEEM.md
│   └── ...
├── data/                        # Excel bestanden
│   ├── Werknemersafwezigheidsplanning2026.xlsm
│   └── Kilometer2026.xlsx
├── scripts/                     # Windows scripts
│   ├── START_APP.bat
│   └── build-exe.bat
└── afwezigheidsplanning-app/    # Hoofd applicatie
    ├── app-simple/
    │   └── index.html           # Frontend
    ├── electron/
    │   ├── main-simple.js      # Electron main process
    │   ├── preload-simple.js    # Preload script
    │   └── database-simple.js   # Database operations
    ├── package.json
    └── electron-builder.yml
```

## 🗄️ Database

De applicatie gebruikt een simpele JSON-based database die automatisch wordt opgeslagen in:
- **macOS**: `~/Library/Application Support/afwezigheidsplanning-app/database.json`
- **Windows**: `%APPDATA%/afwezigheidsplanning-app/database.json`

## 📖 Documentatie

Zie de `docs/` map voor gedetailleerde documentatie:

### Voor Gebruikers
- `QUICK_START_WINDOWS.md` - Snel starten op Windows ⭐
- `WINDOWS_INSTALLATIE_GUIDE.md` - Complete Windows installatie guide
- `INSTRUCTIES.md` - Algemene instructies

### Voor Ontwikkelaars
- `WINDOWS_BUILD_INSTRUCTIES.md` - Hoe Windows build te maken
- `WINDOWS_DISTRIBUTIE.md` - App distribueren

### Functionaliteiten
- `KM_DECLARATIE_SYSTEEM.md` - Kilometerdeclaratie documentatie
- `MULTI_WERKNEMER_KM_DECLARATIE.md` - Multi-werknemer features
- `AFWEZIGHEDEN_OVERZICHT.md` - Afwezigheden overzicht
- `WERKDAGEN_UPDATE.md` - Werkdag logica
- `KILOMETERS_IMPORT_INSTRUCTIES.md` - Kilometers import
- En meer...

Zie `docs/README.md` voor volledige documentatie index.

## 🎯 Belangrijke Features

### Automatisch Opslaan
Alle pagina's slaan automatisch op 2 seconden na de laatste wijziging. Geen data verlies meer!

### Bulk Overzichten
Alle bulk pagina's werken Excel-achtig:
- Direct bewerken in tabel
- Maandoverzicht per werknemer
- Automatische totalen
- Weekend/weekdag handling

### PDF Export
Alle pagina's hebben PDF export functionaliteit:
- Uren Maandoverzicht
- Kilometers Maandoverzicht
- Dagontvangsten
- Gratis Cola

### Excel Import
Importeer Excel bestanden voor:
- Uren & Afwezigheden
- Kilometers
- Dagontvangsten
- Gratis Cola

## 📝 Licentie

Private - Alleen voor intern gebruik
