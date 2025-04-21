import { NextApiRequest, NextApiResponse } from 'next';
import * as path from 'path';

/**
 * API-Endpunkt, der eine bestimmte Export-Datei zurückgibt
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { path } = req.query;
    
    if (!path || Array.isArray(path)) {
      return res.status(400).json({ error: 'Ungültiger Pfad' });
    }

    // In einer vollständigen Implementierung würden wir hier die Datei lesen
    // Für die Demo liefern wir simulierte Daten zurück
    
    // Extrahiere die Epochennummer aus dem Pfad
    const match = path.match(/epoch-(\d+)/i);
    const epochNumber = match ? parseInt(match[1], 10) : null;
    
    if (epochNumber === null) {
      return res.status(404).json({ error: 'Export nicht gefunden' });
    }
    
    // Simulierte Daten basierend auf der Epochennummer
    const now = new Date();
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() - (epochNumber * 3)); // Jede Epoche ist 3 Tage lang
    
    // Reduzierte Anzahl von simulierten Adressen - nur 5-10 pro Epoche
    const addressCount = 5 + (epochNumber * 2 > 5 ? 5 : epochNumber * 2); // Maximum 10 Adressen
    
    // Erstelle eine Liste mit simulierten Adressen
    const contributors = Array.from({ length: addressCount }, (_, i) => {
      // Erstelle eine zufällige Hex-Adresse
      return `0x${Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
    });
    
    const mockData = {
      epochNumber,
      epochStartTime: startTime.toISOString(),
      epochEndTime: new Date(startTime.getTime() + (3 * 24 * 60 * 60 * 1000)).toISOString(),
      contributors,
      metadata: {
        totalPixelsPlaced: 500 * epochNumber,
        uniqueUsers: contributors.length,
        exportedBy: 'Auto-System'
      }
    };

    res.status(200).json(mockData);
  } catch (error: any) {
    console.error('Fehler beim Abrufen der Export-Datei:', error);
    res.status(500).json({ error: 'Interner Serverfehler', message: error.message });
  }
} 