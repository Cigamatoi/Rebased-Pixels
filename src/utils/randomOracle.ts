/**
 * Randomness-Utility für die NFT-Admin-Anwendung
 * Nutzt On-Chain-Randomness von IOTA (Random Objekt an Adresse 0x8)
 */

import axios from 'axios';

/**
 * Konfiguration für die Randomness
 */
interface RandomnessConfig {
  // Fallback für den Fall, dass On-Chain-Randomness nicht verfügbar ist
  useFallback: boolean; 
  // Die IOTA-Adresse für das Random-Objekt
  randomObjectAddress: string;
}

// Standardkonfiguration
const config: RandomnessConfig = {
  useFallback: false,
  randomObjectAddress: '0x8' // Gemäß IOTA-Dokumentation
};

/**
 * Generiert eine Zufallszahl mit On-Chain-Randomness in einem bestimmten Bereich
 * @param min Minimaler Wert (inklusive)
 * @param max Maximaler Wert (exklusive)
 * @returns Zufallszahl zwischen min und max
 */
export async function getRandomNumberInRange(min: number, max: number): Promise<number> {
  try {
    if (config.useFallback) {
      // Fallback zu lokaler Randomness bei Problemen
      return Math.floor(Math.random() * (max - min)) + min;
    }

    // Greife auf On-Chain-Randomness über API zu
    const response = await axios.post('/api/random-number', {
      min,
      max,
      address: config.randomObjectAddress
    });

    return response.data.number;
  } catch (error) {
    console.error('Fehler bei On-Chain-Randomness, nutze Fallback:', error);
    // Bei Fehler Fallback auf lokale Randomness
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

/**
 * Wählt ein zufälliges Element aus einem Array von Elementen
 * Nutzt On-Chain-Randomness
 * @param items Array von Elementen
 * @returns Ein zufällig ausgewähltes Element
 */
export async function selectRandomElement<T>(items: T[]): Promise<T> {
  if (!items.length) {
    throw new Error('Das Array darf nicht leer sein');
  }
  
  const randomIndex = await getRandomNumberInRange(0, items.length);
  return items[randomIndex];
}

/**
 * Konfiguration der Randomness anpassen
 * @param newConfig Neue Konfiguration
 */
export function configureRandomness(newConfig: Partial<RandomnessConfig>): void {
  Object.assign(config, newConfig);
} 