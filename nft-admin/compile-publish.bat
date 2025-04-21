@echo off
setlocal enabledelayedexpansion

echo ===== IOTA Move Kompilierung und Veröffentlichung =====
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
echo ===== Move.toml erstellen =====
echo.

echo [package] > "%~dp0..\src\move\Move.toml"
echo name = "RebasedPixels" >> "%~dp0..\src\move\Move.toml"
echo version = "0.1.0" >> "%~dp0..\src\move\Move.toml"
echo authors = ["RebasedPixels Team"] >> "%~dp0..\src\move\Move.toml"
echo. >> "%~dp0..\src\move\Move.toml"
echo [addresses] >> "%~dp0..\src\move\Move.toml"
echo nft_admin = "0xe2445b4e3ef65b1bb747ad192410e3a4dcc2e8831abd11eb173675b8285b96d4" >> "%~dp0..\src\move\Move.toml"
echo epoch_contract = "0xe2445b4e3ef65b1bb747ad192410e3a4dcc2e8831abd11eb173675b8285b96d4" >> "%~dp0..\src\move\Move.toml"
echo std = "0x1" >> "%~dp0..\src\move\Move.toml"

echo Move.toml erstellt.

echo.
echo ===== Kompiliere Move Module =====
echo.

cd /d "%~dp0..\src\move"
echo Kompiliere in %CD%...

powershell -Command "& 'C:\iota\iota.exe' move build --path ."
if %ERRORLEVEL% neq 0 (
    echo FEHLER: Kompilierung des Move-Pakets fehlgeschlagen.
    exit /b 1
)

echo.
echo ===== Veröffentliche Move-Paket =====
echo.

powershell -Command "& 'C:\iota\iota.exe' client publish ."
if %ERRORLEVEL% neq 0 (
    echo WARNUNG: Veröffentlichung des Move-Pakets fehlgeschlagen.
    echo Dies könnte an fehlenden Berechtigungen oder fehlenden Coins liegen.
    echo Bitte prüfen Sie, ob die aktive Adresse über ausreichende Coins verfügt.
    echo.
    echo Kontostand der aktiven Adresse:
    powershell -Command "& 'C:\iota\iota.exe' client balance"
    echo.
    echo Sie können Testnet-Tokens vom Faucet anfordern:
    echo powershell -Command "& 'C:\iota\iota.exe' client faucet"
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

echo ===== Kompilierung und Veröffentlichung Abgeschlossen =====
echo Endzeit: %TIME%
echo.

endlocal