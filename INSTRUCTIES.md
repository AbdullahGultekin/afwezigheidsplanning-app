# 🎉 Afwezigheidsplanning 2026 - Klaar voor Gebruik!

## ✅ Wat is er gebouwd?

Een **professionele webapplicatie** voor urenregistratie en afwezigheidsplanning, speciaal voor gebruik met **Liantis**.

### 📦 Locatie
```
/Users/abdullahgultekin/Documents/afwezigheidsplanning/afwezigheidsplanning-app/
```

## 🚀 De Applicatie Starten

### Optie 1: Automatisch (Momenteel Actief)
De applicatie draait al! Open je browser en ga naar:
```
http://localhost:3001
```

### Optie 2: Handmatig Starten
Als de applicatie niet draait:

1. Open Terminal
2. Voer uit:
```bash
cd /Users/abdullahgultekin/Documents/afwezigheidsplanning/afwezigheidsplanning-app
npm run dev
```
3. Open browser: `http://localhost:3000` (of 3001 als 3000 bezet is)

## 📋 Functionaliteiten

### 1. 📊 Dashboard
- Overzicht van alle statistieken
- Snelle acties
- Totaal uren en afwezigheden

### 2. 👥 Werknemers Beheer
- Werknemers toevoegen/bewerken/verwijderen
- Vakantiedagen beheren
- Actief/Inactief status

**Huidige werknemers uit je Excel:**
- Biragoye Isaac
- Cinar Rafet
- Cygora Lukasz Jan
- El Karmoudi Taufik
- El Maazouzi Abdelilah
- Gultekin Muhammed A
- Gultekin Muhammed E
- Irakoze Patrick
- Kacar Abdullah
- Kefes Levent
- Moualdine Ali

### 3. ⏰ Urenregistratie
- Kalenderweergave per maand
- Klik op een dag om uren te registreren
- Automatische totalen
- Weekendherkenning

### 4. 📅 Afwezigheden
- Vakantiedagen plannen
- Ziekte registreren
- Automatische vakantiedagen calculator
- Types: Vakantie (V), Ziek (Z), Persoonlijk (P)

### 5. 📤 Export naar Liantis
- Selecteer maand
- Download Excel bestand
- Klaar voor upload naar Liantis portaal
- Correcte formatting voor sociaal secretariaat

### 6. 📥 Import Excel
- Upload je bestaande Excel bestand
- Automatische import van:
  - Werknemers
  - Uren
  - Afwezigheden

## 🎯 Eerste Stappen

### Stap 1: Import Je Bestaande Data (Aanbevolen)
1. Ga naar **Import** in het menu
2. Upload je bestaande Excel bestand:
   ```
   Werknemersafwezigheidsplanning2026.xlsm
   ```
3. Klik op **Importeer Data**
4. Alle werknemers en data worden automatisch geïmporteerd!

### Stap 2: Of Handmatig Beginnen
1. Ga naar **Werknemers**
2. Klik **Nieuwe Werknemer Toevoegen**
3. Vul gegevens in

### Stap 3: Uren Registreren
1. Ga naar **Urenregistratie**
2. Selecteer werknemer
3. Klik op een dag in kalender
4. Voer uren in

### Stap 4: Afwezigheden Plannen
1. Ga naar **Afwezigheden**
2. Selecteer werknemer
3. Klik **Nieuwe Afwezigheid Toevoegen**
4. Kies data en type

### Stap 5: Exporteren voor Liantis
1. Ga naar **Export**
2. Selecteer maand
3. Download Excel bestand
4. Upload naar Liantis

## 💾 Data Opslag

Alle data wordt lokaal opgeslagen in:
```
/Users/abdullahgultekin/Documents/afwezigheidsplanning/afwezigheidsplanning-app/prisma/dev.db
```

### Backup Maken
Kopieer simpelweg het `dev.db` bestand naar een veilige locatie.

## 🎨 Voordelen t.o.v. Excel

✅ **Moderne Interface** - Mooie, gebruiksvriendelijke interface
✅ **Automatische Berekeningen** - Totalen worden automatisch berekend
✅ **Vakantiedagen Tracking** - Automatisch bijhouden van vakantiedagen
✅ **Kalenderweergave** - Overzichtelijke maand kalender
✅ **Sneller** - Geen zoeken in Excel sheets
✅ **Veiliger** - Database backup mogelijk
✅ **Liantis Ready** - Directe export naar correct formaat
✅ **Multi-device** - Werkt op computer, tablet, telefoon

## 🔧 Technische Details

- **Frontend**: Next.js 16, React, TypeScript
- **Styling**: Tailwind CSS (modern design)
- **Database**: SQLite (lokaal, geen server nodig)
- **Icons**: Lucide React
- **Excel**: XLSX library voor import/export

## 📱 Toegang

De applicatie is toegankelijk via:
- **Computer**: http://localhost:3001
- **Andere apparaten op zelfde netwerk**: http://192.168.1.20:3001

## 🆘 Problemen Oplossen

### Applicatie start niet
```bash
cd /Users/abdullahgultekin/Documents/afwezigheidsplanning/afwezigheidsplanning-app
rm -rf .next
npm run dev
```

### Database errors
```bash
cd /Users/abdullahgultekin/Documents/afwezigheidsplanning/afwezigheidsplanning-app
npx prisma migrate reset
npx prisma generate
```

### Port bezet
De applicatie kiest automatisch een andere poort (3001, 3002, etc.)

## 📞 Tips

1. **Maak regelmatig backups** van je database bestand
2. **Exporteer maandelijks** naar Liantis aan het einde van de maand
3. **Controleer data** voordat je exporteert
4. **Gebruik Import** om je bestaande Excel data over te zetten
5. **Bewaar exports** voor je eigen administratie

## 🎊 Klaar!

Je professionele urenregistratie & afwezigheidsplanning applicatie is klaar voor gebruik!

**Open nu:** http://localhost:3001

---

**Veel succes! 🚀**

