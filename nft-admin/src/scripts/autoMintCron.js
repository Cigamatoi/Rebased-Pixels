#!/usr/bin/env node

/**
 * Automatisiertes NFT-Minting für Rebased Pixels
 * 
 * Dieses Skript führt folgende Aufgaben automatisch aus:
 * 1. Überprüfen auf neue Epochendaten (Wallet-Adressen und Screenshots)
 * 2. Auswählen eines zufälligen Gewinners mittels der Admin-Adresse
 * 3. Minten eines NFTs für den Gewinner
 * 4. Protokollieren des Vorgangs
 * 
 * Ausführung: npm run cron
 */

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Admin-Adresse für die Verwendung in IOTA-Transaktionen
const ADMIN_ADDRESS = '0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5';
const IOTA_CLI_PATH = process.env.IOTA_CLI_PATH || 'C:\\iota\\iota.exe';
const LOG_FILE = path.join(__dirname, '../../logs/auto-mint.log');
const PROCESSED_EPOCHS_FILE = path.join(__dirname, '../../data/processed_epochs.json');
const EXPORTS_DIR = path.join(__dirname, '../../data/exports');
const TEMP_DIR = path.join(__dirname, '../../temp');

// Erstellen Sie die Verzeichnisse, falls sie nicht existieren
setupDirectories();

// Überprüft stündlich auf neue Epochendaten und führt das Minting aus
cron.schedule('0 * * * *', async () => {
    logMessage('Starte automatische Überprüfung auf neue Epochendaten...');
    
    try {
        // 1. Holen der neuesten Exportdateien
        const exports = await getExportedFiles();
        
        if (exports.length === 0) {
            logMessage('Keine Exportdateien gefunden.');
            return;
        }
        
        // 2. Holen der bereits verarbeiteten Epochen
        const processedEpochs = getProcessedEpochs();
        
        // 3. Sortieren der Exporte nach epochNumber absteigend
        const sortedExports = [...exports].sort((a, b) => {
            if (a.epochNumber === null) return 1;
            if (b.epochNumber === null) return -1;
            return b.epochNumber - a.epochNumber;
        });
        
        // 4. Überprüfen, ob die neueste Epoche bereits verarbeitet wurde
        const latestExport = sortedExports[0];
        
        if (!latestExport.epochNumber) {
            logMessage('Neueste Exportdatei hat keine Epochennummer.');
            return;
        }
        
        // 5. Falls die Epoche noch nicht verarbeitet wurde, führe das Minting durch
        if (!processedEpochs.includes(latestExport.epochNumber)) {
            logMessage(`Neue Epoche ${latestExport.epochNumber} gefunden! Starte Verarbeitung...`);
            
            // 6. Lade die Teilnehmerdaten
            const contributors = await loadContributors(latestExport.path);
            
            if (!contributors || !contributors.contributors || contributors.contributors.length === 0) {
                logMessage('Keine Teilnehmer in der Liste gefunden.');
                return;
            }
            
            // 7. Wähle einen zufälligen Gewinner aus
            const winner = await selectRandomWinner(contributors.contributors);
            logMessage(`Zufälliger Gewinner ausgewählt: ${winner}`);
            
            // 8. Generiere Metadaten für das NFT
            const metadata = generateNftMetadata(
                contributors.epochNumber,
                contributors.contributors.length,
                new Date(contributors.epochStartTime),
                new Date(contributors.epochEndTime)
            );
            
            // 9. Bild-URL für das NFT (idealerweise der Screenshot der Epoche)
            const imageUrl = `/api/screenshots/epoch-${contributors.epochNumber}.png`;
            
            // 10. Minte das NFT für den Gewinner
            const mintResult = await mintNft(winner, metadata, imageUrl);
            logMessage(`NFT erfolgreich geminted für ${winner}!`);
            logMessage(`Mint-Ergebnis: ${mintResult}`);
            
            // 11. Markiere die Epoche als verarbeitet
            markEpochAsProcessed(latestExport.epochNumber);
            
        } else {
            logMessage(`Epoche ${latestExport.epochNumber} wurde bereits verarbeitet.`);
        }
    } catch (error) {
        logMessage(`Fehler bei der automatischen Verarbeitung: ${error.message}`);
        console.error(error);
    }
});

/**
 * Erstellt die notwendigen Verzeichnisse
 */
function setupDirectories() {
    const dirs = [
        path.dirname(LOG_FILE),
        path.dirname(PROCESSED_EPOCHS_FILE),
        EXPORTS_DIR,
        TEMP_DIR
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`Erstelle Verzeichnis: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    
    // Initialisiere die Datei für verarbeitete Epochen, falls sie nicht existiert
    if (!fs.existsSync(PROCESSED_EPOCHS_FILE)) {
        fs.writeFileSync(PROCESSED_EPOCHS_FILE, JSON.stringify([]));
    }
}

/**
 * Holt die Liste der exportierten Dateien
 */
async function getExportedFiles() {
    try {
        // In der Produktion würden wir den API-Endpunkt verwenden
        // const response = await axios.get('http://localhost:3002/api/exports');
        // return response.data.exports;
        
        // Für Entwicklungszwecke lesen wir die Dateien direkt
        console.log('Suche Exportdateien in:', EXPORTS_DIR);
        
        if (!fs.existsSync(EXPORTS_DIR)) {
            logMessage(`Exportverzeichnis ${EXPORTS_DIR} existiert nicht. Erstelle es...`);
            fs.mkdirSync(EXPORTS_DIR, { recursive: true });
            return [];
        }
        
        const files = fs.readdirSync(EXPORTS_DIR);
        
        return files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(EXPORTS_DIR, file);
                const stats = fs.statSync(filePath);
                const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                return {
                    path: file,
                    filename: file,
                    exportedAt: stats.mtime.toISOString(),
                    epochNumber: fileContent.epochNumber || null
                };
            });
    } catch (error) {
        logMessage(`Fehler beim Laden der Exportdateien: ${error.message}`);
        return [];
    }
}

/**
 * Lädt die Teilnehmer für eine bestimmte Exportdatei
 */
async function loadContributors(exportPath) {
    try {
        // In der Produktion würden wir den API-Endpunkt verwenden
        // const response = await axios.get(`http://localhost:3002/api/exports/${encodeURIComponent(exportPath)}`);
        // return response.data;
        
        // Für Entwicklungszwecke lesen wir die Datei direkt
        const filePath = path.join(EXPORTS_DIR, exportPath);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        logMessage(`Fehler beim Laden der Teilnehmerdaten: ${error.message}`);
        throw error;
    }
}

/**
 * Wählt einen zufälligen Gewinner mit der IOTA CLI
 */
async function selectRandomWinner(addresses) {
    // Erstellen einer temporären Datei für die Adressen
    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    
    const tempFilePath = path.join(TEMP_DIR, `addresses_${Date.now()}.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify({ addresses }));
    
    try {
        // Admin-Version mit AdminCapability
        const command = `"${IOTA_CLI_PATH}" move call --function select_random_winner_admin --args admin_cap:AdminCapability --addresses-file "${tempFilePath}" --sender ${ADMIN_ADDRESS}`;
        
        const { stdout, stderr } = await execPromise(command);
        
        if (stderr && !stderr.includes('info:')) {
            throw new Error(stderr);
        }
        
        // Extrahiere die gewählte Adresse aus dem Ergebnis
        const match = stdout.match(/Selected winner: (.+)/);
        return match ? match[1].trim() : selectFallbackWinner(addresses);
    } catch (error) {
        logMessage(`Fehler bei der CLI-Auswahl: ${error.message}. Verwende Fallback.`);
        return selectFallbackWinner(addresses);
    } finally {
        // Lösche die temporäre Datei
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

/**
 * Fallback für die Zufallsauswahl, falls die CLI nicht funktioniert
 */
function selectFallbackWinner(addresses) {
    const randomIndex = Math.floor(Math.random() * addresses.length);
    return addresses[randomIndex];
}

/**
 * Generiert Metadaten für das NFT
 */
function generateNftMetadata(epochNumber, contributorsCount, startDate, endDate) {
    return {
        name: `Rebased Pixels - Epoch #${epochNumber}`,
        description: `Ein kollektives Kunstwerk der Epoch #${epochNumber}, erschaffen von ${contributorsCount} Teilnehmern im Rebased Pixels Projekt. Erstellt von ${startDate.toLocaleDateString('de-DE')} bis ${endDate.toLocaleDateString('de-DE')}.`,
        attributes: [
            {
                trait_type: 'Type',
                value: 'Rebased Pixels NFT'
            },
            {
                trait_type: 'Epoch',
                value: epochNumber.toString()
            },
            {
                trait_type: 'Contributors',
                value: contributorsCount.toString()
            },
            {
                trait_type: 'Created',
                value: new Date().toISOString()
            },
            {
                trait_type: 'Creator',
                value: 'Admin'
            }
        ]
    };
}

/**
 * Mintet ein NFT für den Gewinner
 */
async function mintNft(recipientAddress, metadata, imageUrl) {
    // Erstelle ein temporäres JSON mit den Metadaten
    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    
    const tempFilePath = path.join(TEMP_DIR, `temp_metadata_${Date.now()}.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify(metadata));
    
    try {
        // Admin-Version mit AdminCapability
        const mintCommand = `"${IOTA_CLI_PATH}" move call --function mint_nft_admin --args admin_cap:AdminCapability ${recipientAddress} --metadata-file "${tempFilePath}" --image-url "${imageUrl}" --sender ${ADMIN_ADDRESS}`;
        
        const { stdout, stderr } = await execPromise(mintCommand);
        
        if (stderr && !stderr.includes('info:')) {
            throw new Error(stderr);
        }
        
        return stdout;
    } catch (error) {
        logMessage(`Fehler beim Minten des NFTs: ${error.message}`);
        throw error;
    } finally {
        // Lösche die temporäre Datei
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

/**
 * Liest die Liste der bereits verarbeiteten Epochen
 */
function getProcessedEpochs() {
    try {
        return JSON.parse(fs.readFileSync(PROCESSED_EPOCHS_FILE, 'utf8'));
    } catch (error) {
        logMessage(`Fehler beim Lesen der verarbeiteten Epochen: ${error.message}`);
        return [];
    }
}

/**
 * Markiert eine Epoche als verarbeitet
 */
function markEpochAsProcessed(epochNumber) {
    try {
        const processedEpochs = getProcessedEpochs();
        if (!processedEpochs.includes(epochNumber)) {
            processedEpochs.push(epochNumber);
            fs.writeFileSync(PROCESSED_EPOCHS_FILE, JSON.stringify(processedEpochs));
        }
    } catch (error) {
        logMessage(`Fehler beim Markieren der Epoche als verarbeitet: ${error.message}`);
    }
}

/**
 * Schreibt eine Nachricht ins Log
 */
function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    console.log(logEntry.trim());
    
    try {
        fs.appendFileSync(LOG_FILE, logEntry);
    } catch (error) {
        console.error(`Fehler beim Schreiben ins Log: ${error.message}`);
    }
}

// Starte die erste Überprüfung sofort bei Scriptstart
(async () => {
    logMessage('AutoMintCron gestartet. Führe erste Überprüfung durch...');
    try {
        // Die gleiche Logik wie im Cron-Job
        const exports = await getExportedFiles();
        
        if (exports.length === 0) {
            logMessage('Keine Exportdateien gefunden.');
            return;
        }
        
        const processedEpochs = getProcessedEpochs();
        
        const sortedExports = [...exports].sort((a, b) => {
            if (a.epochNumber === null) return 1;
            if (b.epochNumber === null) return -1;
            return b.epochNumber - a.epochNumber;
        });
        
        const latestExport = sortedExports[0];
        
        if (!latestExport.epochNumber) {
            logMessage('Neueste Exportdatei hat keine Epochennummer.');
            return;
        }
        
        if (!processedEpochs.includes(latestExport.epochNumber)) {
            logMessage(`Neue Epoche ${latestExport.epochNumber} gefunden! Starte Verarbeitung...`);
            
            const contributors = await loadContributors(latestExport.path);
            
            if (!contributors || !contributors.contributors || contributors.contributors.length === 0) {
                logMessage('Keine Teilnehmer in der Liste gefunden.');
                return;
            }
            
            const winner = await selectRandomWinner(contributors.contributors);
            logMessage(`Zufälliger Gewinner ausgewählt: ${winner}`);
            
            const metadata = generateNftMetadata(
                contributors.epochNumber,
                contributors.contributors.length,
                new Date(contributors.epochStartTime),
                new Date(contributors.epochEndTime)
            );
            
            const imageUrl = `/api/screenshots/epoch-${contributors.epochNumber}.png`;
            
            const mintResult = await mintNft(winner, metadata, imageUrl);
            logMessage(`NFT erfolgreich geminted für ${winner}!`);
            logMessage(`Mint-Ergebnis: ${mintResult}`);
            
            markEpochAsProcessed(latestExport.epochNumber);
            
        } else {
            logMessage(`Epoche ${latestExport.epochNumber} wurde bereits verarbeitet.`);
        }
    } catch (error) {
        logMessage(`Fehler bei der initialen Verarbeitung: ${error.message}`);
        console.error(error);
    }
})();

// Gib einen Hinweis aus, dass das Skript läuft
console.log('Automatisiertes NFT-Minting-Skript läuft. Überprüfungen werden stündlich durchgeführt.');
console.log(`Log-Datei wird geschrieben nach: ${LOG_FILE}`); 