import { existsSync, mkdirSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'

import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  success: boolean
  url?: string
  message?: string
}

/**
 * API-Route zum Speichern von Bildern im öffentlichen Verzeichnis
 *
 * Erwartet POST-Anfrage mit:
 * - imageData: Base64-kodierte Bilddaten (String)
 * - filename: Dateiname ohne Erweiterung (String)
 *
 * Gibt zurück:
 * - success: true/false
 * - url: Öffentliche URL zum gespeicherten Bild
 * - message: Fehlermeldung bei Misserfolg
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // Nur POST-Methode erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Nur POST-Anfragen erlaubt' })
  }

  try {
    const { imageData, filename = 'screenshot-epoch' } = req.body

    // Prüfe, ob Bilddaten vorhanden sind
    if (!imageData) {
      return res.status(400).json({ success: false, message: 'Keine Bilddaten gefunden' })
    }

    // Parse Base64-Daten
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')

    // Erzeuge Epochen-Dateinamen mit Timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const safeFilename = `${filename.replace(/[^a-z0-9]/gi, '-')}-${timestamp}`

    // Bestimme den Dateipfad (im public/images Verzeichnis)
    const publicDir = path.join(process.cwd(), 'public', 'images')
    const filePath = path.join(publicDir, `${safeFilename}.png`)

    // Stelle sicher, dass das Verzeichnis existiert
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true })
    }

    // Schreibe die Datei
    await fs.writeFile(filePath, base64Data, 'base64')

    // Bestimme die öffentliche URL
    const publicUrl = `/images/${safeFilename}.png`

    console.log(`Bild gespeichert: ${filePath}`)

    // Sende Erfolgsantwort mit URL zum Bild
    return res.status(200).json({
      success: true,
      url: publicUrl,
      message: 'Bild erfolgreich gespeichert',
    })
  } catch (error) {
    console.error('Fehler beim Speichern des Bildes:', error)

    return res.status(500).json({
      success: false,
      message: `Fehler beim Speichern des Bildes: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}
