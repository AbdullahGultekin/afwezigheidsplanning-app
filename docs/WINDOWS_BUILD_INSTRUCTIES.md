# Windows Build Instructies

## 📋 Voor Ontwikkelaars

Deze guide legt uit hoe je de Windows executable en installer maakt.

---

## Vereisten

1. **Node.js 18+** - Download van https://nodejs.org/
2. **npm** - Komt met Node.js
3. **Windows 10/11** (64-bit)
4. **Minimaal 2 GB vrije schijfruimte**

---

## Stap 1: Project Voorbereiden

```cmd
cd C:\path\to\afwezigheidsplanning\afwezigheidsplanning-app
npm install
```

Dit installeert alle dependencies inclusief electron-builder.

---

## Stap 2: Build Opties

### Optie A: Via Script (Aanbevolen)

1. Open `scripts\build-exe.bat`
2. Kies build type:
   - **1**: Portable (geen installatie)
   - **2**: Installer (NSIS)
   - **3**: Beide

### Optie B: Via Command Line

**Portable versie:**
```cmd
npm run build:electron:win:portable
```

**Installer versie:**
```cmd
npm run build:electron:win:installer
```

**Beide:**
```cmd
npm run build:electron:win
```

---

## Stap 3: Build Output

Na build vind je de bestanden in:
```
afwezigheidsplanning-app\dist\
```

**Portable:**
- `Afwezigheidsplanning App-1.0.0-x64.exe`
- Direct uitvoerbaar, geen installatie

**Installer:**
- `Afwezigheidsplanning App Setup 1.0.0.exe`
- Professionele installer met shortcuts

---

## Build Configuratie

### electron-builder.yml

De configuratie staat in `electron-builder.yml`:

```yaml
appId: com.pitapizza.afwezigheidsplanning
productName: Afwezigheidsplanning App
version: 1.0.0

win:
  target:
    - target: nsis      # Installer
    - target: portable  # Portable
  artifactName: '${productName}-${version}-${arch}.${ext}'
```

### Versie Aanpassen

1. Update `version` in `package.json`
2. Update `version` in `electron-builder.yml`
3. Rebuild

---

## Troubleshooting

### Fout: "electron-builder not found"

**Oplossing:**
```cmd
npm install electron-builder --save-dev
```

### Fout: "NSIS not found"

**Oplossing:**
Electron-builder download NSIS automatisch. Als dit faalt:
1. Download NSIS van https://nsis.sourceforge.io/
2. Installeer
3. Voeg toe aan PATH

### Fout: "Out of memory"

**Oplossing:**
1. Sluit andere applicaties
2. Verhoog Node.js memory:
   ```cmd
   set NODE_OPTIONS=--max-old-space-size=4096
   npm run build:electron:win
   ```

### Build is te groot

**Oplossing:**
1. Controleer `files` in `electron-builder.yml`
2. Zorg dat alleen nodig bestanden worden meegenomen
3. Gebruik `!` om bestanden uit te sluiten

---

## Optimalisaties

### Build Snelheid

1. Gebruik cache:
   ```cmd
   set ELECTRON_CACHE=C:\electron-cache
   ```

2. Skip tests tijdens build:
   ```cmd
   npm run build:electron:win -- --skip-test
   ```

### Bestandsgrootte

1. Gebruik `asar` packing (standaard aan)
2. Exclude onnodige node_modules
3. Gebruik `--compression=maximum`

---

## Code Signing (Optioneel)

Voor productie builds, overweeg code signing:

1. Koop code signing certificate
2. Update `electron-builder.yml`:
   ```yaml
   win:
     certificateFile: path/to/certificate.pfx
     certificatePassword: password
   ```

---

## Distributie

### Portable Versie
- Upload naar cloud storage
- Deel via USB
- Geen installatie nodig

### Installer Versie
- Upload naar website
- Deel via email
- Professionele installatie

---

## Updates

### Auto-Updater (Toekomstig)

Voor automatische updates:
1. Setup update server
2. Configureer `electron-updater`
3. Implementeer update check

---

**Laatste update**: December 2026

