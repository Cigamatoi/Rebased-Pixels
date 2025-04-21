@echo off
echo Starte RebasedPixels Auto-Mint Prozess...
echo Aktuelle Zeit: %time%

cd %~dp0
node scripts/autoMint.js

echo Auto-Mint Prozess beendet.
echo Aktuelle Zeit: %time%
pause 