import axios from 'axios';

/**
 * Schnittstelle für einen Randomness-Provider
 */
export interface RandomnessProvider {
  getRandomNumber(min: number, max: number): Promise<number>;
  getRandomIndex(arrayLength: number): Promise<number>;
}

/**
 * Implementierung eines Randomness-Providers, der Random.org verwendet
 */
export class RandomOrgProvider implements RandomnessProvider {
  private readonly apiKey: string;
  
  constructor(apiKey: string = process.env.NEXT_PUBLIC_RANDOM_ORG_API_KEY || '') {
    this.apiKey = apiKey;
  }
  
  /**
   * Generiert eine Zufallszahl zwischen min und max (inklusiv)
   */
  async getRandomNumber(min: number, max: number): Promise<number> {
    try {
      // Fallback für Tests oder wenn kein API-Key verfügbar ist
      if (!this.apiKey) {
        console.warn('Kein Random.org API-Key gefunden, verwende lokalen Fallback');
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      
      const response = await axios.post('https://api.random.org/json-rpc/4/invoke', {
        jsonrpc: '2.0',
        method: 'generateIntegers',
        params: {
          apiKey: this.apiKey,
          n: 1,
          min,
          max,
          replacement: true
        },
        id: 1
      });
      
      if (response.data.error) {
        throw new Error(`Random.org API Fehler: ${response.data.error.message}`);
      }
      
      return response.data.result.random.data[0];
    } catch (error) {
      console.error('Fehler bei der Zufallszahlengenerierung:', error);
      // Fallback bei Fehlern
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
  
  /**
   * Generiert einen zufälligen Index für ein Array der Länge arrayLength
   */
  async getRandomIndex(arrayLength: number): Promise<number> {
    if (arrayLength <= 0) {
      throw new Error('Array muss mindestens ein Element enthalten');
    }
    
    return this.getRandomNumber(0, arrayLength - 1);
  }
}

/**
 * Funktion zum Auswählen eines zufälligen Elements aus einem Array
 * mittels eines Randomness-Providers
 */
export async function selectRandomElement<T>(
  array: T[],
  provider: RandomnessProvider = new RandomOrgProvider()
): Promise<T | null> {
  if (!array || array.length === 0) {
    return null;
  }
  
  const randomIndex = await provider.getRandomIndex(array.length);
  return array[randomIndex];
} 