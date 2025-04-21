import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import axios from 'axios'

// Konfiguriere formidable für den Datei-Upload
export const config = {
  api: {
    bodyParser: false, // Deaktiviere den Body-Parser, da wir formidable verwenden
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    // Pinata JWT aus den Umgebungsvariablen holen
    const JWT = process.env.PINATA_JWT

    if (!JWT) {
      return res.status(500).json({ error: 'Pinata JWT nicht konfiguriert' })
    }

    // Parse die Multipart-Form-Daten mit formidable
    const form = formidable({ keepExtensions: true })
    
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    // Prüfe, ob eine Datei hochgeladen wurde
    if (!files.file) {
      return res.status(400).json({ error: 'Keine Datei gefunden' })
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    
    // Erstelle FormData für Pinata
    const formData = new FormData()
    
    // Lese die Datei und füge sie zum FormData hinzu
    const fileData = fs.readFileSync(file.filepath)
    formData.append('file', new Blob([fileData]), file.originalFilename || 'file.png')
    
    // Füge Metadaten hinzu, wenn vorhanden
    const metadataField = fields.pinataMetadata
    if (metadataField) {
      const metadata = Array.isArray(metadataField) ? metadataField[0] : metadataField
      formData.append('pinataMetadata', metadata)
    }

    // Mache den Upload zu Pinata
    const pinataResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Authorization': `Bearer ${JWT}`,
        },
      }
    )

    // Gib die IPFS-Daten zurück
    res.status(200).json(pinataResponse.data)
  } catch (error: unknown) {
    console.error('Fehler beim Upload zu Pinata:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    res.status(500).json({ error: 'Fehler beim Hochladen der Datei zu Pinata', details: errorMessage })
  }
} 