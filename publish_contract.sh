#!/bin/bash

# Farben für die Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starte die Veröffentlichung des RebasedPixels NFT Contracts...${NC}"

# Schritt 1: Kompilieren des Pakets
echo -e "\n${YELLOW}Kompiliere den Smart Contract...${NC}"
iota move build
if [ $? -ne 0 ]; then
    echo -e "${RED}Fehler beim Kompilieren des Smart Contracts. Abbruch.${NC}"
    exit 1
fi
echo -e "${GREEN}Smart Contract erfolgreich kompiliert!${NC}"

# Schritt 2: Ausführen der Tests
echo -e "\n${YELLOW}Führe Tests aus...${NC}"
iota move test
if [ $? -ne 0 ]; then
    echo -e "${RED}Tests fehlgeschlagen. Bitte überprüfe den Code. Abbruch.${NC}"
    exit 1
fi
echo -e "${GREEN}Alle Tests erfolgreich bestanden!${NC}"

# Schritt 3: Veröffentlichen des Pakets
echo -e "\n${YELLOW}Veröffentliche Smart Contract auf der IOTA Blockchain...${NC}"
echo -e "${YELLOW}Dies kann einige Minuten dauern...${NC}"

# Höheres Gas-Budget setzen, um sicherzustellen, dass die Transaktion durchgeht
PUBLISH_RESULT=$(iota client publish --gas-budget 100000000)

if [ $? -ne 0 ]; then
    echo -e "${RED}Fehler beim Veröffentlichen des Smart Contracts:${NC}"
    echo "$PUBLISH_RESULT"
    exit 1
fi

echo -e "${GREEN}Smart Contract erfolgreich veröffentlicht!${NC}"
echo -e "\n${YELLOW}Transaktionsdetails:${NC}"
echo "$PUBLISH_RESULT"

# Extrahiere die Package-ID
PACKAGE_ID=$(echo "$PUBLISH_RESULT" | grep "PackageID:" | awk '{print $2}')

if [ -n "$PACKAGE_ID" ]; then
    echo -e "\n${GREEN}Package ID: ${PACKAGE_ID}${NC}"
    echo -e "${YELLOW}Speichere Package ID in .env Datei...${NC}"
    
    # Prüfe, ob .env existiert
    if [ -f ".env" ]; then
        # Ersetze oder füge NEXT_PUBLIC_NFT_PACKAGE_ID hinzu
        grep -q "NEXT_PUBLIC_NFT_PACKAGE_ID" .env && \
            sed -i "s|NEXT_PUBLIC_NFT_PACKAGE_ID=.*|NEXT_PUBLIC_NFT_PACKAGE_ID=${PACKAGE_ID}|" .env || \
            echo "NEXT_PUBLIC_NFT_PACKAGE_ID=${PACKAGE_ID}" >> .env
    else
        # Erstelle .env Datei
        echo "NEXT_PUBLIC_NFT_PACKAGE_ID=${PACKAGE_ID}" > .env
    fi
    
    echo -e "${GREEN}Package ID wurde in .env gespeichert.${NC}"
else
    echo -e "${RED}Package ID konnte nicht aus der Ausgabe extrahiert werden.${NC}"
fi

echo -e "\n${GREEN}Veröffentlichung abgeschlossen! Dein NFT Smart Contract ist jetzt auf der IOTA Blockchain verfügbar.${NC}"
echo -e "${YELLOW}Nutze die Package ID in deiner Frontend-Anwendung, um den Smart Contract aufzurufen.${NC}" 