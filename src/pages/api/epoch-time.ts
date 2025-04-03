import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const now = new Date()
  const nowMs = now.getTime()
  
  // Nächste Epoche endet in 24 Stunden
  const ONE_DAY_MS = 24 * 60 * 60 * 1000
  const timeRemaining = ONE_DAY_MS

  const epochEnd = new Date(nowMs + timeRemaining)

  // Berechne die genaue Restlaufzeit
  const hours = Math.floor(timeRemaining / (60 * 60 * 1000))
  const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000)

  // Debug-Logging
  console.log('Aktuelle Zeit:', now.toISOString())
  console.log('Endzeit:', epochEnd.toISOString())
  console.log('Verbleibende Zeit:', `${hours}h ${minutes}m ${seconds}s`)

  res.status(200).json({ 
    epochEndTime: epochEnd.toISOString(),
    currentTime: now.toISOString(),
    timeRemainingMs: timeRemaining,
    formattedTime: `${hours}h ${minutes}m ${seconds}s`
  })
} 