import fs from 'fs'
import path from 'path'
const process = require('process')
const Buffer = require('buffer').Buffer

export default function handler(req, res) {
  try {
    // Korrekter Pfad für den Screenshot
    const imagesDir = 'E:/Projekte/Rebased Pixels/NAKAMA/my-app/public/images'

    // Erstelle einen Test-Screenshot
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    const testEpochNumber = 999 // Spezielle Nummer für Test-Screenshots
    const screenshotFileName = `Screenshot-Epoch-${testEpochNumber}-${timestamp}.png`

    // Überprüfe, ob das Verzeichnis existiert
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true })
    }

    // Erstelle den Screenshot (ein Platzhalter-Bild)
    const screenshotPath = path.join(imagesDir, screenshotFileName)
    const placeholderPath = path.join(process.cwd(), 'public', 'images', 'placeholder.png')

    if (fs.existsSync(placeholderPath)) {
      // Platzhalter existiert, kopiere ihn
      fs.copyFileSync(placeholderPath, screenshotPath)
    } else {
      // Erstelle einen einfachen Platzhalter
      const emptyPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
      )
      fs.writeFileSync(screenshotPath, emptyPng)
    }

    // Überprüfe, ob der Screenshot erstellt wurde
    const success = fs.existsSync(screenshotPath)

    // Sende das Ergebnis zurück
    res.status(200).json({
      success,
      message: success ? `Test-Screenshot erstellt: ${screenshotFileName}` : 'Fehler beim Erstellen des Screenshots',
      path: screenshotPath,
      timestamp,
    })
  } catch (error) {
    console.error('Error creating test screenshot:', error)
    res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen des Test-Screenshots',
      error: error.message,
    })
  }
}
