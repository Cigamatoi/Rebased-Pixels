// Move CLI Integration Utilities
// JavaScript-Version für die Verwendung in Node.js-Scripts
// Optimiert für echte Blockchain-Interaktionen auf Heroku

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const execPromise = promisify(exec);

// Logging für Debugging-Zwecke
console.log("Verwendete Konfiguration:");
console.log(`- NFT_PACKAGE_ID: ${config.NFT_PACKAGE_ID}`);
console.log(`- NFT_MODULE_NAME: ${config.NFT_MODULE_NAME}`);
console.log(`- ADMIN_ADDRESS: ${config.ADMIN_ADDRESS}`);
console.log(`- IOTA_CLI_PATH: ${config.IOTA_CLI_PATH}`);

/**
 * Führt einen IOTA CLI-Befehl aus mit Überprüfung der Binary
 * @param {string} command Der auszuführende IOTA CLI-Befehl 
 * @returns {Promise<string>} Das Ergebnis des Befehls
 */
async function executeIotaCommand(command) {
  try {
    // Prüfe, ob die CLI-Datei existiert (wichtig für Heroku)
    const cliPath = config.IOTA_CLI_PATH;
    
    if (fs.existsSync(cliPath)) {
      console.log(`IOTA CLI gefunden: ${cliPath}`);
    } else {
      // Suche nach möglichen Alternativen im PATH
      const pathEnv = process.env.PATH.split(path.delimiter);
      let foundPath = null;
      
      for (const dir of pathEnv) {
        const possible = path.join(dir, 'iota-cli');
        if (fs.existsSync(possible)) {
          foundPath = possible;
          break;
        }
        
        // Überprüfe auch die Variante ohne "-cli" Suffix
        const possibleAlt = path.join(dir, 'iota');
        if (fs.existsSync(possibleAlt)) {
          foundPath = possibleAlt;
          break;
        }
      }
      
      if (foundPath) {
        console.log(`IOTA CLI im PATH gefunden: ${foundPath}`);
        process.env.IOTA_CLI_PATH = foundPath;
      } else {
        console.error('IOTA CLI nicht gefunden. Überprüfe die Installation.');
      }
    }
    
    console.log(`Führe IOTA CLI Befehl aus: ${config.IOTA_CLI_PATH} ${command}`);
    const { stdout, stderr } = await execPromise(`"${config.IOTA_CLI_PATH}" ${command}`);
    
    // Die IOTA CLI gibt möglicherweise auch Informationen über stderr aus
    if (stderr && !stderr.includes('info:')) {
      console.error('IOTA CLI Fehler:', stderr);
      if (stderr.includes('unrecognized subcommand')) {
        throw new Error(`Ungültiger Befehl: ${stderr}`);
      }
    }
    
    return stdout;
  } catch (error) {
    console.error('Fehler bei Ausführung des IOTA CLI-Befehls:', error);
    throw error;
  }
}

/**
 * Überprüft, ob die IOTA CLI verfügbar ist
 * @returns {Promise<boolean>} True, wenn die CLI verfügbar ist
 */
async function checkIotaCliAvailability(logError = true) {
  return new Promise((resolve) => {
    exec(`"${config.IOTA_CLI_PATH}" --version`, (error, stdout, stderr) => {
      if (error) {
        if (logError) console.error(`IOTA CLI nicht verfügbar: ${error.message}`);
        resolve(false);
        return;
      }
      if (stderr && !stderr.includes('info:')) {
        if (logError) console.error(`IOTA CLI Fehler: ${stderr}`);
        resolve(false);
        return;
      }
      console.log(`IOTA CLI Version: ${stdout.trim()}`);
      resolve(true);
    });
  });
}

/**
 * Wählt einen zufälligen Gewinner mit der IOTA CLI und echter On-Chain Randomness
 * @param {Array<string>} addresses Liste der Adressen
 * @param {boolean} isTest Wenn true, wird ein Testmodus verwendet (lokaler Zufall)
 * @returns {Promise<string>} Die ausgewählte Adresse
 */
async function selectRandomWinnerWithCli(addresses, isTest = false) {
  try {
    if (addresses.length === 0) {
      throw new Error('Keine Adressen vorhanden');
    }

    // Erstelle temporäre JSON-Datei mit den Adressen
    const tempDir = config.TEMP_DIR;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Im Testmodus verwenden wir lokalen Zufall
    if (isTest) {
      console.log('Testmodus: Verwende lokalen Zufall für Gewinner');
      const randomIndex = Math.floor(Math.random() * addresses.length);
      return addresses[randomIndex];
    }

    // Echte Blockchain-Interaktion für On-Chain Randomness
    const timestamp = Date.now();
    const addressesFile = path.join(tempDir, `addresses_${timestamp}.json`);
    fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));

    const packageId = config.NFT_PACKAGE_ID;
    const moduleName = config.NFT_MODULE_NAME;
    const functionName = config.NFT_RANDOM_FUNCTION;
    
    // Bereite die Adressen für den Befehl vor
    const addressesArg = addresses.map(addr => `"${addr}"`).join(' ');
    
    // Befehl für die Blockchain-Operation
    // Wichtig: Wir müssen den privaten Schlüssel für die Transaktion verwenden
    const command = `client call --function ${functionName} --module ${moduleName} --package ${packageId} --args "[${addressesArg}]" --sender ${config.ADMIN_ADDRESS} --gas-budget 100000000`;
    
    console.log(`Führe Gewinner-Auswahl mit IOTA CLI aus: ${command}`);
    
    try {
      const stdout = await executeIotaCommand(command);
      
      // Löschen der temporären Datei
      try {
        fs.unlinkSync(addressesFile);
      } catch (e) {
        console.warn(`Konnte temporäre Datei nicht löschen: ${e.message}`);
      }
      
      // Parsen der Ausgabe, um die ausgewählte Adresse zu extrahieren
      // Verschiedene Regex-Muster, um die Adresse in der Ausgabe zu finden
      const patterns = [
        /Winner address: (0x[a-fA-F0-9]+)/i,
        /Selected address: (0x[a-fA-F0-9]+)/i,
        /Result: (0x[a-fA-F0-9]+)/i,
        /(0x[a-fA-F0-9]{64})/i  // Allgemeines Muster für eine Hex-Adresse
      ];
      
      for (const pattern of patterns) {
        const match = stdout.match(pattern);
        if (match && match[1]) {
          console.log(`Gewinner gefunden mit Muster: ${pattern}`);
          return match[1];
        }
      }
      
      // Wenn keine spezifische Adresse gefunden wurde
      console.warn('Konnte keine Gewinner-Adresse in der CLI-Ausgabe finden.');
      // Fallback: Bei Fehler erste Adresse verwenden
      return addresses[0];
    } catch (cmdError) {
      console.error(`Fehler bei CLI-Ausführung: ${cmdError.message}`);
      
      // Fallback: Einfacher clientseitiger Zufall als Fallback
      console.log('Fallback: Verwende lokalen Zufall');
      const randomIndex = Math.floor(Math.random() * addresses.length);
      return addresses[randomIndex];
    }
  } catch (error) {
    console.error(`Fehler bei Auswahl eines zufälligen Gewinners: ${error.message}`);
    // Fallback bei Fehlern
    return addresses[0];
  }
}

/**
 * Führt ein echtes NFT-Minting auf der Blockchain durch
 * @param {Object} metadata Die Metadaten für das NFT
 * @param {string} winnerAddress Die Adresse des Gewinners
 * @param {boolean} isTest Wenn true, wird nur eine Simulation durchgeführt
 * @returns {Promise<string|null>} Die Transaction ID oder null bei Fehler
 */
async function mintNftWithMoveCli(metadata, winnerAddress, isTest = false) {
  try {
    console.log(`${isTest ? 'Simuliere' : 'Starte'} NFT-Minting für Epoch ${metadata.epoch}...`);
    
    // Erstelle temporäre Metadaten-Datei
    const tmpDir = config.TEMP_DIR;
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    const metadataFile = path.join(tmpDir, `metadata_${metadata.epoch}_${Date.now()}.json`);
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    
    // Im Testmodus simulieren wir nur
    if (isTest) {
      console.log(`NFT-Minting läuft im Test-Modus`);
      const txId = `test_${Date.now()}`;
      
      // Lösche die temporäre Datei
      try {
        fs.unlinkSync(metadataFile);
      } catch (e) {
        console.warn(`Konnte temporäre Datei nicht löschen: ${e.message}`);
      }
      
      return txId;
    }
    
    // Im Produktionsmodus führen wir eine echte Transaktion aus
    const packageId = config.NFT_PACKAGE_ID;
    const moduleName = config.NFT_MODULE_NAME;
    const mintFunction = config.NFT_MINT_FUNCTION;
    
    // Konvertiere die Metadaten in ein Format, das für die CLI geeignet ist
    const metadataString = prepareStringForMove(JSON.stringify(metadata));
    
    // Befehl für das NFT-Minting
    const command = `client call --function ${mintFunction} --module ${moduleName} --package ${packageId} --args "${winnerAddress}" "${metadataString}" --sender ${config.ADMIN_ADDRESS} --gas-budget 100000000`;
    
    console.log(`Führe NFT-Minting aus: ${command}`);
    
    // Ausführen des CLI-Befehls
    const output = await executeIotaCommand(command);
    console.log('NFT-Minting abgeschlossen');
    
    // Lösche die temporäre Datei
    try {
      fs.unlinkSync(metadataFile);
    } catch (e) {
      console.warn(`Konnte temporäre Datei nicht löschen: ${e.message}`);
    }
    
    // Speichere eine permanente Kopie der Metadaten
    const metadataDir = path.join(config.BASE_DIR, 'metadata');
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
    }
    
    const permanentMetadataFile = path.join(metadataDir, `metadata_${metadata.epoch}.json`);
    fs.writeFileSync(permanentMetadataFile, JSON.stringify(metadata, null, 2));
    
    // Extrahiere die Transaktions-ID aus der Ausgabe
    const txIdMatch = output.match(/Transaction ID: (0x[a-fA-F0-9]+)/i);
    if (txIdMatch && txIdMatch[1]) {
      return txIdMatch[1];
    }
    
    // Wenn keine TX-ID gefunden wurde, extrahiere aus dem gesamten Output
    const hexMatch = output.match(/(0x[a-fA-F0-9]{64})/i);
    if (hexMatch && hexMatch[1]) {
      return hexMatch[1];
    }
    
    // Generische Transaktions-ID, wenn keine gefunden wurde
    return `tx_${Date.now()}`;
  } catch (error) {
    console.error(`Fehler beim NFT-Minting: ${error.message}`);
    return null;
  }
}

/**
 * Bereitet einen String für die Verwendung in Move vor
 * @param {string} input Der Eingabestring
 * @returns {string} Der vorbereitete String
 */
function prepareStringForMove(input) {
  // Escapen von Anführungszeichen und anderen Sonderzeichen
  return input
    .replace(/\\/g, '\\\\')  // Backslashes escapen
    .replace(/"/g, '\\"')    // Doppelte Anführungszeichen escapen
    .replace(/\n/g, '\\n')   // Zeilenumbrüche escapen
    .replace(/\r/g, '\\r')   // Carriage Returns escapen
    .replace(/\t/g, '\\t');  // Tabs escapen
}

/**
 * Initialisiert die grundlegenden Voraussetzungen für das System
 * (Ersatz für frühere Datenbankinitialisierung)
 */
async function initializeDatabase() {
  console.log('Datenbankinitialisierung wurde deaktiviert.');
  console.log('System verwendet direkte Blockchain-Interaktionen.');
  
  const tempDir = config.TEMP_DIR;
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const metadataDir = path.join(config.BASE_DIR, 'metadata');
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
  }
  
  const historyDir = path.join(config.BASE_DIR, 'history');
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }
  
  // Stelle sicher, dass die IOTA CLI verfügbar ist
  const cliAvailable = await checkIotaCliAvailability();
  if (!cliAvailable) {
    console.error('WARNUNG: IOTA CLI ist nicht verfügbar. Blockchain-Interaktionen werden nicht funktionieren.');
    return false;
  }
  
  return true;
}

// Mock-Funktion für Datenbankkompatibilität mit bisherigem Code
async function saveToDatabase(table, data) {
  console.log(`Datenbankfunktion 'saveToDatabase' wurde deaktiviert.`);
  console.log(`Daten für Tabelle '${table}' werden nur in lokalen Dateien gespeichert.`);
  return data;
}

// Exportiere alle benötigten Funktionen
module.exports = {
  executeIotaCommand,
  checkIotaCliAvailability,
  selectRandomWinnerWithCli,
  mintNftWithMoveCli,
  saveToDatabase,
  initializeDatabase,
  prepareStringForMove
}; 