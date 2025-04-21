import { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

/**
 * API-Endpunkt, der alle verfügbaren Export-Dateien zurückgibt
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // In einer vollständigen Implementierung würden wir hier das Verzeichnis scannen
    // Für die Demo liefern wir simulierte Daten zurück
    const mockExports = [
      {
        path: 'exports/epoch-1.json',
        filename: 'epoch-1.json',
        exportedAt: new Date().toISOString(),
        epochNumber: 1
      },
      {
        path: 'exports/epoch-2.json',
        filename: 'epoch-2.json',
        exportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        epochNumber: 2
      },
      {
        path: 'exports/epoch-3.json',
        filename: 'epoch-3.json',
        exportedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        epochNumber: 3
      }
    ];

    res.status(200).json({ exports: mockExports });
  } catch (error: any) {
    console.error('Fehler beim Abrufen der Export-Dateien:', error);
    res.status(500).json({ error: 'Interner Serverfehler', message: error.message });
  }
} 