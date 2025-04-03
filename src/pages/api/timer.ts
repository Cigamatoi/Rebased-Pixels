import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Feste Startzeit der Epoche (2. April 2024, 00:01 UTC)
  const epochStart = new Date('2024-04-02T00:01:00Z').getTime()
  const epochDuration = 3 * 24 * 60 * 60 * 1000 // 3 Tage in Millisekunden

  const now = Date.now()
  const elapsed = now - epochStart
  const timeUntilNextEpoch = epochDuration - (elapsed % epochDuration)

  const totalMinutes = Math.floor(timeUntilNextEpoch / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  res.status(200).json({ days, hours, minutes })
} 