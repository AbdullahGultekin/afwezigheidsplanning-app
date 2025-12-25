# Windows Installatie Handleiding

Complete installatiehandleiding voor de Afwezigheidsplanning App op Windows PC.

## 📋 Vereisten

### 1. Node.js Installeren

1. **Download Node.js**
   - Ga naar: https://nodejs.org/
   - Download de **LTS (Long Term Support)** versie (bijv. Node.js 20.x of hoger)
   - Kies de **Windows Installer (.msi)** voor 64-bit

2. **Installeer Node.js**
   - Dubbelklik op het gedownloade `.msi` bestand
   - Volg de installatiewizard
   - ✅ Vink "Automatically install the necessary tools" aan (optioneel, maar aanbevolen)
   - Klik op "Install"
   - Wacht tot de installatie klaar is

3. **Verifieer Installatie**
   - Open **PowerShell** of **Command Prompt**
   - Typ: `node --version`
   - Je zou iets moeten zien zoals: `v20.x.x`
   - Typ: `npm --version`
   - Je zou iets moeten zien zoals: `10.x.x`

## 🚀 Installatie Stappen

### Stap 1: Open PowerShell in de Projectmap

1. Navigeer naar de projectmap:
   ```
   cd "C:\Users\abdul\Cursor projects\afwezigheidsplanning-app\afwezigheidsplanning-app"
   ```

   **Of via Windows Verkenner:**
   - Open Windows Verkenner
   - Ga naar: `C:\Users\abdul\Cursor projects\afwezigheidsplanning-app\afwezigheidsplanning-app`
   - Klik met rechts op de map
   - Selecteer "Open in Terminal" of "Open PowerShell window here"

### Stap 2: Installeer Dependencies

In PowerShell, voer uit:

```powershell
npm install
```

Dit kan enkele minuten duren. Je ziet een progress indicator.

### Stap 3: Database Setup

1. **Maak een .env bestand** (als deze nog niet bestaat)
   
   Maak een nieuw bestand genaamd `.env` in de `afwezigheidsplanning-app` map met de volgende inhoud:

   ```
   DATABASE_URL="file:./prisma/dev.db"
   ```

   **Hoe maak je een .env bestand:**
   - Open Kladblok (Notepad)
   - Plak de regel hierboven
   - Sla op als: `.env` (zonder .txt extensie!)
   - Kies "Alle bestanden" bij "Opslaan als type"
   - Sla op in: `C:\Users\abdul\Cursor projects\afwezigheidsplanning-app\afwezigheidsplanning-app`

2. **Initialiseer de Database**

   In PowerShell, voer uit:

   ```powershell
   npx prisma migrate dev --name init
   ```

   Als dit de eerste keer is, wordt de database aangemaakt.

3. **Genereer Prisma Client**

   ```powershell
   npx prisma generate
   ```

### Stap 4: Start de Applicatie

In PowerShell, voer uit:

```powershell
npm run dev
```

Je zou moeten zien:
```
  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
```

## 🌐 Gebruik

1. **Open je browser** (Chrome, Edge, Firefox, etc.)
2. **Ga naar:** http://localhost:3000
3. De applicatie zou nu moeten werken!

## 🛑 Applicatie Stoppen

In PowerShell, druk op: `Ctrl + C`

## 📦 Productie Build (Optioneel)

Als je de applicatie wilt bouwen voor productie:

```powershell
npm run build
npm run start
```

## 🔧 Troubleshooting

### Probleem: "npm is niet herkend"

**Oplossing:**
- Herstart PowerShell/Command Prompt
- Of herstart je computer na Node.js installatie
- Controleer of Node.js correct is geïnstalleerd: `node --version`

### Probleem: "Port 3000 is al in gebruik"

**Oplossing:**
Start op een andere poort:

```powershell
npm run dev -- -p 3001
```

En ga dan naar: http://localhost:3001

### Probleem: Database errors

**Oplossing:**

```powershell
npx prisma migrate reset
npx prisma generate
npm run dev
```

**Let op:** Dit verwijdert alle bestaande data!

### Probleem: "Cannot find module"

**Oplossing:**

```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Probleem: PowerShell Execution Policy

Als je een foutmelding krijgt over execution policy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 💾 Database Backup

De database staat in:
```
afwezigheidsplanning-app\prisma\dev.db
```

**Backup maken:**
- Kopieer het `dev.db` bestand naar een veilige locatie
- Bijvoorbeeld: `C:\Backups\afwezigheidsplanning-dev.db`

**Backup herstellen:**
- Stop de applicatie (Ctrl + C)
- Vervang `dev.db` met je backup bestand
- Start de applicatie opnieuw

## 🎯 Snelstart Commando's

```powershell
# Ga naar projectmap
cd "C:\Users\abdul\Cursor projects\afwezigheidsplanning-app\afwezigheidsplanning-app"

# Start applicatie
npm run dev

# Stop applicatie
# Druk op Ctrl + C
```

## 📝 Belangrijke Bestanden

- **Database:** `prisma/dev.db`
- **Configuratie:** `.env`
- **Package config:** `package.json`

## ✅ Installatie Checklist

- [ ] Node.js geïnstalleerd (`node --version` werkt)
- [ ] npm werkt (`npm --version` werkt)
- [ ] Dependencies geïnstalleerd (`npm install` uitgevoerd)
- [ ] `.env` bestand aangemaakt met `DATABASE_URL`
- [ ] Database geïnitialiseerd (`npx prisma migrate dev`)
- [ ] Prisma Client gegenereerd (`npx prisma generate`)
- [ ] Applicatie start (`npm run dev`)
- [ ] Browser opent http://localhost:3000

## 🆘 Hulp Nodig?

Als je problemen ondervindt:
1. Controleer of alle stappen zijn uitgevoerd
2. Kijk in de Troubleshooting sectie hierboven
3. Controleer de PowerShell output voor foutmeldingen
4. Zorg dat je in de juiste map bent (`afwezigheidsplanning-app`)

---

**Veel succes met de installatie! 🎉**








