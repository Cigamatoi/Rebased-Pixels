/**
 * Automatisches NFT-Minting Script
 * Optimiert für echte Blockchain-Interaktionen auf Heroku
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('./config');
const { 
  executeIotaCommand, 
  mintNftWithMoveCli, 
  selectRandomWinnerWithCli,
  checkIotaCliAvailability,
  initializeDatabase
} = require('./moveCliUtil');

// Stellt sicher, dass das temporäre Verzeichnis existiert
if (!fs.existsSync(config.TEMP_DIR)) {
  fs.mkdirSync(config.TEMP_DIR, { recursive: true });
}

// Stellt sicher, dass das Log-Verzeichnis existiert
if (!fs.existsSync(config.LOGS_DIR)) {
  fs.mkdirSync(config.LOGS_DIR, { recursive: true });
}

// Initialisiere die benötigten Verzeichnisse
initializeDatabase().catch(error => {
  console.error('Fehler bei der Systeminitialisierung:', error);
});

/**
 * Führt den automatischen Mint-Prozess ohne Gewinner-Benachrichtigung durch
 */
async function runAutoMint() {
  console.log('Starte automatisches NFT-Minting...');

  // Prüfe, ob Export-Verzeichnis existiert
  const exportDir = process.env.EXPORTS_DIR || path.join(__dirname, '../../exports');
  if (!fs.existsSync(exportDir)) {
    console.error(`Export-Verzeichnis ${exportDir} existiert nicht. Beende Prozess.`);
    return;
  }

  // Prüfe, ob IOTA CLI verfügbar ist
  const cliAvailable = await checkIotaCliAvailability();
  if (!cliAvailable) {
    console.error('IOTA CLI ist nicht verfügbar. Beende Prozess.');
    return;
  }

  // Hole alle Export-Dateien
  const exportFiles = getExportFiles(exportDir);
  if (exportFiles.length === 0) {
    console.log('Keine unverarbeiteten Export-Dateien gefunden.');
    return;
  }

  console.log(`${exportFiles.length} unverarbeitete Export-Dateien gefunden.`);

  // Verarbeite jede Export-Datei
  for (const file of exportFiles) {
    console.log(`Verarbeite Export-Datei: ${file}`);
    
    try {
      // Lade Contributor-Daten aus der Export-Datei
      const contributors = await loadContributorsFromExport(file);
      if (!contributors || contributors.length === 0) {
        console.log(`Keine Contributor-Daten in ${file} gefunden. Überspringe.`);
        await markEpochAsProcessed(file, 'keine_contributors');
        continue;
      }

      console.log(`${contributors.length} Contributors gefunden.`);

      // Extrahiere die Epoch-Nummer aus dem Dateinamen
      const epochMatch = path.basename(file).match(/epoch_(\d+)/);
      if (!epochMatch) {
        console.error(`Konnte keine Epoch-Nummer aus Dateiname ${file} extrahieren. Überspringe.`);
        await markEpochAsProcessed(file, 'ungültiger_dateiname');
        continue;
      }

      const epochNumber = parseInt(epochMatch[1], 10);

      // Wähle einen zufälligen Gewinner aus
      const winnerAddress = await selectRandomWinner(contributors);
      if (!winnerAddress) {
        console.error('Konnte keinen Gewinner auswählen. Überspringe Epoch.');
        await markEpochAsProcessed(file, 'kein_gewinner');
        continue;
      }

      console.log(`Gewinner für Epoch ${epochNumber}: ${winnerAddress}`);

      // Erstelle Metadaten für das NFT
      const metadata = {
        name: `RebasedPixels Epoch ${epochNumber}`,
        description: `Dieses NFT repräsentiert die Epoch ${epochNumber} des RebasedPixels Projekts. Der Gewinner wurde zufällig aus allen Contributoren ausgewählt.`,
        image: `ipfs://HASH_HIER_EINFÜGEN/epoch_${epochNumber}.png`, // Hier IPFS-Hash einfügen
        epoch: epochNumber,
        attributes: [
          {
            trait_type: "Epoch",
            value: epochNumber
          },
          {
            trait_type: "Contributors",
            value: contributors.length
          },
          {
            trait_type: "Winner",
            value: winnerAddress
          }
        ]
      };

      // Führe NFT-Minting durch (im Produktionsmodus)
      const txId = await mintNft(metadata, winnerAddress, false);
      if (!txId) {
        console.error(`NFT-Minting für Epoch ${epochNumber} fehlgeschlagen. Überspringe.`);
        await markEpochAsProcessed(file, 'mint_fehlgeschlagen');
        continue;
      }

      // Speichere die Transaktion in der Historie
      await saveTransactionToHistory({
        epoch: epochNumber,
        winner: winnerAddress,
        contributorsCount: contributors.length,
        txId: txId,
        timestamp: new Date().toISOString()
      });

      // Markiere Epoch als verarbeitet
      await markEpochAsProcessed(file, 'erfolgreich', txId);
      
      console.log(`Epoch ${epochNumber} erfolgreich verarbeitet. NFT geminted für ${winnerAddress}.`);
    } catch (error) {
      console.error(`Fehler bei der Verarbeitung von ${file}: ${error.message}`);
      await markEpochAsProcessed(file, `fehler: ${error.message}`);
    }
  }

  console.log('Automatisches NFT-Minting abgeschlossen.');
}

/**
 * Findet alle Epoch-Export-Dateien, die noch nicht verarbeitet wurden
 * @param {string} exportDir Pfad zum Export-Verzeichnis
 * @returns {Array} Liste der Dateipfade
 */
function getExportFiles(exportDir) {
  const files = fs.readdirSync(exportDir);
  
  return files
    .filter(file => file.startsWith('epoch_') && file.endsWith('.json'))
    .filter(file => {
      // Prüfe, ob die Datei bereits verarbeitet wurde
      const processedFile = path.join(exportDir, `${file}.processed`);
      return !fs.existsSync(processedFile);
    })
    .map(file => path.join(exportDir, file))
    .sort(); // Sortiere nach Dateinamen (und damit nach Epoch-Nummer)
}

/**
 * Lädt Contributor-Daten aus einer Export-Datei
 * @param {string} filePath Pfad zur Export-Datei
 * @returns {Promise<Array>} Liste der Contributor-Adressen
 */
async function loadContributorsFromExport(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const exportData = JSON.parse(data);
    
    // Extrahiere die Liste der Contributor-Adressen
    if (exportData && exportData.contributors && Array.isArray(exportData.contributors)) {
      return exportData.contributors.map(c => c.address).filter(Boolean);
    }
    
    return [];
  } catch (error) {
    console.error(`Fehler beim Laden der Contributor-Daten aus ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Wählt einen zufälligen Gewinner aus der Liste der Contributor-Adressen aus
 * @param {Array} contributors Liste der Contributor-Adressen
 * @returns {Promise<string|null>} Die ausgewählte Adresse oder null bei Fehler
 */
async function selectRandomWinner(contributors) {
  try {
    // Versuche zuerst, einen Gewinner mit der IOTA CLI zu wählen (für On-Chain Randomness)
    console.log('Versuche, einen Gewinner mit der IOTA CLI zu wählen...');
    const winnerFromCli = await selectRandomWinnerWithCli(contributors);
    
    if (winnerFromCli) {
      console.log(`Gewinner über IOTA CLI ausgewählt: ${winnerFromCli}`);
      return winnerFromCli;
    }
    
    // Fallback: Wähle einen zufälligen Gewinner lokal aus
    console.log('Fallback: Wähle einen zufälligen Gewinner lokal aus...');
    if (contributors.length === 0) {
      console.error('Keine Contributors vorhanden. Kann keinen Gewinner auswählen.');
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * contributors.length);
    const winnerLocal = contributors[randomIndex];
    
    console.log(`Gewinner lokal ausgewählt: ${winnerLocal}`);
    return winnerLocal;
  } catch (error) {
    console.error(`Fehler bei der Auswahl eines zufälligen Gewinners: ${error.message}`);
    return null;
  }
}

/**
 * Führt das NFT-Minting durch
 * @param {Object} metadata Die Metadaten für das NFT
 * @param {string} winnerAddress Die Adresse des Gewinners
 * @param {boolean} isTest Wenn true, wird nur eine Simulation durchgeführt
 * @returns {Promise<string|null>} Die Transaktions-ID oder null bei Fehler
 */
async function mintNft(metadata, winnerAddress, isTest = false) {
  console.log(`${isTest ? 'Simuliere' : 'Starte'} NFT-Minting für Epoch ${metadata.epoch}...`);
  
  try {
    // Verwende die moveCliUtil.js-Funktion für das Minting
    const txId = await mintNftWithMoveCli(metadata, winnerAddress, isTest);
    
    if (txId) {
      console.log(`NFT für Epoch ${metadata.epoch} erfolgreich geminted. ${isTest ? '(Simulation)' : ''}`);
      console.log(`Transaktions-ID: ${txId}`);
      return txId;
    } else {
      console.error(`NFT-Minting für Epoch ${metadata.epoch} fehlgeschlagen.`);
      return null;
    }
  } catch (error) {
    console.error(`Fehler beim NFT-Minting: ${error.message}`);
    return null;
  }
}

/**
 * Markiert eine Epoch als verarbeitet
 * @param {string} filePath Pfad zur Export-Datei
 * @param {string} reason Grund für die Markierung
 * @param {string} txId Optional: Transaktions-ID
 */
async function markEpochAsProcessed(filePath, reason, txId = null) {
  const processedData = {
    originalFile: path.basename(filePath),
    processedAt: new Date().toISOString(),
    reason: reason,
    txId: txId
  };
  
  // Speichere als Datei
  const processedFile = `${filePath}.processed`;
  await fs.promises.writeFile(processedFile, JSON.stringify(processedData, null, 2));
  console.log(`Datei ${filePath} als verarbeitet markiert: ${reason}`);
}

/**
 * Speichert eine Transaktion in der Historie
 * @param {Object} transaction Das Transaktions-Objekt
 */
async function saveTransactionToHistory(transaction) {
  const historyDir = path.join(__dirname, '../history');
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }
  
  const historyFile = path.join(historyDir, 'transactions.json');
  let history = [];
  
  // Lade existierende Historie, falls vorhanden
  if (fs.existsSync(historyFile)) {
    const data = await fs.promises.readFile(historyFile, 'utf8');
    try {
      history = JSON.parse(data);
    } catch (error) {
      console.error(`Fehler beim Laden der Transaktionshistorie: ${error.message}`);
    }
  }
  
  // Füge neue Transaktion hinzu
  history.push(transaction);
  
  // Speichere aktualisierte Historie
  await fs.promises.writeFile(historyFile, JSON.stringify(history, null, 2));
  console.log(`Transaktion für Epoch ${transaction.epoch} zur Historie hinzugefügt.`);
}

// Wenn dieses Skript direkt ausgeführt wird, starte den Auto-Mint-Prozess
if (require.main === module) {
  runAutoMint().catch(error => {
    console.error('Fehler im Auto-Mint-Prozess:', error);
  });
}

module.exports = {
  runAutoMint,
  mintNft,
  selectRandomWinner
};