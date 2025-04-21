@echo off
setlocal enabledelayedexpansion

echo ===== IOTA Smart Contract Packages =====
echo Startzeit: %TIME%
echo.

REM Prüfe auf IOTA CLI
echo Prüfe IOTA CLI Installation...

if exist "C:\iota\iota.exe" (
    echo IOTA CLI gefunden: C:\iota\iota.exe
    set IOTA_CLI_PATH=C:\iota\iota.exe
) else (
    echo FEHLER: IOTA CLI nicht gefunden unter C:\iota\iota.exe
    echo Bitte installieren Sie die IOTA CLI oder passen Sie den Pfad an.
    exit /b 1
)

echo.
echo ===== Liste verfügbare Objekte =====
echo.

echo Zeige alle Objekte der aktiven Adresse...
"%IOTA_CLI_PATH%" client objects --json > objects.json
if %ERRORLEVEL% neq 0 (
    echo FEHLER: Konnte keine Objekte abrufen.
    exit /b 1
)

echo Objekte in objects.json gespeichert.
echo.

echo ===== Suche nach Package IDs =====
echo.

echo Suche nach Packages für die aktive Adresse...
type objects.json | findstr "Package" > packages.txt

if %ERRORLEVEL% neq 0 (
    echo Keine Packages gefunden.
) else (
    echo Package Informationen in packages.txt gespeichert.
)

echo.
echo Bitte aktualisieren Sie die Package-IDs in der .env.local Datei mit den gefundenen IDs.
echo.

echo ===== WICHTIG: SHIMMER NETZWERK NIEMALS VERWENDEN! =====
echo Bitte verwenden Sie nur IOTA Testnet (api.testnet.iota.cafe)
echo.

echo ===== Vorgang Abgeschlossen =====
echo Endzeit: %TIME%
echo.

endlocal 