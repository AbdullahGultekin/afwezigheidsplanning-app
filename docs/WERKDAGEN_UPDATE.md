# Werkdagen & Direct Bewerken Update

## 🎯 Belangrijke Wijzigingen

### ✅ Nieuwe Werkdag Logica

#### 1. **Maandag = Gesloten** 🚫
- Maandagen zijn nu **gesloten** (geen werkdag)
- Gemarkeerd met **grijze "M"** in de tabel
- Tellen niet mee voor beschikbaarheid
- Kunnen niet bewerkt worden (geen afwezigheden toevoegen)

#### 2. **Weekenden = Werkdagen** ✅
- Zaterdag en zondag zijn nu **normale werkdagen**
- Werknemers kunnen werken in het weekend
- Tellen mee voor beschikbaarheid
- Kunnen afwezigheden hebben

#### 3. **Feestdagen = Open** 🎉
- Nederlandse feestdagen zijn **open** (werkdagen)
- Gemarkeerd met **gele "F"** in de tabel
- Automatisch gedetecteerd:
  - Nieuwjaarsdag (1 januari)
  - Koningsdag (27 april)
  - Bevrijdingsdag (5 mei)
  - Pasen (zondag + maandag)
  - Hemelvaart
  - Pinksteren (zondag + maandag)
  - Eerste & Tweede Kerstdag

## 🖱️ Direct Bewerken in Tabel

### Nieuwe Functionaliteit: Klik om te Bewerken!

#### **Beschikbare Cel (Groen ✓)**
```
Klik op groene ✓ cel
→ Opent formulier
→ Voeg nieuwe afwezigheid toe
→ Selecteer type, datum, opmerking
→ Klik "Opslaan"
```

#### **Afwezigheid Cel (Gekleurde Letter)**
```
Klik op gekleurde letter (V/Z/P)
→ Opent formulier met bestaande data
→ Bewerk type, datum, opmerking
→ Klik "Opslaan" of "Verwijderen"
```

### Formulier Features:
- ✅ **Werknemer**: Automatisch ingevuld (niet wijzigbaar)
- ✅ **Type**: Dropdown (Vakantie, Ziek, Persoonlijk, etc.)
- ✅ **Start Datum**: Automatisch ingevuld (klikte dag)
- ✅ **Eind Datum**: Automatisch ingevuld (kan aangepast worden)
- ✅ **Opmerking**: Optioneel veld
- ✅ **Verwijderen**: Knop om afwezigheid te verwijderen

## 🎨 Visuele Updates

### Nieuwe Markeringen:

| Symbool | Betekenis | Kleur |
|---------|-----------|-------|
| **M** | Maandag (Gesloten) | Grijs |
| **F** | Feestdag (Open) | Geel |
| **✓** | Beschikbaar | Groen border |
| **V** | Vakantie | Groen |
| **Z** | Ziek | Rood |
| **P** | Persoonlijk | Blauw |

### Tabel Headers:
- **Maandag kolommen**: Grijs achtergrond
- **Feestdag kolommen**: Geel achtergrond
- **Andere dagen**: Wit achtergrond

## 📊 Berekeningen Update

### Beschikbaarheid:
```
Werkdag = Alle dagen BEHALVE maandag
Feestdagen = Werkdagen (open)
Weekenden = Werkdagen (open)

Beschikbaar = Werkdag EN geen afwezigheid
```

### Statistieken:
- **Werkdagen**: Telt alle dagen behalve maandagen
- **Afwezig**: Telt alleen werkdagen met afwezigheid
- **Beschikbaar**: Telt alleen werkdagen zonder afwezigheid

## 🖱️ Gebruik

### Stap 1: Open Maandoverzicht
```
http://localhost:3000/afwezigheden/bulk
```

### Stap 2: Klik op Cel
```
Klik op:
- Groene ✓ = Nieuwe afwezigheid toevoegen
- Gekleurde letter = Bestaande afwezigheid bewerken
- Grijze M = Kan niet (maandag gesloten)
```

### Stap 3: Vul Formulier In
```
1. Type selecteren (Vakantie/Ziek/etc.)
2. Datums aanpassen indien nodig
3. Opmerking toevoegen (optioneel)
4. Klik "Opslaan"
```

### Stap 4: Verwijderen (optioneel)
```
Bij bewerken van bestaande afwezigheid:
→ Klik "Verwijderen" knop
→ Bevestig verwijdering
```

## 🎯 Praktische Voorbeelden

### Voorbeeld 1: Vakantie Toevoegen
```
1. Klik op groene ✓ bij werknemer "Jan" op 15 december
2. Selecteer "Vakantie" in dropdown
3. Start datum: 15-12-2026
4. Eind datum: 22-12-2026 (of pas aan)
5. Opmerking: "Kerstvakantie"
6. Klik "Opslaan"
→ Jan is nu afwezig van 15-22 december
```

### Voorbeeld 2: Ziekte Bewerken
```
1. Klik op rode "Z" bij werknemer "Piet" op 10 december
2. Formulier opent met bestaande data
3. Wijzig eind datum naar 12 december
4. Klik "Opslaan"
→ Piet is nu ziek tot 12 december
```

### Voorbeeld 3: Afwezigheid Verwijderen
```
1. Klik op gekleurde letter
2. Klik "Verwijderen" knop
3. Bevestig verwijdering
→ Afwezigheid is verwijderd
```

## 📅 Feestdagen Detectie

### Automatisch Gedetecteerd:
- **2024**: Pasen 31 maart, Pinksteren 19 mei
- **2025**: Pasen 20 april, Pinksteren 8 juni
- **2026**: Pasen 5 april, Pinksteren 24 mei
- **2027**: Pasen 28 maart, Pinksteren 16 mei

### Vaste Feestdagen (elk jaar):
- Nieuwjaarsdag: 1 januari
- Koningsdag: 27 april
- Bevrijdingsdag: 5 mei
- Eerste Kerstdag: 25 december
- Tweede Kerstdag: 26 december

## ⚠️ Belangrijk

### Maandag = Gesloten
- ❌ Geen afwezigheden toevoegen op maandag
- ❌ Telt niet mee voor beschikbaarheid
- ❌ Grijs gemarkeerd in tabel

### Feestdagen = Open
- ✅ Feestdagen zijn werkdagen
- ✅ Kunnen afwezigheden hebben
- ✅ Geel gemarkeerd in tabel

### Weekenden = Werkdagen
- ✅ Zaterdag en zondag zijn werkdagen
- ✅ Kunnen afwezigheden hebben
- ✅ Normale witte achtergrond

## 🚀 Voordelen

### Voor Planning:
✅ **Direct bewerken** zonder pagina wisselen
✅ **Snelle updates** met één klik
✅ **Correcte werkdagen** (maandag gesloten, feestdagen open)
✅ **Weekend planning** mogelijk

### Voor Gebruik:
✅ **Intuïtieve interface** (klik om te bewerken)
✅ **Visuele feedback** (kleuren en symbolen)
✅ **Snelle workflow** (geen formulier navigatie)
✅ **Foutpreventie** (maandag niet bewerkbaar)

## 🎉 Samenvatting

### Wat is Nieuw:
1. ✅ **Maandag = Gesloten** (grijs M)
2. ✅ **Weekenden = Werkdagen** (normale dagen)
3. ✅ **Feestdagen = Open** (geel F)
4. ✅ **Direct bewerken** (klik op cel)
5. ✅ **Inline formulier** (geen pagina wisselen)
6. ✅ **Verwijderen** mogelijk vanuit tabel

### Werkdag Logica:
```
Werkdag = Alle dagen BEHALVE maandag
Feestdagen = Werkdagen (open)
Weekenden = Werkdagen (open)
Maandag = Gesloten (geen werk)
```

**Perfect voor jouw bedrijfsvoering!** 📅✨

