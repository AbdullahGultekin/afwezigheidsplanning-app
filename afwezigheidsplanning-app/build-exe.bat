@echo off
echo ========================================
echo Pita Pizza Napoli - EXE Builder
echo ========================================
echo.

set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=

echo Code signing uitgeschakeld
echo.

cd /d "%~dp0"
npm run build:exe

echo.
echo ========================================
echo Build voltooid!
echo ========================================
echo.
echo De .exe staat in: dist\win-unpacked\Pita Pizza Napoli.exe
echo.
pause


