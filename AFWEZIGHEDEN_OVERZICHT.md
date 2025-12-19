# Afwezigheden & Vakantie Maandoverzicht

## 🎯 Nieuwe Functionaliteit: Excel-achtige Maandoverzicht

Je hebt nu een **volledig maandoverzicht** voor afwezigheden en vakantie, net zoals in Excel! Direct zien welke werknemers beschikbaar zijn om te werken.

## ✨ Wat kun je zien?

### 📊 Maandkalender Tabel
Een grote tabel met:
- **Rijen**: Alle werknemers
- **Kolommen**: Alle dagen van de maand (1-31)
- **Cellen**: Status per werknemer per dag

### 🎨 Visuele Indicatoren

#### Beschikbaar ✓
```
Groene ✓ in groene border = Werknemer is beschikbaar om te werken
```

#### Afwezigheid Types (gekleurde letters)
- **V** (Groen) = **V**akantie
- **Z** (Rood) = **Z**iek
- **P** (Blauw) = **P**ersoonlijk
- **A1** (Paars) = **A**angepast 1
- **A2** (Oranje) = **A**angepast 2
- **W** (Grijs) = **W**eekend

#### Beschikbaar Rij (onderaan)
```
Groen getal  = Veel werknemers beschikbaar (✓)
Oranje getal = Weinig werknemers beschikbaar (!)
Rood getal   = Geen werknemers beschikbaar (!!)
```

## 📍 Hoe te gebruiken?

### Stap 1: Open Maandoverzicht
```
1. Ga naar: Afwezigheden pagina
2. Klik op: "Maandoverzicht" knop (rechtsboven)
   OF
   Ga direct naar: http://localhost:3000/afwezigheden/bulk
```

### Stap 2: Selecteer Maand
```
3. Gebruik "Vorige" / "Volgende" knoppen
4. Of selecteer een specifieke maand
```

### Stap 3: Bekijk Overzicht
```
5. Zie direct:
   - Wie is afwezig per dag
   - Waarom zijn ze afwezig (V/Z/P)
   - Wie is beschikbaar (groene ✓)
   - Hoeveel mensen beschikbaar zijn per dag
```

## 🎯 Praktische Voorbeelden

### Voorbeeld 1: Planning Maken
```
Vraag: "Kunnen we met 5 mensen werken op 15 december?"

Kijk naar:
- Kolom "15" in de tabel
- Bekijk de groene ✓ (beschikbaar)
- Check onderste rij: "BESCHIKBAAR" toont aantal

Resultaat: Direct antwoord!
```

### Voorbeeld 2: Kritieke Dagen Vinden
```
Zoek naar:
- Rode getallen in "BESCHIKBAAR" rij
- Dit zijn dagen waar NIEMAND beschikbaar is

Actie: Plan afwezigheden anders!
```

### Voorbeeld 3: Werknemer Beschikbaarheid
```
Vraag: "Is Jan beschikbaar deze week?"

Kijk naar:
- Jan's rij in de tabel
- Groene ✓ = Ja, beschikbaar
- Gekleurde letter = Nee, afwezig

Hover over letter voor details!
```

## 📊 Statistieken (onderaan pagina)

### 4 Info Cards:

1. **Totaal Werknemers**
   - Hoeveel werknemers zijn er in totaal

2. **Gemiddeld Beschikbaar**
   - Gemiddeld aantal beschikbare werknemers per werkdag

3. **Totaal Afwezigheden**
   - Aantal afwezigheidsregistraties deze maand

4. **Werkdagen**
   - Aantal werkdagen in de maand (excl. weekends)

## 🎨 Kleurcodering Uitleg

### In de Tabel:

| Symbool/Kleur | Betekenis |
|---------------|-----------|
| ✓ in groene border | Beschikbaar om te werken |
| V in groene box | Vakantie |
| Z in rode box | Ziek |
| P in blauwe box | Persoonlijk verlof |
| A1 in paarse box | Aangepaste afwezigheid 1 |
| A2 in oranje box | Aangepaste afwezigheid 2 |
| W in grijze box | Weekend |

### Beschikbaar Rij (onderaan):

| Kleur | Betekenis |
|-------|-----------|
| Groen | Veel mensen beschikbaar (> 50%) |
| Oranje | Weinig mensen beschikbaar (< 50%) |
| Rood | Niemand beschikbaar (0) |

## 🔍 Extra Features

### 1. Hover voor Details
```
Hover met muis over een afwezigheid letter:
→ Tooltip toont volledige type + opmerking
```

### 2. Legenda
```
Bovenaan pagina staat legenda:
→ Uitleg van alle symbolen en kleuren
```

### 3. Responsive Design
```
Tabel scrollt horizontaal op kleinere schermen
Werknemer namen blijven zichtbaar (sticky kolom)
```

### 4. Weekend Markering
```
Weekend dagen (za/zo) zijn grijs gemarkeerd
Tellen niet mee voor "Beschikbaar" telling
```

## 📋 Kolommen in de Tabel

### Vaste Kolommen:

1. **Werknemer** (links, sticky)
   - Naam van werknemer

2. **Dag 1 t/m 31** (midden)
   - Status per dag

3. **Afwezig** (rechts)
   - Totaal aantal afwezige dagen deze maand

4. **Beschikbaar** (rechts, groen)
   - Totaal aantal beschikbare werkdagen

### Speciale Rij (onderaan):

**BESCHIKBAAR**
- Toont per dag hoeveel werknemers beschikbaar zijn
- Kleurt automatisch (groen/oranje/rood)

## 🚀 Voordelen

### Voor Planning:
✅ **Direct overzicht** wie kan werken
✅ **Snelle beslissingen** over planning
✅ **Spot problemen** (te weinig mensen)
✅ **Geen Excel switching** meer nodig

### Voor Beheer:
✅ **Complete maandview** in één scherm
✅ **Visuele feedback** met kleuren
✅ **Statistieken** onderaan
✅ **Print-vriendelijk** formaat

### Voor Communicatie:
✅ **Deel scherm** in meetings
✅ **Duidelijke legenda** voor iedereen
✅ **Hover tooltips** voor details

## 🎯 Use Cases

### Use Case 1: Wekelijkse Planning
```
Elke maandag:
1. Open maandoverzicht
2. Bekijk huidige week
3. Check groene ✓ per dag
4. Plan werk in voor beschikbare mensen
```

### Use Case 2: Vakantie Goedkeuring
```
Werknemer vraagt vakantie:
1. Open maandoverzicht
2. Ga naar gevraagde dagen
3. Check "BESCHIKBAAR" rij
4. Besluit: Genoeg mensen over? → Goedkeuren
```

### Use Case 3: Maandrapportage
```
Einde maand:
1. Open maandoverzicht
2. Bekijk statistieken onderaan
3. Screenshot maken
4. Toevoegen aan rapport
```

## 📱 Toegang

### URL's:
- **Direct**: http://localhost:3000/afwezigheden/bulk
- **Via menu**: Afwezigheden → "Maandoverzicht" knop

### Navigatie:
```
Afwezigheden pagina (individueel) ←→ Maandoverzicht (bulk)
                                     ↑
                         [Maandoverzicht] knop
```

## 💡 Tips

### Tip 1: Start van de Maand
Begin elke maand met maandoverzicht bekijken
→ Spot direct probleemdagen

### Tip 2: Print/Screenshot
Maak screenshot voor meetings
→ Deel met team voor planning

### Tip 3: Kleurblind-vriendelijk
Naast kleuren zijn er ook:
- Letters (V, Z, P)
- Symbolen (✓, W)
- Getallen

### Tip 4: Mobiel Gebruik
Werkt ook op tablet/mobiel
→ Scroll horizontaal door maand

## ⚙️ Technische Details

### API Gebruikt:
- `/api/werknemers` - Haal werknemers op
- `/api/afwezigheden` - Haal afwezigheden op met datumfilters

### Data Refresh:
- Automatisch bij maandwisseling
- Herlaad pagina voor nieuwe data

### Performance:
- Snel laden (alleen actieve werknemers)
- Client-side berekeningen
- Geen database updates vanuit deze pagina

## 🎉 Samenvatting

Je hebt nu een **professioneel maandoverzicht** voor afwezigheden:

✅ **Excel-achtige tabel** met alle werknemers
✅ **Visuele indicatoren** (kleuren & symbolen)
✅ **Direct zien wie beschikbaar is**
✅ **Statistieken** voor rapportage
✅ **Legenda** voor duidelijkheid
✅ **Responsive** design

**Perfect voor dagelijkse planning en beslissingen!** 📅✨

---

## 🔗 Gerelateerde Pagina's

- **Afwezigheden (individueel)**: `/afwezigheden`
- **Uren Bulk**: `/uren/bulk`
- **Kilometers Bulk**: `/kilometers/bulk`
- **KM Declaratie**: `/km-declaratie`

