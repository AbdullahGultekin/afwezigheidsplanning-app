# Excel Import Vereisten

Dit document beschrijft hoe Excel bestanden moeten worden opgemaakt voor correcte import in de Afwezigheidsplanning App.

## 📋 Algemene Vereisten

- **Bestandsformaat**: `.xlsx` of `.xls`
- **Eerste sheet**: Alleen het eerste werkblad wordt geïmporteerd
- **Header rij**: De eerste rij moet kolomnamen bevatten
- **Kolomnamen**: Zijn niet hoofdlettergevoelig, maar moeten exact de kolomnamen bevatten zoals hieronder beschreven

---

## 1️⃣ Werknemers Import

### Vereiste Kolommen:
- **Naam** (verplicht) - Naam van de werknemer
- **Email** (optioneel) - Email adres
- **Nummerplaat** (optioneel) - Nummerplaat voor koeriers

### Voorbeeld Excel Structuur:
```
| Naam              | Email                    | Nummerplaat |
|-------------------|--------------------------|-------------|
| Jan Jansen        | jan@example.com          | AB-123-CD   |
| Piet Pietersen    | piet@example.com         |             |
| Klaas Klassens    |                          | XY-789-ZW   |
```

### Geaccepteerde Kolomnaam Variaties:
- **Naam**: `Naam`, `naam`, `NAAM`, `Name`, `name`
- **Email**: `Email`, `email`, `EMAIL`, `E-mail`, `e-mail`
- **Nummerplaat**: `Nummerplaat`, `nummerplaat`, `NUMMERPLAAT`, `Nummer`, `nummer`, `License`, `license`

---

## 2️⃣ Kilometers Import

### Vereiste Kolommen:
- **Werknemer/Naam** (verplicht) - Naam van de werknemer (moet bestaan in database)
- **Datum** (verplicht) - Datum van de rit
- **Kilometers** (verplicht) - Aantal kilometers
- **Van** (optioneel) - Vertrekadres
- **Naar** (optioneel) - Bestemmingsadres
- **Doel** (optioneel) - Doel/reden van de rit

### Voorbeeld Excel Structuur:
```
| Werknemer      | Datum       | Kilometers | Van              | Naar              | Doel        |
|----------------|-------------|------------|------------------|-------------------|-------------|
| Jan Jansen     | 2026-01-15  | 45.5       | Amsterdam        | Utrecht           | Levering   |
| Piet Pietersen | 2026-01-15  | 120        | Rotterdam        | Den Haag          | Klantbezoek|
```

### Geaccepteerde Kolomnaam Variaties:
- **Werknemer**: `Werknemer`, `werknemer`, `Naam`, `naam`, `Name`, `name`, `Employee`, `employee`
- **Datum**: `Datum`, `datum`, `DATUM`, `Date`, `date`, `DATE`
- **Kilometers**: `Kilometers`, `kilometers`, `KILOMETERS`, `KM`, `km`, `Distance`, `distance`, `Afstand`, `afstand`
- **Van**: `Van`, `van`, `From`, `from`, `Van adres`, `van adres`
- **Naar**: `Naar`, `naar`, `To`, `to`, `Naar adres`, `naar adres`
- **Doel**: `Doel`, `doel`, `Purpose`, `purpose`, `Doel/reden`, `doel/reden`

### Datum Formaten:
- ISO formaat: `2026-01-15`
- Excel datum nummer
- Andere standaard datum formaten

---

## 3️⃣ Uren Import

### Vereiste Kolommen:
- **Werknemer/Naam** (verplicht) - Naam van de werknemer
- **Datum** (verplicht) - Datum
- **Uren** (verplicht) - Aantal gewerkte uren
- **Opmerking** (optioneel) - Extra opmerkingen

### Voorbeeld Excel Structuur:
```
| Werknemer      | Datum       | Uren | Opmerking        |
|----------------|-------------|------|------------------|
| Jan Jansen     | 2026-01-15  | 8    | Normale dag      |
| Piet Pietersen | 2026-01-15  | 6    | Middag vrij      |
```

### Geaccepteerde Kolomnaam Variaties:
- **Werknemer**: `Werknemer`, `werknemer`, `Naam`, `naam`, `Name`, `name`, `Employee`, `employee`
- **Datum**: `Datum`, `datum`, `DATUM`, `Date`, `date`, `DATE`
- **Uren**: `Uren`, `uren`, `UREN`, `Hours`, `hours`, `HOURS`, `Uur`, `uur`
- **Opmerking**: `Opmerking`, `opmerking`, `Comment`, `comment`, `Notitie`, `notitie`, `Note`, `note`

---

## 4️⃣ Uren & Afwezigheden Import

### Twee Formaten Mogelijk:

#### Formaat A: Standaard Formaat
Vereiste Kolommen:
- **Werknemer/Naam** (verplicht)
- **Datum** (verplicht)
- **Uren** (optioneel) - Aantal gewerkte uren
- **Type** (optioneel) - Afwezigheid type: `V` (Vakantie), `A` (Aangepast), `S` (School)
- **Opmerking** (optioneel)

#### Formaat B: Maandoverzicht Grid (Werknemersafwezigheidsplanning)
- Eerste kolom: "Naam van werknemer"
- Volgende kolommen: Dag nummers (1, 2, 3, ..., 31)
- Laatste kolom: "Totaal"
- Cellen kunnen bevatten:
  - Getal (uren)
  - Letter: `V` (Vakantie), `A` (Aangepast), `P` (Persoonlijk), `Z` (Ziek), `S` (School)

### Voorbeeld Standaard Formaat:
```
| Werknemer      | Datum       | Uren | Type | Opmerking     |
|----------------|-------------|------|------|---------------|
| Jan Jansen     | 2026-01-15  | 8    |      |               |
| Piet Pietersen | 2026-01-16  |      | V    | Vakantie      |
| Klaas Klassens | 2026-01-17  | 4    |      | Middag vrij   |
```

---

## 5️⃣ Dagontvangsten Import

### Vereiste Kolommen:
- **Datum** (verplicht) - Datum
- **BTW 6%** (optioneel) - Bedrag inclusief 6% BTW
- **BTW 12%** (optioneel) - Bedrag inclusief 12% BTW
- **BTW 21%** (optioneel) - Bedrag inclusief 21% BTW
- **Opmerking** (optioneel) - Extra opmerkingen

### Voorbeeld Excel Structuur:
```
| Datum       | BTW 6%  | BTW 12% | BTW 21% | Opmerking       |
|-------------|---------|---------|---------|-----------------|
| 2026-01-15  | 100.00  | 200.00  | 300.00  | Normale dag     |
| 2026-01-16  | 150.00  |         | 500.00  | Zaterdag        |
```

### Geaccepteerde Kolomnaam Variaties:
- **Datum**: `Datum`, `datum`, `DATUM`, `Date`, `date`, `DATE`
- **BTW 6%**: `BTW 6%`, `btw 6%`, `6%`, `6`
- **BTW 12%**: `BTW 12%`, `btw 12%`, `12%`, `12`
- **BTW 21%**: `BTW 21%`, `btw 21%`, `21%`, `21`
- **Opmerking**: `Opmerking`, `opmerking`, `Comment`, `comment`

---

## 6️⃣ Gratis Cola Import

### Vereiste Kolommen:
- **Datum** (verplicht) - Datum
- **Gratis** (optioneel) - Aantal gratis gegeven
- **Verkocht** (optioneel) - Aantal verkocht

### Voorbeeld Excel Structuur:
```
| Datum       | Gratis | Verkocht |
|-------------|--------|----------|
| 2026-01-15  | 5      | 10       |
| 2026-01-16  | 3      | 15       |
```

### Geaccepteerde Kolomnaam Variaties:
- **Datum**: `Datum`, `datum`, `DATUM`, `Date`, `date`, `DATE`
- **Gratis**: `Gratis`, `gratis`, `GRATIS`
- **Verkocht**: `Verkocht`, `verkocht`, `VERKOCHT`

---

## 🔍 Hoe Je Excel Bestanden Controleert

### Methode 1: Visuele Controle in Excel
1. Open je Excel bestand
2. Controleer of de eerste rij kolomnamen bevat
3. Verifieer dat alle kolomnamen overeenkomen met de verwachte namen (of variaties)
4. Controleer of verplichte kolommen aanwezig zijn
5. Controleer of datum formaten correct zijn
6. Controleer of numerieke waarden (uren, kilometers, bedragen) geldige getallen zijn

### Methode 2: Test Import in de App
1. Start de Afwezigheidsplanning App
2. Ga naar de Import pagina
3. Selecteer je Excel bestand
4. Kies het juiste import type
5. Klik op "Importeren"
6. Als er fouten zijn, worden deze getoond met debug informatie
7. Open DevTools (F12) voor gedetailleerde console logs

### Methode 3: Excel Validatie Checklist

Voor elk import type, controleer:

- [ ] Eerste rij bevat kolomnamen
- [ ] Alle verplichte kolommen zijn aanwezig
- [ ] Kolomnamen komen overeen met verwachte namen (of variaties)
- [ ] Datums zijn in correct formaat
- [ ] Numerieke waarden zijn geldige getallen
- [ ] Geen lege rijen tussen data (alleen lege rijen onderaan zijn OK)
- [ ] Werknemer namen komen overeen met namen in de database (voor kilometers/uren import)

---

## ⚠️ Veel Voorkomende Problemen

1. **"0 items geïmporteerd"**
   - Kolomnamen komen niet overeen → Check kolomnaam spelling en variaties
   - Werknemer namen komen niet overeen → Check of werknemers bestaan in database
   - Datum formaat wordt niet herkend → Gebruik ISO formaat (YYYY-MM-DD)

2. **"Unknown import type"**
   - Selecteer het juiste import type in de dropdown

3. **"Geen data gevonden"**
   - Controleer of er data in de rijen staat (niet alleen headers)
   - Controleer of de data niet leeg is

4. **Datum parse errors**
   - Gebruik ISO datum formaat: `2026-01-15`
   - Of gebruik Excel's standaard datum formaat

---

## 💡 Tips

- **Test eerst met een klein bestand**: Begin met 2-3 rijen om te testen of de import werkt
- **Gebruik consistente kolomnamen**: Kies één variatie en blijf daar bij
- **Backup je data**: Maak een backup voordat je grote imports doet
- **Check console logs**: Open DevTools (F12) voor gedetailleerde informatie over wat er gebeurt tijdens import

---

## 📝 Template Excel Bestanden

Je kunt de bovenstaande voorbeelden gebruiken als templates voor je eigen Excel bestanden. Kopieer de structuur en vervang de voorbeelddata met je eigen data.



