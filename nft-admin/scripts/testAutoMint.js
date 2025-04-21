/**
 * Test-Skript für das Auto-Mint-System
 * Überprüft die grundlegende Funktionalität ohne tatsächliche IOTA-CLI-Aufrufe
 */

const fs = require('fs');
const path = require('path');

// Konfiguration
const CONFIG = {
  EXPORTS_DIR: path.join(__dirname, '../data/exports'),
  PROCESSED_EPOCHS_FILE: path.join(__dirname, '../data/processed_epochs.json')
};

// Haupt-Testfunktion
async function runTests() {
  try {
    // Überprüfe Verzeichnisstruktur
    console.log('=== Auto-Mint Test ===');
    console.log('Überprüfe Verzeichnisstruktur...');

    // Erstelle benötigte Verzeichnisse
    [
      path.dirname(CONFIG.PROCESSED_EPOCHS_FILE),
      CONFIG.EXPORTS_DIR
    ].forEach(dir => {
      if (!fs.existsSync(dir)) {
        console.log(`Erstelle Verzeichnis: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      } else {
        console.log(`Verzeichnis existiert: ${dir}`);
      }
    });

    // Überprüfe, ob die Datei für verarbeitete Epochen existiert
    if (!fs.existsSync(CONFIG.PROCESSED_EPOCHS_FILE)) {
      console.log(`Erstelle Datei für verarbeitete Epochen: ${CONFIG.PROCESSED_EPOCHS_FILE}`);
      fs.writeFileSync(CONFIG.PROCESSED_EPOCHS_FILE, JSON.stringify([]));
    } else {
      console.log(`Datei für verarbeitete Epochen existiert: ${CONFIG.PROCESSED_EPOCHS_FILE}`);
      try {
        const processedEpochs = JSON.parse(fs.readFileSync(CONFIG.PROCESSED_EPOCHS_FILE, 'utf8'));
        console.log(`Bereits verarbeitete Epochen: ${processedEpochs.join(', ') || 'keine'}`);
      } catch (error) {
        console.error(`Fehler beim Lesen der verarbeiteten Epochen: ${error.message}`);
      }
    }

    // Simuliere Auto-Mint
    await simulateAutoMint();
    
    // Teste andere Komponenten
    testBatchFile();
    testPowerShellScript();
    
    console.log('\n=== Test abgeschlossen ===');
    console.log('Die Grundstruktur für den Auto-Mint-Prozess ist vorhanden.');
    console.log('Um einen echten Mint-Vorgang zu starten, muss die IOTA CLI korrekt installiert sein.');
    
  } catch (error) {
    console.error(`\nFehler während des Tests: ${error.message}`);
  }
}

// Erstelle eine Test-Exportdatei
function createTestExport() {
  // Generiere eine Epochennummer, die noch nicht verarbeitet wurde
  let epochNumber = 1;
  let processedEpochs = [];
  
  try {
    processedEpochs = JSON.parse(fs.readFileSync(CONFIG.PROCESSED_EPOCHS_FILE, 'utf8'));
    while (processedEpochs.includes(epochNumber)) {
      epochNumber++;
    }
  } catch (error) {
    console.log('Konnte verarbeitete Epochen nicht lesen, verwende Epoche 1');
  }

  const testData = {
    epochNumber: epochNumber,
    epochStartTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 Woche zurück
    epochEndTime: new Date().toISOString(),
    contributors: [
      '0xtest1234567890abcdef1234567890abcdef123456',
      '0xtest2234567890abcdef1234567890abcdef123456',
      '0xtest3234567890abcdef1234567890abcdef123456'
    ]
  };

  const filename = `test-epoch-${epochNumber}-${Date.now()}.json`;
  const filePath = path.join(CONFIG.EXPORTS_DIR, filename);
  
  fs.writeFileSync(filePath, JSON.stringify(testData, null, 2));
  console.log(`Test-Exportdatei erstellt: ${filePath}`);
  console.log(`Inhalt: Epoche ${epochNumber} mit ${testData.contributors.length} Teilnehmern`);
  
  return filePath;
}

// Überprüfe IOTA-CLI-Pfad
function checkIOTACLIPath() {
  const iotaCliPath = process.env.IOTA_CLI_PATH || 'C:\\iota\\iota.exe';
  
  if (fs.existsSync(iotaCliPath)) {
    console.log(`IOTA CLI gefunden unter: ${iotaCliPath}`);
    return true;
  } else {
    console.log(`WARNUNG: IOTA CLI nicht gefunden unter: ${iotaCliPath}`);
    console.log('Der tatsächliche Mint-Prozess würde fehlschlagen, aber der Test kann fortgesetzt werden.');
    return false;
  }
}

// Simuliere einen Auto-Mint-Lauf
async function simulateAutoMint() {
  console.log('\n=== Simuliere Auto-Mint-Prozess ===');
  
  // IOTA-CLI-Pfad überprüfen
  checkIOTACLIPath();
  
  // Erstelle Test-Exportdatei
  createTestExport();
  
  console.log('\nDer simulierte Auto-Mint-Prozess würde nun:');
  console.log('1. Die neueste Exportdatei finden');
  console.log('2. Prüfen, ob die Epochennummer bereits verarbeitet wurde');
  console.log('3. Einen zufälligen Gewinner aus den Teilnehmern auswählen');
  console.log('4. Ein NFT für den Gewinner prägen');
  console.log('5. Die Epoche als verarbeitet markieren');
  
  console.log('\nUm den tatsächlichen Prozess zu starten, führen Sie den folgenden Befehl aus:');
  console.log('node scripts/autoMint.js');
}

// Teste die Batchdatei
function testBatchFile() {
  const batchFilePath = path.join(__dirname, '../start-auto-mint.bat');
  
  if (fs.existsSync(batchFilePath)) {
    console.log(`\nBatch-Datei gefunden: ${batchFilePath}`);
    console.log('Die Batch-Datei kann mit folgendem Befehl ausgeführt werden:');
    console.log('start-auto-mint.bat');
  } else {
    console.log(`\nWARNUNG: Batch-Datei nicht gefunden: ${batchFilePath}`);
  }
}

// Teste das PowerShell-Skript
function testPowerShellScript() {
  const psScriptPath = path.join(__dirname, '../schedule-auto-mint.ps1');
  
  if (fs.existsSync(psScriptPath)) {
    console.log(`\nPowerShell-Skript gefunden: ${psScriptPath}`);
    console.log('Das PowerShell-Skript kann mit folgendem Befehl ausgeführt werden:');
    console.log('powershell -ExecutionPolicy Bypass -File schedule-auto-mint.ps1');
  } else {
    console.log(`\nWARNUNG: PowerShell-Skript nicht gefunden: ${psScriptPath}`);
  }
}

// Führe den Test aus
runTests(); 