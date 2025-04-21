@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo = Rebased Pixels NFT Admin - Komplettes Setup =
echo ===============================================
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

REM Create Verzeichnisse
echo Erstelle benötigte Verzeichnisse...
if not exist "temp" mkdir temp
if not exist "logs" mkdir logs
if not exist "data\exports" mkdir data\exports
if not exist "%USERPROFILE%\.iota" mkdir "%USERPROFILE%\.iota"

echo.
echo ===== 1. IOTA CLI Konfiguration =====
echo.

echo Konfiguriere Client mit der Testnet-URL: https://api.testnet.iota.cafe
copy /Y "%~dp0iota-cli-config.json" "%USERPROFILE%\.iota\client.json"
if %ERRORLEVEL% neq 0 (
    echo WARNUNG: Konfigurationsdatei konnte nicht kopiert werden.
    exit /b 1
)

echo.
echo ===== 2. IOTA CLI Adresse erstellen =====
echo.

echo Möchten Sie eine neue Adresse erstellen oder die bestehende Admin-Adresse verwenden?
echo [1] Neue Adresse erstellen
echo [2] Bestehende Admin-Adresse verwenden (aus .env.local)
set /p option="Wählen Sie eine Option (1/2): "

if "%option%" == "1" (
    echo Erstelle eine neue Adresse für die IOTA CLI...
    "%IOTA_CLI_PATH%" client new-address
) else (
    echo Verwende die bestehende Admin-Adresse aus .env.local.
)

echo.
echo ===== 3. Teste Verbindung zum IOTA Testnet =====
echo.

echo Prüfe Chain-Identifier...
"%IOTA_CLI_PATH%" client chain-identifier
if %ERRORLEVEL% neq 0 (
    echo FEHLER: Verbindung zum IOTA Testnet fehlgeschlagen.
    exit /b 1
)

echo.
echo Aktive Adresse:
"%IOTA_CLI_PATH%" client active-address
echo.
echo Aktive Umgebung:
"%IOTA_CLI_PATH%" client active-env
echo.

echo Kontostand der aktiven Adresse:
"%IOTA_CLI_PATH%" client balance
echo.

echo ===== 4. Verfügbare Smart Contract Packages auflisten =====
echo.

echo Zeige alle Objekte der aktiven Adresse...
"%IOTA_CLI_PATH%" client objects --json > objects.json
if %ERRORLEVEL% neq 0 (
    echo FEHLER: Konnte keine Objekte abrufen.
    exit /b 1
)

echo Objekte in objects.json gespeichert.
echo.

echo Suche nach Packages für die aktive Adresse...
type objects.json | findstr "Package" > packages.txt

if %ERRORLEVEL% neq 0 (
    echo Keine Packages gefunden.
) else (
    echo Package Informationen in packages.txt gespeichert.
)

echo.
echo ===== 5. Kompilieren und Veröffentlichen von Smart Contracts =====
echo.

echo Möchten Sie jetzt einen Smart Contract veröffentlichen?
echo [1] Ja, Epoch-Contract veröffentlichen (aus src/move)
echo [2] Ja, NFT-Contract veröffentlichen (aus src/move)
echo [3] Nein, ich möchte jetzt keinen Contract veröffentlichen
set /p publish_option="Wählen Sie eine Option (1/2/3): "

if "%publish_option%" == "1" (
    call "%~dp0publish-package.bat" "%~dp0..\src\move\epoch_contract"
) else if "%publish_option%" == "2" (
    call "%~dp0publish-package.bat" "%~dp0..\src\move\nft_contract"
) else (
    echo Sie haben sich entschieden, jetzt keinen Contract zu veröffentlichen.
)

echo.
echo ===== WICHTIG: SHIMMER NETZWERK NIEMALS VERWENDEN! =====
echo Bitte verwenden Sie nur IOTA Testnet (api.testnet.iota.cafe)
echo.

echo ===== Setup Abgeschlossen =====
echo Endzeit: %TIME%
echo.

echo ==========================================================
echo Nächste Schritte:
echo 1. Notieren Sie die Package-IDs und aktualisieren Sie die .env.local Datei
echo 2. Stellen Sie sicher, dass Ihre aktive Adresse genügend Testnet-Tokens hat
echo 3. Führen Sie einen Test der NFT-Minting-Funktion durch mit:
echo    node scripts/autoMint.js
echo ==========================================================
echo.

endlocal 