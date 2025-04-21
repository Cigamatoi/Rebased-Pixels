import { NextApiRequest, NextApiResponse } from 'next';
import { checkCliVersions } from '@/utils/moveCliIntegration';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Hole die Versionen der CLI-Tools
    const versions = await checkCliVersions();
    
    // Gib die Versionen zurück
    res.status(200).json(versions);
  } catch (error) {
    console.error('Fehler beim Überprüfen der CLI-Tools:', error);
    res.status(500).json({ 
      error: 'Fehler beim Überprüfen der CLI-Tools', 
      message: error instanceof Error ? error.message : String(error)
    });
  }
} 