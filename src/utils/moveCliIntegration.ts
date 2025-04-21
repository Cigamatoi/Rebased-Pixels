import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);
const MOVE_ANALYZER_PATH = process.env.MOVE_ANALYZER_PATH || 'C:\\iota\\Move-analyzer.exe';
const IOTA_CLI_PATH = process.env.IOTA_CLI_PATH || 'C:\\iota\\iota.exe';

/**
 * Führt einen MOVE Analyzer CLI-Befehl aus
 * @param command Der auszuführende MOVE Analyzer CLI-Befehl 
 * @returns Das Ergebnis des Befehls
 */
export async function executeMoveAnalyzerCommand(command: string): Promise<string> {
  try {
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
 */
export async function mintNftWithMoveCli(
  recipientAddress: string, 
  metadata: any, 
  imageUrl: string
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
  
  try {
    // Versuche die IOTA CLI mit den korrekten NFT-Befehlen
    try {
      // Richtige Syntax für IOTA NFT-Mint gemäß Dokumentation
      const mintCommand = `nft create --recipient ${recipientAddress} --metadata-file "${tempFilePath}" --image-url "${imageUrl}"`;
      return await executeIotaCommand(mintCommand);
    } catch (iotaError) {
      console.error('Fehler beim Minten mit IOTA CLI, versuche MOVE Analyzer:', iotaError);
      
      // Versuche als Fallback den MOVE Analyzer
      const analyzerCommand = `nft create --to ${recipientAddress} --metadata-file "${tempFilePath}" --image-url "${imageUrl}"`;
      return await executeMoveAnalyzerCommand(analyzerCommand);
    }
  } finally {
    // Lösche die temporäre Datei
    try {
      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.error('Fehler beim Löschen der temporären Datei:', error);
    }
  }
}

/**
 * Bereitet einen String für die MOVE-Umgebung vor
 * Nutzt das Konzept, dass Strings in Move Byte-Vektoren sind
 * @param input Der zu konvertierende String
 */
export function prepareStringForMove(input: string): string {
  // In MOVE werden Strings als b"..." Byte-Vektoren dargestellt
  // oder mit string::utf8(b"...")
  return `b"${input.replace(/"/g, '\\"')}"`;
} 