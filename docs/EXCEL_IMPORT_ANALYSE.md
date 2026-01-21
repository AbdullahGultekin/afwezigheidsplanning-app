# Excel Import Analyse - Data Folder Bestanden

## Geanalyseerde Bestanden

### 1. Kilometer2025.xlsx ✅
- **Format**: Maandoverzicht grid
- **Header Row**: Row 5 (index 5)
- **Headers**: "Naam werknemer", "Begin Km maand", "Eind Km maand", "Nummerplaat", "1"-"31", "Totaal aantal km", etc.
- **Status**: ✅ Correct gedetecteerd door import code
- **Import Type**: `kilometers`

### 2. Werknemersafwezigheidsplanning2025.xlsx ✅
- **Format**: Maandoverzicht grid
- **Header Row**: Row 5 (index 5)
- **Headers**: "Naam van werknemer", "1"-"31", "Totaal aantal uren"
- **Data**: Cellen bevatten uren (getallen) of afwezigheid codes (V, A, P, Z, S, G)
- **Status**: ✅ Correct gedetecteerd door import code
- **Import Type**: `uren-afwezigheden` of `uren`

### 3. 1. ONTVANGSTEN 2025.xlsx
- **Format**: Standaard tabel format
- **Header Row**: Row 1 (index 1) - in raw data is dit row 1 na skip van eerste lege rij
- **Headers**: "Datum", "Ontvangsten", "Totaal", "6", "12", "21" (BTW percentages)
- **Datum Format**: Excel serial date numbers (45658, 45659, etc.)
- **Status**: ⚠️ Moet gecontroleerd worden - heeft speciale datum format
- **Import Type**: `dagontvangsten`

### 4. Gratis cola 2025.xlsx
- **Format**: Complex grid format met Excel serial dates
- **Structuur**: Excel serial dates in kolommen, gevolgd door "Gratis", "Verkocht" waarden (beide 0)
- **Status**: ⚠️ Complex format, moet geanalyseerd worden
- **Import Type**: `gratis-cola`

## Aanbevelingen

1. **Kilometer2025.xlsx** en **Werknemersafwezigheidsplanning2025.xlsx** zouden moeten werken met de huidige import code
2. **1. ONTVANGSTEN 2025.xlsx** heeft Excel serial dates die correct geconverteerd moeten worden
3. **Gratis cola 2025.xlsx** heeft een complex format dat mogelijk aangepast moet worden

## Test Checklist

- [ ] Test Kilometer2025.xlsx import
- [ ] Test Werknemersafwezigheidsplanning2025.xlsx import  
- [ ] Test 1. ONTVANGSTEN 2025.xlsx import (Excel serial dates)
- [ ] Test Gratis cola 2025.xlsx import (complex format)



