#!/bin/bash

# Farben für die Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Lade die Umgebungsvariablen
if [ -f ".env" ]; then
    source .env
else
    echo -e "${RED}Keine .env-Datei gefunden. Bitte stelle sicher, dass NEXT_PUBLIC_NFT_PACKAGE_ID gesetzt ist.${NC}"
    read -p "Bitte gib die Package-ID manuell ein: " NEXT_PUBLIC_NFT_PACKAGE_ID
fi

if [ -z "$NEXT_PUBLIC_NFT_PACKAGE_ID" ]; then
    echo -e "${RED}Keine Package-ID gefunden. Abbruch.${NC}"
    exit 1
fi

# Zeige die aktuellen verfügbaren Coins an
echo -e "${YELLOW}Prüfe verfügbare Coins...${NC}"
iota client objects | grep Coin

# IOTA-Coin-ID vom Nutzer abfragen
read -p "Bitte gib die IOTA-Coin-ID ein, die für die Zahlung verwendet werden soll: " COIN_ID

if [ -z "$COIN_ID" ]; then
    echo -e "${RED}Keine Coin-ID angegeben. Abbruch.${NC}"
    exit 1
fi

# NFT-Metadaten abfragen
read -p "NFT-Name (Default: RebasedPixels Artwork): " NFT_NAME
NFT_NAME=${NFT_NAME:-"RebasedPixels Artwork"}

read -p "NFT-Beschreibung (Default: Pixel art created on RebasedPixels Platform): " NFT_DESCRIPTION
NFT_DESCRIPTION=${NFT_DESCRIPTION:-"Pixel art created on RebasedPixels Platform"}

read -p "Bild-Referenz (Default: pixels_$(date +%s)): " IMAGE_REFERENCE
IMAGE_REFERENCE=${IMAGE_REFERENCE:-"pixels_$(date +%s)"}

echo -e "\n${YELLOW}Mint NFT mit folgenden Parametern:${NC}"
echo -e "Package ID: ${NEXT_PUBLIC_NFT_PACKAGE_ID}"
echo -e "Coin ID: ${COIN_ID}"
echo -e "NFT Name: ${NFT_NAME}"
echo -e "NFT Beschreibung: ${NFT_DESCRIPTION}"
echo -e "Bild-Referenz: ${IMAGE_REFERENCE}"

read -p "Fortfahren? (j/n): " CONTINUE
if [ "$CONTINUE" != "j" ]; then
    echo -e "${RED}Abbruch durch Benutzer.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Führe Transaktion aus, um NFT zu minten...${NC}"

# Führe die Transaktion aus
# Verwende einen PTB, um einen mint_simple_nft-Aufruf zu tätigen
RESULT=$(iota client ptb \
    --move-call ${NEXT_PUBLIC_NFT_PACKAGE_ID}::singleplayer_paid_nft::mint_simple_nft \
    @${COIN_ID} \
    "${NFT_NAME}" \
    "${NFT_DESCRIPTION}" \
    "${IMAGE_REFERENCE}" \
    --gas-budget 100000000)

if [ $? -ne 0 ]; then
    echo -e "${RED}Fehler beim Ausführen der Transaktion:${NC}"
    echo "$RESULT"
    exit 1
fi

echo -e "${GREEN}NFT erfolgreich geminted!${NC}"
echo -e "\n${YELLOW}Transaktionsdetails:${NC}"
echo "$RESULT"

# Zeige die aktualisierten Objekte an
echo -e "\n${YELLOW}Aktualisierte Objekte:${NC}"
iota client objects

echo -e "\n${GREEN}Vorgang abgeschlossen! Dein NFT wurde erfolgreich geminted.${NC}"
echo -e "${YELLOW}Du kannst das NFT in deiner Wallet sehen.${NC}" 