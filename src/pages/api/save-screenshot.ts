import * as fs from 'fs'
import path from 'path'

import type { NextApiRequest, NextApiResponse } from 'next'

interface ResponseData {
  success: boolean
  message: string
  imagePath?: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // Nur POST-Anfragen akzeptieren
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Nur POST-Methode erlaubt' })
  }

  try {
    const { imageData, fileName } = req.body

    if (!imageData || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'Bilddaten und Dateiname sind erforderlich',
      })
    }

    // Base64-Header entfernen, um die reinen Daten zu bekommen
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')

    // Absoluter Pfad zum Speichern der Bilder
    const dirPath = path.join(process.cwd(), 'public', 'images')
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    // Vollständigen Pfad für die Datei erstellen
    const filePath = path.join(dirPath, fileName)

    // Datei speichern - Node.js fs Modul erwartet einen Buffer
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Fehler beim Schreiben der Datei:', err)

        return res.status(500).json({
          success: false,
          message: 'Fehler beim Speichern des Screenshots',
        })
      }

      // Erfolgreiche Antwort senden
      return res.status(200).json({
        success: true,
        message: 'Screenshot erfolgreich gespeichert',
        imagePath: `/images/${fileName}`,
      })
    })

    // Diese Zeile sollte nie erreicht werden, da die Antwort in der Callback-Funktion gesendet wird
    return
  } catch (error) {
    console.error('Fehler beim Speichern des Screenshots:', error)

    return res.status(500).json({
      success: false,
      message: 'Fehler beim Speichern des Screenshots',
    })
  }
}
