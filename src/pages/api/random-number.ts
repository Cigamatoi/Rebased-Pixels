import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API-Handler für On-Chain-Randomness
 * Simuliert Zugriff auf das Random-Objekt an der Adresse 0x8 gemäß IOTA-Dokumentation
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { min, max } = req.body;

    if (typeof min !== 'number' || typeof max !== 'number') {
      return res.status(400).json({ 
        error: 'Ungültige Parameter', 
        message: 'min und max müssen Zahlen sein' 
      });
    }

    if (min >= max) {
      return res.status(400).json({ 
        error: 'Ungültige Bereichsangabe', 
        message: 'min muss kleiner als max sein' 
      });
    }

    try {
      // In einer vollständigen Implementierung würden wir hier tatsächlich
      // eine IOTA Node-API aufrufen, die Zugriff auf das Random-Objekt (0x8) hat
      // Für diese Demo simulieren wir das Ergebnis

      // Simulation eines "sicheren" Zufallszahlengenerators
      // Die Simulation nutzt einen Timestamp als zusätzliche Entropie
      const timestamp = new Date().getTime();
      const randomBytes = new Uint8Array(8);
      
      for (let i = 0; i < 8; i++) {
        // Mische mehrere Quellen für bessere Simulation
        const timestampByte = (timestamp >> (i * 8)) & 0xFF;
        const mathRandom = Math.floor(Math.random() * 256);
        
        // XOR für die Mischung
        randomBytes[i] = timestampByte ^ mathRandom;
      }
      
      // Konvertiere Bytes in eine Zahl und skaliere sie in den gewünschten Bereich
      const randomBuf = Buffer.from(randomBytes);
      const randomValue = randomBuf.readUInt32LE(0) / 0xFFFFFFFF; // Normalisiere auf 0-1
      const randomNumber = Math.floor(randomValue * (max - min)) + min;
      
      res.status(200).json({ 
        number: randomNumber,
        source: 'pseudo-onchain', // In einer echten Implementierung wäre dies 'onchain'
        min,
        max
      });
    } catch (error) {
      console.error('Fehler bei Randomness-Simulation:', error);
      
      // Fallback zu einfacherer Randomness
      const randomNumber = Math.floor(Math.random() * (max - min)) + min;
      
      res.status(200).json({ 
        number: randomNumber,
        source: 'fallback',
        min,
        max
      });
    }
  } catch (error: any) {
    console.error('Fehler bei Random-Number-Generierung:', error);
    res.status(500).json({ 
      error: 'Fehler bei der Zufallszahlenerzeugung', 
      message: error.message || 'Unbekannter Fehler' 
    });
  }
} 