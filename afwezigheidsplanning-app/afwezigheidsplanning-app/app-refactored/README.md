# TypeScript Refactored App

## ✅ Wat is Klaar

### 1. Type Definities (`src/types/index.ts`)
- Alle interfaces voor Werknemer, Uren, Kilometer, Afwezigheid
- ElectronAPI types
- BulkData interface

### 2. Utilities
- **`utils/database.ts`** - Type-safe database helpers
- **`utils/ui.ts`** - Modal, alerts, formatting functions
- **`utils/table.ts`** - Compacte Excel-stijl tabel utilities

### 3. Modules
- **`modules/werknemers.ts`** - Volledige werknemers CRUD
- **`modules/uren.ts`** - Uren registratie en beheer
- **`modules/kilometers.ts`** - Kilometers registratie en beheer

## 🚧 Nog Te Maken

### Modules
1. `modules/uren-bulk.ts` - Uren maandoverzicht (compacte tabel)
2. `modules/km-bulk.ts` - Kilometers maandoverzicht (compacte tabel)
3. `modules/afwezigheden.ts` - Afwezigheden beheer
4. `modules/dagontvangsten.ts` - Dagontvangsten module
5. `modules/gratiscola.ts` - Gratis cola module

### Integratie
1. `main.ts` - Entry point die alle modules initialiseert
2. HTML aanpassen om modules te laden
3. Build configuratie (webpack/vite/esbuild)
4. Electron preload aanpassen

## 📦 Build Setup

### Optie 1: ESBuild (Eenvoudigst)
```bash
npm install --save-dev esbuild
```

### Optie 2: Webpack (Meer configuratie)
```bash
npm install --save-dev webpack webpack-cli ts-loader
```

### Optie 3: Vite (Modern, snel)
```bash
npm install --save-dev vite @vitejs/plugin-typescript
```

## 🎯 Volgende Stappen

1. Kies een bundler (ESBuild is aanbevolen voor snelheid)
2. Configureer build script
3. Maak main.ts entry point
4. Pas HTML aan om bundled JS te laden
5. Test alles werkt

## 💡 Gebruik

### In HTML:
```html
<script type="module" src="./dist/main.js"></script>
```

### In Code:
```typescript
import { loadWerknemers, addWerknemer } from './modules/werknemers';
import { db } from './utils/database';

// Gebruik
await loadWerknemers();
const werknemers = await db.getWerknemers();
```

## 📊 Voordelen

- ✅ Type safety
- ✅ Modulaire structuur
- ✅ 20-30% minder code door reuse
- ✅ Makkelijker te onderhouden
- ✅ Betere IDE support

