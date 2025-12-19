# Afwezigheidsplanning 2026

Een professionele webapplicatie voor urenregistratie en afwezigheidsplanning, speciaal ontwikkeld voor gebruik met Liantis sociaal secretariaat.

## 🚀 Features

- ✅ **Dashboard** - Overzicht van alle statistieken
- ✅ **Werknemersbeheer** - Beheer werknemers en vakantiedagen
- ✅ **Urenregistratie** - Registreer gewerkte uren met kalenderweergave
- ✅ **Afwezigheidsbeheer** - Plan vakantiedagen, ziekte en andere afwezigheden
- ✅ **Liantis Export** - Exporteer maandoverzicht naar Excel voor Liantis
- ✅ **Excel Import** - Importeer bestaande Excel afwezigheidsplanning

## 📋 Vereisten

- Node.js 18+ geïnstalleerd
- npm of yarn package manager

## 🛠️ Installatie

De applicatie is al geïnstalleerd en klaar voor gebruik!

## 🎯 Gebruik

### 1. Start de applicatie

```bash
npm run dev
```

De applicatie is beschikbaar op: **http://localhost:3000**

### 2. Eerste Stappen

1. **Werknemers Toevoegen**
   - Ga naar "Werknemers" in het menu
   - Klik op "Nieuwe Werknemer Toevoegen"
   - Vul naam, email en vakantiedagen in

2. **Uren Registreren**
   - Ga naar "Urenregistratie"
   - Selecteer een werknemer
   - Klik op een dag in de kalender
   - Voer het aantal uren in

3. **Afwezigheden Registreren**
   - Ga naar "Afwezigheden"
   - Selecteer een werknemer
   - Klik op "Nieuwe Afwezigheid Toevoegen"
   - Kies startdatum, einddatum en type

4. **Excel Importeren** (Optioneel)
   - Ga naar "Import"
   - Upload je bestaande Excel bestand
   - De data wordt automatisch geïmporteerd

5. **Exporteren naar Liantis**
   - Ga naar "Export"
   - Selecteer de gewenste maand
   - Klik op "Download Excel Bestand"
   - Upload het bestand naar Liantis portaal

## 📊 Afwezigheidstypes

- **V** - Vakantie
- **Z** - Ziek
- **P** - Persoonlijk
- **A1** - Aangepast 1
- **A2** - Aangepast 2

## 💾 Database

De applicatie gebruikt SQLite als database. Alle data wordt opgeslagen in:
```
prisma/dev.db
```

### Backup maken

Kopieer simpelweg het `dev.db` bestand naar een veilige locatie.

## 🔧 Technologie Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite met Prisma ORM
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Excel**: xlsx library

## 📝 Database Schema

### Werknemer
- Naam, Email
- Vakantiedagen (totaal & opgenomen)
- Actief status

### Urenregistratie
- Werknemer
- Datum
- Aantal uren
- Opmerking

### Afwezigheid
- Werknemer
- Start- en einddatum
- Type (Vakantie, Ziek, etc.)
- Goedgekeurd status
- Opmerking

## 🚨 Troubleshooting

### Database errors
Als je database errors krijgt, voer dan uit:
```bash
npx prisma migrate reset
npx prisma generate
```

### Port already in use
Als poort 3000 al in gebruik is:
```bash
npm run dev -- -p 3001
```

## 📞 Support

Voor vragen of problemen, neem contact op met de ontwikkelaar.

## 📄 Licentie

Deze applicatie is ontwikkeld voor intern gebruik.

---

**Veel succes met het gebruik van de applicatie! 🎉**
