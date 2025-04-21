import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

// Pfad zur JSON-Datei mit den aktuellen Teilnehmern
const sourceFilePath = path.join(process.cwd(), 'src', 'data', 'epochContributors.json')

// Ordner für die exportierten Listen
const exportDir = path.join(process.cwd(), 'exports', 'contributors')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    // Prüfe, ob die Quelldatei existiert
    if (!fs.existsSync(sourceFilePath)) {
      return res.status(404).json({ error: 'Keine Teilnehmerliste gefunden' })
    }

    // Stelle sicher, dass der Export-Ordner existiert
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true })
    }

    // Lese die aktuelle Teilnehmerliste
    const fileContent = fs.readFileSync(sourceFilePath, 'utf8')
    const data = JSON.parse(fileContent)

    const { epochNumber, epochEndTime } = data

    // Erzeuge einen Dateinamen mit Epochennummer und Datum
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    const exportFileName = `contributors_epoch_${epochNumber}_${timestamp}.json`
    const exportFilePath = path.join(exportDir, exportFileName)

    // Schreibe die Daten in die Exportdatei
    fs.writeFileSync(exportFilePath, JSON.stringify(data, null, 2), 'utf8')

    // Liste aller exportierten Dateien
    const exportedFiles = fs.readdirSync(exportDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        file,
        path: `/exports/contributors/${file}`,
        epochNumber: file.includes('epoch_') ? 
          parseInt(file.split('epoch_')[1].split('_')[0]) : null,
        exportedAt: file.split('_').pop()?.replace('.json', '')
      }));

    return res.status(200).json({ 
      success: true, 
      message: 'Teilnehmerliste erfolgreich exportiert', 
      exportedFile: exportFileName,
      exportedFilePath: `/exports/contributors/${exportFileName}`,
      allExports: exportedFiles
    })
  } catch (error: unknown) {
    console.error('Fehler beim Exportieren der Teilnehmerliste:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return res.status(500).json({ error: 'Interner Serverfehler', details: errorMessage })
  }
} 