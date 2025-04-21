@echo off
setlocal enabledelayedexpansion

echo ===== IOTA CLI Einrichtung =====
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
echo ===== IOTA CLI Version =====
echo.

"%IOTA_CLI_PATH%" --version
if %ERRORLEVEL% neq 0 (
    echo FEHLER: IOTA CLI konnte nicht ausgeführt werden.
    exit /b 1
)

echo.
echo ===== Konfiguriere IOTA CLI =====
echo.

REM Kopiere die Konfigurationsdatei
echo Konfiguriere Client mit der Testnet-URL: https://api.testnet.iota.cafe
copy /Y "%~dp0iota-cli-config.json" "%USERPROFILE%\.iota\client.json"
if %ERRORLEVEL% neq 0 (
    echo WARNUNG: Konfigurationsdatei konnte nicht kopiert werden.
    echo Erstelle Verzeichnis und versuche erneut...
    mkdir "%USERPROFILE%\.iota"
    copy /Y "%~dp0iota-cli-config.json" "%USERPROFILE%\.iota\client.json"
)

echo.
echo ===== Erstelle neue Adresse =====
echo.

echo Erstelle eine neue Adresse für die IOTA CLI...
"%IOTA_CLI_PATH%" client new-address

echo.
echo ===== WICHTIG: SHIMMER NETZWERK NIEMALS VERWENDEN! =====
echo Bitte verwenden Sie nur IOTA Testnet (api.testnet.iota.cafe)
echo.

echo ===== Einrichtung Abgeschlossen =====
echo Endzeit: %TIME%
echo.

echo Bitte notieren Sie die neu erstellte Adresse und fügen Sie sie in die .env.local Datei ein.
echo Die CLI ist jetzt bereit für die Interaktion mit dem IOTA Testnet.
echo.

endlocal 