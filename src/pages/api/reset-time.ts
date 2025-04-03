import { NextApiRequest, NextApiResponse } from 'next'

// Fester Startzeitpunkt für die erste Epoche (2. April 2024, 00:01:00 UTC)
const EPOCH_START = new Date('2024-04-02T00:01:00Z').getTime()
const EPOCH_DURATION_MS = 3 * 24 * 60 * 60 * 1000 // 3 Tage

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const now = Date.now()
    const elapsed = now - EPOCH_START
    const completedEpochs = Math.floor(elapsed / EPOCH_DURATION_MS)
    const nextResetTime = EPOCH_START + (completedEpochs + 1) * EPOCH_DURATION_MS
    const timeRemainingMs = nextResetTime - now

    res.status(200).json({
      lastReset: new Date(EPOCH_START + completedEpochs * EPOCH_DURATION_MS).toISOString(),
      nextReset: new Date(nextResetTime).toISOString(),
      timeRemainingMs
    })
  } catch (error) {
    console.error('Error in reset-time API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 