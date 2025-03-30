/**
 * Serverseitige Hilfsfunktionen für die Bildverarbeitung
 */
import fs from 'fs'
import path from 'path'

/**
 * Speichert ein Base64-kodiertes Bild im Verzeichnis public/images
 * @param base64Data Base64-kodierte Bilddaten (mit oder ohne data:image Präfix)
 * @param baseName Basis-Dateiname ohne Erweiterung
 * @returns Pfad zur gespeicherten Datei
 */
export async function saveBase64ImageToPublicDir(
  base64Data: string,
  baseName = 'screenshot'
): Promise<{ filePath: string; publicUrl: string }> {
  try {
    // Base64-Präfix entfernen, falls vorhanden
    const data = base64Data.replace(/^data:image\/\w+;base64,/, '')

    // Base64 in Buffer umwandeln
    const buffer = Buffer.from(data, 'base64')

    // Dateinamen mit Timestamp generieren
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const safeFilename = `${baseName.replace(/[^a-z0-9]/gi, '-')}-${timestamp}`

    // Verzeichnispfad und Dateipfad
    const publicDir = path.join(process.cwd(), 'public', 'images')
    const filePath = path.join(publicDir, `${safeFilename}.png`)

    // Verzeichnis erstellen, falls es nicht existiert
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // Datei schreiben
    await fs.promises.writeFile(filePath, buffer)

    // Öffentliche URL zur Datei
    const publicUrl = `/images/${safeFilename}.png`

    return { filePath, publicUrl }
  } catch (error) {
    console.error('Fehler beim Speichern des Bildes:', error)
    throw error
  }
}
