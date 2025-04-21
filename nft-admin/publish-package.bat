@echo off
setlocal enabledelayedexpansion

echo ===== IOTA Move Paket Veröffentlichung =====
echo Startzeit: %TIME%
echo.

if "%~1"=="" (
    echo Fehler: Bitte geben Sie den Pfad zum Move-Paket an.
    echo Verwendung: publish-package.bat [Pfad zum Move-Paket]
    exit /b 1
)

set PACKAGE_PATH=%~1

if not exist "%PACKAGE_PATH%" (
    echo Fehler: Das angegebene Verzeichnis existiert nicht: %PACKAGE_PATH%
    exit /b 1
)

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
echo ===== Kompiliere und Veröffentliche Move-Paket =====
echo.

echo Paket-Verzeichnis: %PACKAGE_PATH%
cd /d %PACKAGE_PATH%

echo.
echo === Kompiliere Move-Paket ===
echo.

"%IOTA_CLI_PATH%" move build --path .
if %ERRORLEVEL% neq 0 (
    echo FEHLER: Kompilierung des Move-Pakets fehlgeschlagen.
    exit /b 1
)

echo.
echo === Veröffentliche Move-Paket ===
echo.

echo Veröffentliche das kompilierte Paket auf der IOTA-Blockchain...
"%IOTA_CLI_PATH%" client publish --path .
if %ERRORLEVEL% neq 0 (
    echo FEHLER: Veröffentlichung des Move-Pakets fehlgeschlagen.
    exit /b 1
)

echo.
echo ===== Notiere Package ID =====
echo.

echo Bitte notieren Sie die Package-ID aus der Ausgabe und aktualisieren Sie die .env.local Datei.
echo.

echo ===== WICHTIG: SHIMMER NETZWERK NIEMALS VERWENDEN! =====
echo Bitte verwenden Sie nur IOTA Testnet (api.testnet.iota.cafe)
echo.

echo ===== Veröffentlichung Abgeschlossen =====
echo Endzeit: %TIME%
echo.

endlocal 