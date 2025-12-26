@echo off
title Afwezigheidsplanning App
color 0A

echo ========================================
echo Afwezigheidsplanning App Starten
echo ========================================
echo.

cd /d "%~dp0..\afwezigheidsplanning-app"

echo Controleren Node.js installatie...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Node.js is niet geinstalleerd!
    echo.
    echo Download Node.js van: https://nodejs.org/
    echo Kies de LTS versie (aanbevolen)
    echo.
    pause
    exit /b 1
)

echo Node.js gevonden: 
node --version
echo.

echo Controleren dependencies...
if not exist "node_modules" (
    echo Dependencies niet gevonden. Installeren...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: npm install gefaald!
        pause
        exit /b 1
    )
)

echo.
echo Starten applicatie...
echo.
echo ========================================
echo.

call npm run start:electron

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo Fout bij starten applicatie!
    echo ========================================
    echo.
    pause
)
