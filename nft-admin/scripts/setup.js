/**
 * Einrichtungsskript für die RebasedPixels-Anwendung nach Heroku-Deployment
 * Führt die notwendigen Initialisierungsschritte durch:
 * - Datenbanktabellen erstellen
 * - Verzeichnisse erstellen
 * - Begrüßungsnachricht ausgeben
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');
const { initializeDatabase } = require('./moveCliUtil');

// Log-Funktion mit Zeitstempel
function log(message) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${message}`);
}

/**
 * Führt das Setup für die Anwendung durch
 */
async function setupApplication() {
  log('Starte Einrichtung der RebasedPixels-Anwendung...');

  try {
    // 1. Erstelle notwendige Verzeichnisse
    await createDirectories();
    
    // 2. Initialisiere Datenbank, wenn aktiviert
    if (config.USE_DATABASE) {
      log('Initialisiere Datenbank...');
      const success = await initializeDatabase();
      if (success) {
        log('Datenbank erfolgreich initialisiert.');
      } else {
        log('Fehler bei der Datenbankinitialisierung.');
      }
    } else {
      log('Datenbank-Modus ist deaktiviert, überspringe Datenbankinitialisierung.');
    }
    
    // 3. Prüfe Konfigurationswerte und gib Warnungen aus, falls einige fehlen
    checkConfiguration();
    
    // 4. Gib Erfolgsmeldung aus
    log('Einrichtung erfolgreich abgeschlossen.');
    log('RebasedPixels ist bereit zur Verwendung!');
    
    // 5. Zeige URLs für die Anwendung an
    const appName = process.env.HEROKU_APP_NAME || 'deine-app';
    log(`Web-Anwendung: https://${appName}.herokuapp.com`);
    log(`Admin-Bereich: https://${appName}.herokuapp.com/admin`);
    
  } catch (error) {
    log(`Fehler bei der Einrichtung: ${error.message}`);
    console.error(error);
  }
}

/**
 * Erstellt alle notwendigen Verzeichnisse
 */
async function createDirectories() {
  log('Erstelle notwendige Verzeichnisse...');
  
  const directories = [
    config.TEMP_DIR,
    config.LOGS_DIR,
    path.join(__dirname, '../history'),
    path.join(__dirname, '../metadata'),
    path.join(__dirname, '../../exports')
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      log(`Erstelle Verzeichnis: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  log('Verzeichnisse erfolgreich erstellt.');
}

/**
 * Prüft die Konfiguration und gibt Warnungen aus
 */
function checkConfiguration() {
  log('Prüfe Konfiguration...');
  
  // Prüfe erforderliche Konfigurationswerte
  const requiredEnvVars = [
    { name: 'NFT_PACKAGE_ID', value: config.NFT_PACKAGE_ID },
    { name: 'ADMIN_ADDRESS', value: config.ADMIN_ADDRESS }
  ];
  
  let hasWarnings = false;
  
  for (const envVar of requiredEnvVars) {
    if (!envVar.value || envVar.value === '0x' || envVar.value === '0x0') {
      log(`WARNUNG: ${envVar.name} ist nicht konfiguriert.`);
      hasWarnings = true;
    }
  }
  
  if (!hasWarnings) {
    log('Konfiguration ist vollständig.');
  } else {
    log('Es fehlen wichtige Konfigurationswerte. Bitte in den Heroku-Einstellungen ergänzen.');
  }
}

// Führe das Setup aus
if (require.main === module) {
  setupApplication().catch(error => {
    console.error('Kritischer Fehler beim Setup:', error);
    process.exit(1);
  });
}

module.exports = {
  setupApplication
}; 