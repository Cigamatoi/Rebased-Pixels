/**
 * Test-Skript zur Generierung und Anzeige von NFT-Metadaten
 */

const fs = require('fs');
const path = require('path');
const { createNftMetadata } = require('./autoMint');

// Pfad zur Epoch-Datei
const EPOCH_FILE = path.resolve(__dirname, '../../exports/epoch-3.json');

// Hauptfunktion
function testMetadata() {
  try {
    // Lese die Epoch-Datei
    const epochData = JSON.parse(fs.readFileSync(EPOCH_FILE, 'utf8'));
    const epochNumber = epochData.epochNumber;
    
    console.log(`Generiere Metadaten für Epoch ${epochNumber}...`);
    
    // Erstelle die Metadaten
    const metadata = createNftMetadata(epochNumber, epochData);
    
    // Ausgabe der Metadaten
    console.log(JSON.stringify(metadata, null, 2));
    
    // Speichere die Metadaten in einer Datei
    const outputFile = path.resolve(__dirname, `../../exports/metadata-epoch-${epochNumber}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(metadata, null, 2));
    
    console.log(`Metadaten wurden in ${outputFile} gespeichert.`);
  } catch (error) {
    console.error(`Fehler: ${error.message}`);
  }
}

// Führe die Funktion aus
testMetadata(); 