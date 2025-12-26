# 🚗 Kilometers Import - Klaar!

## ✅ Kilometers Import Functionaliteit Toegevoegd!

Je kunt nu **Kilometer2026.xlsx** importeren in de applicatie!

---

## 📋 Stap 1: Voorbereiding

### Kopieer je kilometers Excel bestand naar:
```
/Users/abdullahgultekin/Documents/afwezigheidsplanning/
```

**Bestandsnaam:** Kilometer2026.xlsx

---

## 🚀 Stap 2: Importeren

### Methode 1: Via Import Pagina (Aanbevolen)

1. **Open de applicatie:**
   ```
   http://localhost:3000
   ```

2. **Ga naar Import:**
   - Klik op "Import" in het menu

3. **Klik op de Kilometers Import kaart:**
   - Zie je twee opties: "Kilometers Import" en "Algemene Import"
   - Klik op "Kilometers Import"

4. **Upload het bestand:**
   - Klik op "Upload Kilometer2026.xlsx"
   - Of sleep het bestand naar het upload vak

5. **Klik "Importeer Kilometers"**

6. **Wacht op bevestiging:**
   - Je ziet hoeveel kilometers zijn geïmporteerd
   - Je ziet hoeveel nieuwe werknemers zijn aangemaakt

7. **Klaar!** 
   - Klik op "Ga naar Kilometers pagina"
   - Controleer of alle data correct is

### Methode 2: Directe Kilometers Import

**Ga direct naar:**
```
http://localhost:3000/import-kilometers
```

Dan dezelfde stappen als hierboven!

---

## 📊 Wat Wordt Geïmporteerd?

De import leest:
- ✅ **Werknemersnamen** - Uit de eerste kolom
- ✅ **Maanden** - Uit de werkbladnamen (Januari, Februari, etc.)
- ✅ **Kilometers per dag** - Numerieke waarden in de cellen
- ✅ **Jaar 2026** - Automatisch toegepast

### Excel Structuur:
```
Werkblad: Januari
---------------------------------
Naam werknemer | 1  | 2  | 3  | ...
Jan Jansen     | 25 | 30 | 15 | ...
Piet Pietersen | 40 | 0  | 20 | ...
```

---

## 🔄 Wat Gebeurt Er?

1. **Werknemers Herkennen:**
   - Bestaande werknemers worden automatisch herkend
   - Nieuwe werknemers worden aangemaakt

2. **Kilometers Toewijzen:**
   - Elke numerieke waarde = kilometers voor die dag
   - Datum = Jaar 2026 + Maand (van werkblad) + Dag (van kolom)

3. **Dubbele Check:**
   - Als er al kilometers zijn voor die dag → worden overschreven
   - Zo kun je correcties maken door opnieuw te importeren!

---

## ✅ Na Importeren

### Controleer de Data:

1. **Ga naar Kilometers pagina:**
   ```
   http://localhost:3000/kilometers
   ```

2. **Selecteer een werknemer**

3. **Check de maanden:**
   - Gebruik de "Vorige/Volgende" knoppen
   - Zie je alle kilometers?

4. **Bekijk totalen:**
   - Totaal km deze maand wordt automatisch berekend

---

## 📤 Export Testen

Test of de export ook werkt:

1. **Ga naar Export:**
   ```
   http://localhost:3000/export
   ```

2. **Selecteer een maand** (bijv. Januari 2026)

3. **Download Excel bestand**

4. **Open het bestand:**
   - Werkblad "Uren" → Alle uren
   - Werkblad "Kilometers" → Alle kilometers! 🎉

---

## 🛠️ Troubleshooting

### Probleem: "Geen werknemers gevonden"
**Oplossing:** 
- Check of de eerste kolom werknemersnamen bevat
- Zorg dat er een header rij is met "Naam" of "werknemer"

### Probleem: "Geen kilometers geïmporteerd"
**Oplossing:**
- Check of de waarden numeriek zijn (geen tekst)
- Check of de werkbladnamen maandnamen bevatten
- Ondersteunde namen: januari, februari, maart, etc. (ook Januari, JANUARI werkt)

### Probleem: "Verkeerde datum"
**Oplossing:**
- De import gebruikt jaar 2026
- Maand komt van werkbladnaam
- Dag komt van kolomnummer

### Probleem: "Dubbele kilometers"
**Dat is OK!**
- Als je opnieuw importeert worden oude waarden overschreven
- Handig voor correcties!

---

## 💡 Tips

1. **Back-up je Excel bestand** voordat je importeert

2. **Import eerst één maand** om te testen

3. **Controleer altijd** na import of alles klopt

4. **Gebruik consistente namen:**
   - Als werknemer in afwezigheidsplanning "Jan Jansen" heet
   - Moet hij in kilometers ook "Jan Jansen" heten
   - Precies dezelfde spelling!

5. **Je kunt opnieuw importeren:**
   - Om correcties te maken
   - Om nieuwe maanden toe te voegen

---

## 📝 Excel Bestand Vereisten

### Werkbladen:
- ✅ Maandnaam in werkblad naam (Januari, Februari, etc.)
- ✅ Één werkblad per maand

### Structuur:
- ✅ Eerste kolom: Werknemersnamen
- ✅ Header rij met "Naam" of "werknemer"
- ✅ Data start op rij na header
- ✅ Kolommen = dagen van de maand
- ✅ Waarden = kilometers (numeriek)

### Voorbeeld:
```excel
Werkblad naam: Januari

Rij 1: [Headers]
Rij 2: Naam werknemer | 1 | 2 | 3 | 4 | 5 | ...
Rij 3: Jan Jansen     | 25| 30| 0 | 15| 20| ...
Rij 4: Piet Pietersen | 40| 0 | 20| 25| 30| ...
```

---

## 🎊 Klaar!

De kilometers import functionaliteit is volledig operationeel!

### Volgende Stappen:

1. ✅ Kopieer Kilometer2026.xlsx naar de map
2. ✅ Open http://localhost:3000
3. ✅ Ga naar Import → Kilometers Import
4. ✅ Upload en importeer!
5. ✅ Controleer op Kilometers pagina
6. ✅ Test export
7. ✅ Klaar voor dagelijks gebruik!

---

**Veel succes met het importeren! 🚀**

Bij vragen, laat het me weten!

