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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    // Wallet-Adresse aus dem Request-Body lesen
    const { address } = req.body

    if (!address) {
      return res.status(400).json({ error: 'Wallet-Adresse ist erforderlich' })
    }

    // Aktuelle Daten lesen
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
      }
    } catch (readError) {
      console.error('Fehler beim Lesen der Daten:', readError)
    }

    // Prüfen, ob wir eine neue Epoche haben
    const now = Date.now()
    const nextEpochEnd = calculateNextEpochEndTime().getTime()
    const currentEpochNumber = Math.floor((now - EPOCH_START) / (3 * 24 * 60 * 60 * 1000))
    
    // Wenn eine neue Epoche begonnen hat, setzen wir die Liste zurück
    if (currentEpochNumber !== data.epochNumber) {
      data = {
        contributors: [],
        epochNumber: currentEpochNumber,
        epochStartTime: new Date(now).toISOString(),
        epochEndTime: new Date(nextEpochEnd).toISOString()
      }
    }

    // Adresse hinzufügen, wenn sie noch nicht in der Liste ist
    if (!data.contributors.includes(address)) {
      data.contributors.push(address)
      
      // Daten speichern
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8')
      
      return res.status(200).json({ 
        success: true, 
        message: 'Teilnehmer hinzugefügt', 
        contributorsCount: data.contributors.length 
      })
    } else {
      return res.status(200).json({ 
        success: true, 
        message: 'Teilnehmer bereits in der Liste', 
        contributorsCount: data.contributors.length 
      })
    }
  } catch (error: unknown) {
    console.error('Fehler beim Hinzufügen des Teilnehmers:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return res.status(500).json({ error: 'Interner Serverfehler', details: errorMessage })
  }
} 