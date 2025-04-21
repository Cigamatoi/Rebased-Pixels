import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { isAdmin } from './adminUtils';

const execPromise = promisify(exec);
const MOVE_ANALYZER_PATH = process.env.MOVE_ANALYZER_PATH || 'C:\\iota\\Move-analyzer.exe';
const IOTA_CLI_PATH = process.env.IOTA_CLI_PATH || 'C:\\iota\\iota.exe';
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5';

// Package-IDs
const EPOCH_PACKAGE_ID = process.env.EPOCH_PACKAGE_ID || '0xb14bd4dd3013a01ffda78e8f7d2b69918b4cdbe61df3b3c2e4aa0d1ea06e2cdc';
const NFT_PACKAGE_ID = process.env.NFT_PACKAGE_ID || '0x9a6a9f3e3244ec539a5cdad1823c16b3a3cda3c0aa5fa3beec30d4b7b7a5efda';

/**
 * Führt einen MOVE Analyzer CLI-Befehl aus
 * @param command Der auszuführende MOVE Analyzer CLI-Befehl 
 * @returns Das Ergebnis des Befehls
 */
export async function executeMoveAnalyzerCommand(command: string): Promise<string> {
  try {
    console.log(`Führe MOVE Analyzer Befehl aus: ${MOVE_ANALYZER_PATH} ${command}`);
    const { stdout, stderr } = await execPromise(`"${MOVE_ANALYZER_PATH}" ${command}`);
    
    if (stderr) {
      console.error('MOVE Analyzer CLI Fehler:', stderr);
      throw new Error(stderr);
    }
    
    return stdout;
  } catch (error) {
    console.error('Fehler bei Ausführung des MOVE Analyzer CLI-Befehls:', error);
    throw error;
  }
}

/**
 * Führt einen IOTA CLI-Befehl aus
 * @param command Der auszuführende IOTA CLI-Befehl 
 * @returns Das Ergebnis des Befehls
 */
export async function executeIotaCommand(command: string): Promise<string> {
  try {
    console.log(`Führe IOTA CLI Befehl aus: ${IOTA_CLI_PATH} ${command}`);
    const { stdout, stderr } = await execPromise(`"${IOTA_CLI_PATH}" ${command}`);
    
    if (stderr && !stderr.includes('info:')) { // Ignoriere Info-Nachrichten
      console.error('IOTA CLI Fehler:', stderr);
      throw new Error(stderr);
    }
    
    return stdout;
  } catch (error) {
    console.error('Fehler bei Ausführung des IOTA CLI-Befehls:', error);
    throw error;
  }
}

/**
 * Prüft die aktuelle Version der CLI-Tools
 */
export async function checkCliVersions(): Promise<{moveAnalyzer: string, iota: string}> {
  try {
    const moveAnalyzerVersion = await executeMoveAnalyzerCommand('--version');
    const iotaVersion = await executeIotaCommand('--version');
    
    return {
      moveAnalyzer: moveAnalyzerVersion.trim(),
      iota: iotaVersion.trim()
    };
  } catch (error) {
    console.error('Fehler beim Prüfen der CLI-Versionen:', error);
    return {
      moveAnalyzer: 'Fehler',
      iota: 'Fehler'
    };
  }
}

/**
 * Erstellt ein NFT über die IOTA CLI gemäß der IOTA Move-Dokumentation
 * @param recipientAddress Die Empfänger-Adresse für das NFT
 * @param metadata Die Metadaten für das NFT
 * @param imageUrl Die URL des Bildes für das NFT
 * @param useAdminAuth Ob die Admin-Authentifizierung verwendet werden soll
 * @param customAdminAddress Optionale benutzerdefinierte Admin-Adresse
 */
export async function mintNftWithMoveCli(
  recipientAddress: string, 
  metadata: any, 
  imageUrl: string,
  useAdminAuth: boolean = false,
  customAdminAddress?: string
): Promise<string> {
  // Erstelle ein temporäres JSON mit den Metadaten
  const metadataJson = JSON.stringify(metadata);
  const tempDir = path.join(process.cwd(), 'temp');
  
  // Erstelle das temporäre Verzeichnis, falls es nicht existiert
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempFilePath = path.join(tempDir, `temp_metadata_${Date.now()}.json`);
  
  // Schreibe das JSON in eine temporäre Datei
  fs.writeFileSync(tempFilePath, metadataJson);
  console.log(`Metadaten in ${tempFilePath} gespeichert`);
  
  try {
    // Versuche die IOTA CLI mit den korrekten NFT-Befehlen
    try {
      // Verwende die übergebene Admin-Adresse, wenn sie vorhanden ist, sonst die Standard-Admin-Adresse
      const adminAddress = customAdminAddress || ADMIN_ADDRESS;
      
      // Vorbereiten der Move-Parameter
      const name = prepareStringForMove(metadata.name);
      const description = prepareStringForMove(metadata.description);
      const imageUrlForMove = prepareStringForMove(imageUrl);
      const epochNumber = metadata.attributes?.epoch || 0;
      const contributorsCount = metadata.attributes?.participants || 0;
      
      // Korrekter IOTA CLI-Befehl für mint_nft_admin
      let mintCommand;
      
      if (useAdminAuth) {
        // Admin-Version mit AdminCapability als erstem Parameter
        mintCommand = `move call --package ${NFT_PACKAGE_ID} --module nft_module --function mint_nft_admin --args AdminCapability ${recipientAddress} ${name} ${description} ${imageUrlForMove} ${epochNumber} ${contributorsCount} --sender ${adminAddress}`;
      } else {
        // Standard-Version ohne Admin-Capability
        mintCommand = `move call --package ${NFT_PACKAGE_ID} --module nft_module --function mint_nft --args ${recipientAddress} ${name} ${description} ${imageUrlForMove} ${epochNumber} ${contributorsCount}`;
      }
      
      console.log(`Führe NFT-Mint-Befehl aus: ${mintCommand}`);
      return await executeIotaCommand(mintCommand);
    } catch (iotaError) {
      console.error('Fehler beim Minten mit IOTA CLI:', iotaError);
      throw iotaError;
    }
  } finally {
    // Lösche die temporäre Datei
    try {
      fs.unlinkSync(tempFilePath);
      console.log(`Temporäre Datei ${tempFilePath} gelöscht`);
    } catch (error) {
      console.error('Fehler beim Löschen der temporären Datei:', error);
    }
  }
}

/**
 * Wählt einen zufälligen Gewinner mit IOTA CLI
 * @param addresses Liste von Adressen
 * @param useAdminAuth Ob die Admin-Authentifizierung verwendet werden soll
 */
export async function selectRandomWinnerWithCli(
  addresses: string[],
  useAdminAuth: boolean = false
): Promise<string> {
  try {
    // Erstelle temporäre Datei mit den Adressen
    const tempDir = path.join(process.cwd(), 'temp');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `addresses_${Date.now()}.json`);
    
    // Speichere die Adressliste als Move-kompatibles Format
    const addressesVector = addresses.map(addr => addr).join(', ');
    const vectorCmd = `vector[${addressesVector}]`;
    
    try {
      // Wähle die richtige Funktion basierend auf Admin-Authentifizierung
      const randomFunction = useAdminAuth ? 'select_random_winner_admin' : 'select_random_winner';
      
      let command;
      if (useAdminAuth) {
        // Admin-Version mit AdminCapability als erstem Parameter
        command = `move call --package ${EPOCH_PACKAGE_ID} --module epoch --function ${randomFunction} --args AdminCapability 0x8 ${vectorCmd} --sender ${ADMIN_ADDRESS}`;
      } else {
        // Standard-Version ohne Admin-Capability
        command = `move call --package ${EPOCH_PACKAGE_ID} --module epoch --function ${randomFunction} --args 0x8 ${vectorCmd}`;
      }
      
      console.log(`Führe Zufallsauswahl-Befehl aus: ${command}`);
      const result = await executeIotaCommand(command);
      
      console.log('CLI-Ergebnis:', result);
      
      // Extrahiere die gewählte Adresse aus dem Ergebnis
      // Angepasstes Regex-Pattern je nach Ausgabeformat
      const match = result.match(/Gewählte Adresse: ([0-9a-fx]+)/i) || 
                   result.match(/Selected winner: ([0-9a-fx]+)/i) ||
                   result.match(/Result: ([0-9a-fx]+)/i);
      
      if (match) {
        return match[1].trim();
      } else {
        console.warn('Adresse nicht aus CLI-Ausgabe extrahierbar, verwende erste Adresse als Fallback');
        return addresses[0]; // Fallback
      }
    } finally {
      // Lösche die temporäre Datei wenn sie existiert
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log(`Temporäre Adressdatei ${tempFilePath} gelöscht`);
      }
    }
  } catch (error) {
    console.error('Fehler bei der Auswahl eines zufälligen Gewinners:', error);
    throw error;
  }
}

/**
 * Bereitet einen String für die MOVE-Umgebung vor
 * Nutzt das Konzept, dass Strings in Move Byte-Vektoren sind
 * @param input Der zu konvertierende String
 */
export function prepareStringForMove(input: string): string {
  // In MOVE werden Strings als b"..." Byte-Vektoren dargestellt
  // Entferne problematische Zeichen und ersetze Anführungszeichen
  const safeString = input.replace(/"/g, '\\"').replace(/\n/g, ' ');
  return `b"${safeString}"`;
} 