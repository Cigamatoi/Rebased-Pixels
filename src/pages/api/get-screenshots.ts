import fs from 'fs'
import path from 'path'

import type { NextApiRequest, NextApiResponse } from 'next'

interface ImageData {
  id: string
  url: string
  title: string
  date: string
  epochNumber: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Korrekter Pfad für die Bilder
    const imagesDir = path.join(process.cwd(), 'public', 'images')

    console.log('Suchpfad für Bilder:', imagesDir)

    // Prüfen, ob Verzeichnis existiert
    if (!fs.existsSync(imagesDir)) {
      return res.status(404).json({
        error: 'Images directory not found',
        path: imagesDir,
      })
    }

    // Dateien auflisten
    const files = fs.readdirSync(imagesDir)
    console.log('Gefundene Dateien:', files)

    // Nur Screenshot-Dateien filtern
    const screenshotFiles = files.filter(
      (file) =>
        file.toLowerCase().includes('screenshot') &&
        (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
    )

    console.log('Screenshot-Dateien:', screenshotFiles)

    // Letztes Abrufzeitpunkt aus dem Request holen
    const lastFetchTime = req.query.lastFetch ? new Date(req.query.lastFetch as string).getTime() : 0

    // Bilder-Daten zusammenstellen
    const images: ImageData[] = []

    for (const filename of screenshotFiles) {
      // Datei-Statusinformationen für Erstellungsdatum
      const filePath = path.join(imagesDir, filename)
      const stats = fs.statSync(filePath)

      // Versuchen, Epoch-Nummer aus dem Dateinamen zu extrahieren
      const epochMatch = filename.match(/Epoch[_-](\d+)/i)
      const epochNumber = epochMatch ? parseInt(epochMatch[1], 10) : 0

      const fileModTime = stats.mtime.getTime()

      // Nur neue Bilder hinzufügen (seit dem letzten Abruf)
      if (fileModTime > lastFetchTime) {
        images.push({
          id: `epoch-${epochNumber || filename}`,
          // Standard URL-Pfad für Bilder im public-Verzeichnis
          url: `/images/${filename}`,
          title: `Rebased Pixels Canvas - Epoch ${epochNumber || '?'}`,
          date: stats.mtime.toISOString(),
          epochNumber: epochNumber || 0,
        })
      }
    }

    // Nach Epochennummer sortieren (absteigend)
    const sortedImages = images.sort((a, b) => b.epochNumber - a.epochNumber)

    // Aktuelles Abrufzeitpunkt
    const currentFetchTime = new Date().toISOString()

    // Antwort senden
    return res.status(200).json({
      images: sortedImages,
      totalFiles: files.length,
      totalScreenshots: screenshotFiles.length,
      lastFetch: currentFetchTime,
      searchPath: imagesDir,
    })
  } catch (error) {
    console.error('Error fetching screenshots:', error)
    res.status(500).json({
      error: 'Failed to fetch screenshots',
      message: error instanceof Error ? error.message : String(error),
    })
  }
}
