import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { calculateNextEpochEndTime, EPOCH_START } from '../../../utils/epochUtils'

// Pfad zur JSON-Datei
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'epochContributors.json')

// Typ für die gespeicherten Daten
interface ContributorsData {
  contributors: string[];
  epochNumber: number;
  epochStartTime: string;
  epochEndTime: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    // Standardwerte
    let data: ContributorsData = { 
      contributors: [], 
      epochNumber: 0, 
      epochStartTime: '', 
      epochEndTime: '' 
    }
    
    try {
      if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, 'utf8')
        data = JSON.parse(fileContent)
      } else {
        // Datei existiert noch nicht, initialisiere sie mit aktuellen Epochendaten
        const now = Date.now()
        const nextEpochEnd = calculateNextEpochEndTime().getTime()
        const currentEpochNumber = Math.floor((now - EPOCH_START) / (3 * 24 * 60 * 60 * 1000))
        
        data = {
          contributors: [],
          epochNumber: currentEpochNumber,
          epochStartTime: new Date(now).toISOString(),
          epochEndTime: new Date(nextEpochEnd).toISOString()
        }
        
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8')
      }
    } catch (readError) {
      console.error('Fehler beim Lesen der Daten:', readError)
    }

    // Prüfe, ob wir uns in einer neuen Epoche befinden
    const now = Date.now()
    const currentEpochNumber = Math.floor((now - EPOCH_START) / (3 * 24 * 60 * 60 * 1000))
    
    if (currentEpochNumber !== data.epochNumber) {
      // Neue Epoche, setze Liste zurück
      const nextEpochEnd = calculateNextEpochEndTime().getTime()
      
      data = {
        contributors: [],
        epochNumber: currentEpochNumber,
        epochStartTime: new Date(now).toISOString(),
        epochEndTime: new Date(nextEpochEnd).toISOString()
      }
      
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8')
    }

    return res.status(200).json(data)
  } catch (error: unknown) {
    console.error('Fehler beim Abrufen der Teilnehmer:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return res.status(500).json({ error: 'Interner Serverfehler', details: errorMessage })
  }
} 