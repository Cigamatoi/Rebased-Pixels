/**
 * Client-API für den Zugriff auf CLI-Funktionen vom Browser aus
 * Diese Datei enthält keine Node.js-Module und ist browser-kompatibel
 */

import { isAdmin } from './adminUtils';

// Admin-Adresse als Konstante
const ADMIN_ADDRESS = '0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5';

/**
 * Mint ein NFT mit der CLI über den API-Endpunkt
 * Verwendet immer die Admin-Adresse für das Minting
 */
export async function mintNftWithApi(
  recipientAddress: string,
  name: string,
  description: string,
  imageUrl: string,
  senderAddress?: string
): Promise<any> {
  try {
    const response = await fetch('/api/mint-with-cli', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientAddress,
        name,
        description,
        imageUrl,
        // Automatisch Admin-Adresse verwenden
        adminAddress: ADMIN_ADDRESS
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Fehler beim Minten des NFTs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Minten mit CLI:', error);
    throw error;
  }
}

/**
 * Wähle einen zufälligen Gewinner über den API-Endpunkt
 */
export async function selectRandomWinnerWithApi(
  addresses: string[],
  senderAddress?: string
): Promise<string> {
  try {
    const response = await fetch('/api/select-random-winner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addresses,
        senderAddress // Optional für Admin-Prüfung
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Fehler bei der Auswahl eines zufälligen Gewinners');
    }
    
    const data = await response.json();
    return data.winner;
  } catch (error) {
    console.error('Fehler bei der Zufallsauswahl:', error);
    throw error;
  }
}

/**
 * Prüfe den Status der CLI-Tools
 */
export async function checkCliStatus(): Promise<{moveAnalyzer: string, iota: string}> {
  try {
    const response = await fetch('/api/cli-status');
    
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen des CLI-Status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Abrufen des CLI-Status:', error);
    return {
      moveAnalyzer: 'Fehler',
      iota: 'Fehler'
    };
  }
} 