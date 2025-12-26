@echo off
echo ========================================
echo Afwezigheidsplanning App - Windows Build
echo ========================================
echo.

cd /d "%~dp0..\afwezigheidsplanning-app"

echo Controleren Node.js installatie...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is niet geinstalleerd!
    echo Download Node.js van: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js gevonden!
node --version
echo.

echo Controleren npm installatie...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is niet geinstalleerd!
    pause
    exit /b 1
)

echo npm gevonden!
npm --version
echo.

echo Installeren dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install gefaald!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Kies build type:
echo ========================================
echo 1. Portable (geen installatie nodig)
echo 2. Installer (NSIS installer)
echo 3. Beide
echo.
set /p choice="Kies optie (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo Bouwen Portable versie...
    call npm run build:electron:win:portable
) else if "%choice%"=="2" (
    echo.
    echo Bouwen Installer versie...
    call npm run build:electron:win:installer
) else if "%choice%"=="3" (
    echo.
    echo Bouwen beide versies...
    call npm run build:electron:win:portable
    call npm run build:electron:win:installer
) else (
    echo Ongeldige keuze!
    pause
    exit /b 1
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build succesvol!
    echo ========================================
    echo Bestanden staan in: dist\
    echo.
    echo Portable: dist\Afwezigheidsplanning App-1.0.0-x64.exe
    echo Installer: dist\Afwezigheidsplanning App Setup 1.0.0.exe
    echo.
) else (
    echo.
    echo ========================================
    echo Build gefaald!
    echo ========================================
    echo Controleer de foutmeldingen hierboven.
    echo.
)

pause
