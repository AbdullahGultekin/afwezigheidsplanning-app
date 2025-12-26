# Windows Installatie & Gebruik Guide

## 📋 Inhoudsopgave

1. [Vereisten](#vereisten)
2. [Installatie Opties](#installatie-opties)
3. [Optie 1: Portable Versie (Aanbevolen)](#optie-1-portable-versie-aanbevolen)
4. [Optie 2: Installer Versie](#optie-2-installer-versie)
5. [Optie 3: Development Mode](#optie-3-development-mode)
6. [Eerste Gebruik](#eerste-gebruik)
7. [Problemen Oplossen](#problemen-oplossen)

---

## Vereisten

### Minimale Systeemvereisten
- **OS**: Windows 10 of hoger (64-bit)
- **RAM**: 4 GB (8 GB aanbevolen)
- **Schijfruimte**: 500 MB vrije ruimte
- **Node.js**: Alleen nodig voor development mode (niet voor portable/installer)

---

## Installatie Opties

Er zijn 3 manieren om de app op Windows te gebruiken:

### 1. **Portable Versie** (Aanbevolen) ⭐
- ✅ Geen installatie nodig
- ✅ Direct uitvoerbaar
- ✅ Geen admin rechten nodig
- ✅ Makkelijk te verplaatsen
- ✅ Geen systeem wijzigingen

### 2. **Installer Versie**
- ✅ Professionele installatie
- ✅ Desktop shortcut
- ✅ Start menu integratie
- ✅ Makkelijke updates
- ⚠️ Admin rechten nodig voor installatie

### 3. **Development Mode**
- ✅ Voor ontwikkelaars
- ✅ Node.js vereist
- ✅ Volledige controle
- ⚠️ Meer technische kennis nodig

---

## Optie 1: Portable Versie (Aanbevolen)

### Stap 1: Download Portable Versie

1. Download het bestand: `Afwezigheidsplanning App-1.0.0-x64.exe`
2. Plaats het bestand in een map (bijv. `C:\Apps\Afwezigheidsplanning\`)

### Stap 2: Eerste Start

1. Dubbelklik op `Afwezigheidsplanning App-1.0.0-x64.exe`
2. Windows kan een waarschuwing tonen (SmartScreen)
3. Klik op "Meer informatie" → "Toch uitvoeren"
4. De app start automatisch

### Stap 3: Desktop Shortcut (Optioneel)

1. Rechtsklik op het .exe bestand
2. Kies "Verzenden naar" → "Bureaublad (snelkoppeling maken)"
3. Optioneel: Hernoem de shortcut naar "Afwezigheidsplanning"

### Voordelen Portable Versie
- ✅ Geen installatie nodig
- ✅ Werkt vanaf USB stick
- ✅ Geen systeem wijzigingen
- ✅ Makkelijk te verwijderen (verwijder gewoon het bestand)

---

## Optie 2: Installer Versie

### Stap 1: Download Installer

1. Download het bestand: `Afwezigheidsplanning App Setup 1.0.0.exe`
2. Sla het op in een map (bijv. Downloads)

### Stap 2: Installatie

1. Dubbelklik op `Afwezigheidsplanning App Setup 1.0.0.exe`
2. Windows kan een waarschuwing tonen (SmartScreen)
3. Klik op "Meer informatie" → "Toch uitvoeren"
4. Installatie wizard opent:
   - Kies installatie locatie (standaard: `C:\Program Files\Afwezigheidsplanning App\`)
   - Kies opties:
     - ✅ Desktop shortcut maken
     - ✅ Start menu shortcut maken
   - Klik "Installeren"
5. Wacht tot installatie voltooid is
6. Klik "Voltooien"

### Stap 3: App Starten

1. Zoek "Afwezigheidsplanning App" in Start menu
2. Of dubbelklik op desktop shortcut
3. App start automatisch

### Deïnstalleren

1. Ga naar: Instellingen → Apps → Apps en onderdelen
2. Zoek "Afwezigheidsplanning App"
3. Klik "Verwijderen"
4. Bevestig verwijdering

---

## Optie 3: Development Mode

### Stap 1: Installeer Node.js

1. Download Node.js LTS van: https://nodejs.org/
2. Installeer met standaard opties
3. Herstart computer (aanbevolen)

### Stap 2: Download Project

1. Download of clone het project
2. Pak uit in een map (bijv. `C:\Projects\afwezigheidsplanning\`)

### Stap 3: Installeer Dependencies

1. Open Command Prompt of PowerShell
2. Navigeer naar project map:
   ```cmd
   cd C:\Projects\afwezigheidsplanning\afwezigheidsplanning-app
   ```
3. Installeer dependencies:
   ```cmd
   npm install
   ```

### Stap 4: Start App

**Methode 1: Via Script**
1. Dubbelklik op `scripts\START_APP.bat`
2. App start automatisch

**Methode 2: Via Command Line**
```cmd
cd afwezigheidsplanning-app
npm run start:electron
```

---

## Eerste Gebruik

### Database Locatie

De app slaat automatisch data op in:
```
C:\Users\[JouwNaam]\AppData\Roaming\afwezigheidsplanning-app\database.json
```

Deze map wordt automatisch aangemaakt bij eerste gebruik.

### Data Backups

**Belangrijk**: Maak regelmatig backups van je database!

1. Ga naar: `%APPDATA%\afwezigheidsplanning-app\`
2. Kopieer `database.json`
3. Bewaar op veilige locatie (USB, cloud, etc.)

### Excel Bestanden Importeren

1. Ga naar "Import Excel" in de app
2. Selecteer import type
3. Kies Excel bestand
4. Klik "Importeren"
5. Wacht tot import voltooid is

---

## Problemen Oplossen

### Probleem: "Windows heeft deze app geblokkeerd"

**Oplossing:**
1. Rechtsklik op .exe bestand
2. Kies "Eigenschappen"
3. Onderaan: Vink "Deblokkeren" aan
4. Klik "OK"
5. Probeer opnieuw

### Probleem: App start niet

**Oplossing 1: Controleer Windows Defender**
1. Open Windows Defender
2. Ga naar "Virus- en bedreigingsbeveiliging"
3. Klik "Beveiligingsgeschiedenis"
4. Als app geblokkeerd is: Klik "Toestaan op apparaat"

**Oplossing 2: Controleer Firewall**
1. Open Windows Firewall
2. Controleer of app toegestaan is
3. Zo niet: Voeg toe aan uitzonderingen

**Oplossing 3: Run als Administrator**
1. Rechtsklik op .exe bestand
2. Kies "Als administrator uitvoeren"

### Probleem: "Node.js is niet gevonden" (Development Mode)

**Oplossing:**
1. Installeer Node.js van https://nodejs.org/
2. Herstart computer
3. Open nieuwe Command Prompt
4. Test: `node --version`

### Probleem: App crasht bij start

**Oplossing:**
1. Controleer database bestand:
   - Ga naar: `%APPDATA%\afwezigheidsplanning-app\`
   - Verwijder `database.json` (maak eerst backup!)
   - Start app opnieuw
2. Controleer logs:
   - Open Command Prompt
   - Start app via: `npm run start:electron`
   - Bekijk foutmeldingen

### Probleem: Import werkt niet

**Oplossing:**
1. Controleer Excel bestand formaat (.xlsx of .xls)
2. Controleer kolomnamen in Excel
3. Open DevTools (F12) en bekijk console voor fouten
4. Zie `docs/KILOMETERS_IMPORT_INSTRUCTIES.md` voor details

### Probleem: PDF export werkt niet

**Oplossing:**
1. Controleer of browser pop-ups toegestaan zijn
2. Controleer download locatie
3. Probeer andere browser (als development mode)

---

## Tips & Tricks

### Snelkoppeling Maken

**Portable Versie:**
1. Rechtsklik op .exe → "Verzenden naar" → "Bureaublad"

**Installer Versie:**
- Automatisch aangemaakt tijdens installatie

### App Starten bij Windows Opstarten

1. Win + R → `shell:startup`
2. Maak shortcut naar app in deze map
3. App start nu automatisch bij opstarten

### Data Backups Automatiseren

1. Maak batch script:
   ```batch
   @echo off
   copy "%APPDATA%\afwezigheidsplanning-app\database.json" "D:\Backups\database_%date%.json"
   ```
2. Plan in Windows Task Scheduler

### Performance Optimalisatie

- Sluit andere zware applicaties
- Zorg voor voldoende RAM (8 GB aanbevolen)
- Plaats app op SSD voor snellere laadtijden

---

## Support

Voor problemen of vragen:
1. Bekijk `docs/` map voor gedetailleerde documentatie
2. Controleer console logs (F12 in development mode)
3. Maak backup van database voor troubleshooting

---

## Veiligheid

### Data Beveiliging
- Database wordt lokaal opgeslagen
- Geen internet verbinding nodig
- Geen data wordt verzonden naar externe servers

### Updates
- Controleer regelmatig op nieuwe versies
- Maak altijd backup voor update
- Download updates alleen van vertrouwde bron

---

**Laatste update**: December 2026

