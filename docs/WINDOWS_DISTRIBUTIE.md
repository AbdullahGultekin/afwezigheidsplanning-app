# Windows Distributie Guide

## 📦 App Distribueren op Windows

### Stap 1: Build Maken

Zie `WINDOWS_BUILD_INSTRUCTIES.md` voor build instructies.

Na build vind je in `dist/`:
- `Afwezigheidsplanning App-1.0.0-x64.exe` (Portable)
- `Afwezigheidsplanning App Setup 1.0.0.exe` (Installer)

---

## Stap 2: Testen

### Test Checklist

- [ ] App start zonder errors
- [ ] Database wordt aangemaakt
- [ ] Werknemers kunnen worden toegevoegd
- [ ] Uren kunnen worden ingevoerd
- [ ] Kilometers kunnen worden ingevoerd
- [ ] Import werkt
- [ ] Export werkt (Excel en PDF)
- [ ] Automatisch opslaan werkt
- [ ] App sluit correct af

### Test op Schone Machine

1. Test op Windows machine zonder Node.js
2. Test op Windows machine zonder admin rechten
3. Test op Windows 10 en Windows 11
4. Test portable en installer versie

---

## Stap 3: Distributie Methoden

### Methode 1: USB Stick

1. Kopieer `.exe` bestand naar USB
2. Deel USB met gebruikers
3. Gebruikers kunnen direct starten vanaf USB

### Methode 2: Cloud Storage

1. Upload naar OneDrive/Google Drive/Dropbox
2. Deel link met gebruikers
3. Gebruikers downloaden en starten

### Methode 3: Netwerk Share

1. Plaats op netwerk drive
2. Gebruikers kunnen direct starten
3. Of kopiëren naar lokale machine

### Methode 4: Email

1. Zip het bestand (optioneel)
2. Stuur via email
3. Gebruikers downloaden en starten

---

## Stap 4: Installatie Instructies

Stuur gebruikers naar:
- `docs/WINDOWS_INSTALLATIE_GUIDE.md`
- Of `docs/QUICK_START_WINDOWS.md` voor snelle start

---

## Veiligheid

### Code Signing (Aanbevolen voor Productie)

Voor vertrouwen van gebruikers:

1. **Koop Code Signing Certificate**
   - Van Sectigo, DigiCert, etc.
   - Kosten: ~$200-400/jaar

2. **Configureer in electron-builder.yml:**
   ```yaml
   win:
     certificateFile: path/to/certificate.pfx
     certificatePassword: password
     signAndEditExecutable: true
   ```

3. **Rebuild**
   - App wordt nu getekend
   - Windows waarschuwingen verdwijnen

### Alternatief: Instructies voor Gebruikers

Als je geen code signing hebt:

1. Voeg instructies toe voor "Deblokkeren"
2. Leg uit waarom Windows waarschuwt
3. Geef contact info voor vragen

---

## Updates Distribueren

### Methode 1: Handmatig

1. Build nieuwe versie
2. Update versie nummer
3. Deel nieuwe .exe
4. Gebruikers vervangen oude versie

### Methode 2: Auto-Updater (Toekomstig)

1. Setup update server
2. Implementeer electron-updater
3. App checkt automatisch op updates
4. Gebruikers krijgen update notificatie

---

## Support

### Voor Gebruikers

1. **Documentatie**: `docs/` map
2. **Quick Start**: `QUICK_START_WINDOWS.md`
3. **Troubleshooting**: `WINDOWS_INSTALLATIE_GUIDE.md`

### Voor Ontwikkelaars

1. **Build**: `WINDOWS_BUILD_INSTRUCTIES.md`
2. **Configuratie**: `electron-builder.yml`
3. **Logs**: Check console output

---

## Best Practices

### Versie Nummering

Gebruik semantische versieing:
- `1.0.0` - Major release
- `1.1.0` - Minor update (nieuwe features)
- `1.1.1` - Patch (bug fixes)

### Changelog

Houd changelog bij:
- `CHANGELOG.md` in root
- Update bij elke release
- Document nieuwe features en fixes

### Backups

**Belangrijk voor gebruikers:**
- Maak regelmatig backups van database
- Bewaar op veilige locatie
- Test restore procedure

---

**Laatste update**: December 2026

