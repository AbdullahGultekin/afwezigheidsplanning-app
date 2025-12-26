# GitHub Setup Instructies

## ✅ Git Repository is Klaar!

Je lokale git repository is geïnitialiseerd en de eerste commit is gemaakt.

## 📋 Volgende Stappen: GitHub Repository Aanmaken

### Stap 1: Maak GitHub Repository Aan

1. Ga naar: https://github.com/new
2. Vul in:
   - **Repository name**: `afwezigheidsplanning-app` (of een andere naam)
   - **Description**: "Werknemersafwezigheidsplanning App 2026 - Uren, Kilometers, Afwezigheden"
   - **Visibility**: 
     - ✅ **Private** (aanbevolen voor bedrijfsdata)
     - Of **Public** (als je het wilt delen)
   - **⚠️ NIET aanvinken**: "Add a README file" (we hebben er al een)
   - **⚠️ NIET aanvinken**: "Add .gitignore" (we hebben er al een)
   - **⚠️ NIET aanvinken**: "Choose a license"
3. Klik **"Create repository"**

### Stap 2: Push naar GitHub

Na het aanmaken van de repository, GitHub toont instructies. Gebruik deze commands:

```bash
cd /Users/abdullahgultekin/Documents/afwezigheidsplanning

# Voeg GitHub remote toe (vervang USERNAME en REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Of met SSH (als je SSH keys hebt ingesteld):
# git remote add origin git@github.com:USERNAME/REPO_NAME.git

# Push naar GitHub
git branch -M main
git push -u origin main
```

### Stap 3: Verificatie

Ga naar je GitHub repository pagina en controleer of alle bestanden er zijn.

## 🔐 Belangrijke Opmerkingen

### ⚠️ Database Bestanden

De database bestanden (`dev.db`) zijn **NIET** in .gitignore opgenomen omdat ze mogelijk nodig zijn voor setup. 

**Als je ze NIET wilt committen**, voeg toe aan `.gitignore`:
```
afwezigheidsplanning-app/prisma/dev.db
afwezigheidsplanning-app/prisma/dev.db-journal
```

En voer uit:
```bash
git rm --cached afwezigheidsplanning-app/prisma/dev.db*
git commit -m "Remove database files from git"
```

### 🔒 Environment Variables

Het `.env` bestand is al in `.gitignore` opgenomen. Zorg ervoor dat je:
- **GEEN** `.env` bestand commit
- **GEEN** API keys of secrets commit

### 📝 .env Template (optioneel)

Je kunt een `.env.example` bestand maken voor andere developers:

```bash
# .env.example
DATABASE_URL="file:./dev.db"
```

## 🚀 Alternatief: GitHub CLI

Als je GitHub CLI hebt geïnstalleerd:

```bash
# Login
gh auth login

# Maak repository en push in één keer
gh repo create afwezigheidsplanning-app --private --source=. --remote=origin --push
```

## 📦 Wat is Gecommit?

✅ Alle source code
✅ Package.json en dependencies
✅ Prisma schema
✅ Documentatie (README, INSTRUCTIES, etc.)
✅ Componenten en API routes
✅ Database schema (migrations)

❌ Node modules (in .gitignore)
❌ .env bestanden (in .gitignore)
❌ Build bestanden (.next) (in .gitignore)

## 🎯 Na het Pushen

### Voor Nieuwe Developers:

```bash
# Clone repository
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME

# Installeer dependencies
cd afwezigheidsplanning-app
npm install

# Setup database
npx prisma migrate dev

# Start development
npm run dev
```

## ✅ Klaar!

Je project staat nu op GitHub! 🎉

