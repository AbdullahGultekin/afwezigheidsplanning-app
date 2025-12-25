# Refactoring Plan: Compacter en Modulair

## Huidige Situatie
- **1 groot HTML bestand**: 146 KB, 2939 regels
- Alle CSS, HTML en JavaScript in 1 bestand
- Veel herhaalde code patterns

## Voorgestelde Structuur (TypeScript + ES6 Modules)

```
app-refactored/
├── index.html              (alleen HTML structuur, ~200 regels)
├── styles/
│   └── main.css            (alle CSS, ~300 regels)
├── src/
│   ├── main.ts             (entry point, ~100 regels)
│   ├── types.ts            (TypeScript types, ~50 regels)
│   ├── utils/
│   │   ├── database.ts     (database helpers, ~100 regels)
│   │   ├── ui.ts           (modal, alerts, etc., ~150 regels)
│   │   └── pdf.ts          (PDF export utilities, ~200 regels)
│   ├── modules/
│   │   ├── werknemers.ts   (~200 regels)
│   │   ├── uren.ts         (~250 regels)
│   │   ├── kilometers.ts   (~250 regels)
│   │   ├── afwezigheden.ts (~200 regels)
│   │   ├── dagontvangsten.ts (~250 regels)
│   │   └── gratiscola.ts   (~200 regels)
│   └── components/
│       ├── table.ts        (herbruikbare tabel component)
│       └── form.ts         (herbruikbare form component)
└── tsconfig.json

TOTAAL: ~2300 regels (vs 2939) = 22% compacter
+ Betere organisatie en onderhoudbaarheid
```

## Voordelen

1. **Code Reuse**: Gemeenschappelijke functies (modals, alerts, tabellen) worden gedeeld
2. **Type Safety**: TypeScript voorkomt runtime errors
3. **Onderhoudbaarheid**: Elke module is zelfstandig en testbaar
4. **Performance**: ES6 modules worden efficiënter geladen
5. **Schaalbaarheid**: Makkelijk nieuwe features toevoegen

## Implementatie Stappen

1. TypeScript setup (tsconfig.json)
2. CSS extractie naar apart bestand
3. Utilities module (database, UI helpers)
4. Feature modules één voor één migreren
5. Components voor herbruikbare UI elementen
6. Build configuratie aanpassen

## Geschatte Tijd
- Setup: 1 uur
- Refactoring: 4-6 uur
- Testing: 2 uur
**Totaal: ~8-9 uur**

## Resultaat
- 20-30% minder code door reuse
- Betere performance
- Makkelijker te onderhouden
- Type-safe code

