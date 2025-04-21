@echo off
echo ===== Rebased Pixels Package ID Finder =====
echo Startzeit: %TIME%
echo.

if exist "C:\iota\iota.exe" (
    echo IOTA CLI gefunden: C:\iota\iota.exe
    set IOTA_CLI_PATH=C:\iota\iota.exe
) else (
    echo FEHLER: IOTA CLI nicht gefunden
    exit /b 1
)

echo.
echo ===== Veröffentlichte Packages auflisten =====
echo.

echo Rufe Packages für Admin-Adresse ab...
"%IOTA_CLI_PATH%" package list --sender 0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5 --json > packages.json

echo.
echo Publizierte Package-IDs:
echo -------------------------
type packages.json
echo -------------------------
echo.

echo Endzeit: %TIME% 