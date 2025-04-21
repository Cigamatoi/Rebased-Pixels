/**
 * Scheduler für regelmäßige Ausführung des autoMint-Skripts
 * Speziell für Heroku-Umgebungen optimiert
 */

const { runAutoMint } = require('./autoMint');
const config = require('./config');

// Log-Funktion mit Zeitstempel
function log(message) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${message}`);
}

// Ausführungsintervall in Millisekunden (Standard: 1 Stunde)
const INTERVAL = process.env.AUTO_MINT_INTERVAL ? parseInt(process.env.AUTO_MINT_INTERVAL, 10) : 60 * 60 * 1000;

/**
 * Führt das autoMint-Skript aus und fängt Fehler ab
 */
async function runScheduledTask() {
  try {
    log('Starte geplante Ausführung des autoMint-Skripts...');
    await runAutoMint();
    log('Geplante Ausführung abgeschlossen.');
  } catch (error) {
    log(`Fehler bei der geplanten Ausführung: ${error.message}`);
    console.error(error);
  }
  
  // Plane die nächste Ausführung
  scheduleNextRun();
}

/**
 * Plant die nächste Ausführung
 */
function scheduleNextRun() {
  log(`Nächste Ausführung in ${INTERVAL / 60000} Minuten geplant.`);
  setTimeout(runScheduledTask, INTERVAL);
}

// Initiale Ausführung (verzögert um 5 Sekunden, um sicherzustellen, dass alles initialisiert ist)
log('Scheduler gestartet.');
log(`Ausführungsintervall: ${INTERVAL / 60000} Minuten`);
setTimeout(runScheduledTask, 5000);

// Prozess am Leben halten (für Heroku Worker)
process.on('SIGTERM', () => {
  log('Beende Scheduler-Prozess...');
  process.exit(0);
});

// Vermeide Absturz bei unbehandelten Fehlern
process.on('uncaughtException', (error) => {
  log(`Unbehandelter Fehler: ${error.message}`);
  console.error(error);
});

// Melde am Leben bleiben für Debugging
setInterval(() => {
  log('Scheduler läuft...');
}, 60 * 60 * 1000); // Stündlicher Heartbeat 