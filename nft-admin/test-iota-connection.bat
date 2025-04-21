@echo off
setlocal enabledelayedexpansion

echo ===== IOTA CLI Verbindungstest =====
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
echo ===== Teste Verbindung zum IOTA Testnet =====
echo.

echo Prüfe Chain-Identifier...
"%IOTA_CLI_PATH%" client chain-identifier
if %ERRORLEVEL% neq 0 (
    echo FEHLER: Verbindung zum IOTA Testnet fehlgeschlagen.
    echo Bitte überprüfen Sie Ihre Internetverbindung und die Konfiguration.
    exit /b 1
)

echo.
echo ===== Zeige aktive Adresse und Umgebung =====
echo.

echo Aktive Adresse:
"%IOTA_CLI_PATH%" client active-address
echo.
echo Aktive Umgebung:
"%IOTA_CLI_PATH%" client active-env
echo.

echo ===== Prüfe Balance =====
echo.

echo Kontostand der aktiven Adresse:
"%IOTA_CLI_PATH%" client balance
echo.

echo ===== WICHTIG: SHIMMER NETZWERK NIEMALS VERWENDEN! =====
echo Bitte verwenden Sie nur IOTA Testnet (api.testnet.iota.cafe)
echo.

echo ===== Test Abgeschlossen =====
echo Endzeit: %TIME%
echo.

echo Falls Sie kein Guthaben haben, können Sie Testnet-Tokens vom Faucet anfordern:
echo "%IOTA_CLI_PATH%" client faucet
echo.

endlocal 