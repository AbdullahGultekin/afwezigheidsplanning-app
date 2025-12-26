# Project Reorganisatie

## ✅ Voltooide Reorganisatie

Het project is gereorganiseerd voor een schonere structuur.

### Verwijderde Items
- ❌ `afwezigheidsplanning-app/afwezigheidsplanning-app/` - Dubbele geneste map
- ❌ `afwezigheidsplanning-app/afwezigheidsplanning-app/app-refactored/` - Ongebruikte refactoring code
- ❌ `afwezigheidsplanning-app/prisma/` - Niet meer nodig (gebruiken nu JSON database)
- ❌ `afwezigheidsplanning-app/next-env.d.ts` - Niet meer nodig voor Electron
- ❌ `afwezigheidsplanning-app/dev.db` - Database wordt nu automatisch opgeslagen door Electron
- ❌ `afwezigheidsplanning-app/.next/` - Next.js build output (niet meer nodig)

### Nieuwe Structuur

```
afwezigheidsplanning/
├── README.md                    # Hoofd README
├── .gitignore                   # Git ignore regels
├── docs/                        # 📚 Alle documentatie
│   ├── INSTRUCTIES.md
│   ├── KM_DECLARATIE_SYSTEEM.md
│   ├── MULTI_WERKNEMER_KM_DECLARATIE.md
│   ├── AFWEZIGHEDEN_OVERZICHT.md
│   ├── WERKDAGEN_UPDATE.md
│   ├── KILOMETERS_IMPORT_INSTRUCTIES.md
│   ├── KILOMETERS_TOEGEVOEGD.md
│   ├── SNELHEIDSUPDATE.md
│   ├── GITHUB_SETUP.md
│   ├── WINDOWS_INSTALLATIE.md
│   ├── EXCEL_LANGUAGE_COMPARISON.md
│   ├── REFACTORING_PLAN.md
│   └── REORGANISATIE.md (dit bestand)
├── data/                        # 📊 Excel bestanden
│   ├── Werknemersafwezigheidsplanning2026.xlsm
│   └── Kilometer2026.xlsx
├── scripts/                     # 🔧 Windows scripts
│   ├── START_APP.bat
│   └── build-exe.bat
└── afwezigheidsplanning-app/    # 🚀 Hoofd applicatie
    ├── app-simple/
    │   └── index.html           # Frontend (HTML/CSS/JS)
    ├── electron/
    │   ├── main-simple.js      # Electron main process
    │   ├── preload-simple.js    # Preload script
    │   └── database-simple.js   # Database operations
    ├── package.json
    ├── package-lock.json
    └── electron-builder.yml
```

### Voordelen van Nieuwe Structuur

1. **Schonere Root Directory**
   - Alleen essentiële bestanden in root
   - Duidelijke mappen voor verschillende doeleinden

2. **Georganiseerde Documentatie**
   - Alle documentatie op één plek
   - Makkelijker te vinden en te onderhouden

3. **Gescheiden Data**
   - Excel bestanden in aparte map
   - Scripts in aparte map

4. **Minder Verwarring**
   - Geen dubbele geneste mappen
   - Geen ongebruikte code
   - Duidelijke applicatie structuur

### Database Locatie

De JSON database wordt automatisch opgeslagen door Electron in:
- **macOS**: `~/Library/Application Support/afwezigheidsplanning-app/database.json`
- **Windows**: `%APPDATA%/afwezigheidsplanning-app/database.json`

Dit gebeurt automatisch, geen handmatige actie nodig.

### Volgende Stappen

1. ✅ Project is gereorganiseerd
2. ✅ README is bijgewerkt
3. ✅ .gitignore is bijgewerkt
4. ✅ Structuur is schoon en overzichtelijk

De applicatie werkt precies hetzelfde, alleen de structuur is nu schoner!

