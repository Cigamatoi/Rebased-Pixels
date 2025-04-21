import { NextApiRequest, NextApiResponse } from 'next';
import { checkCliVersions } from '@/utils/moveCliIntegration';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Überprüfe die CLI-Tools
    const versions = await checkCliVersions();
    
    res.status(200).json(versions);
  } catch (error: any) {
    console.error('Fehler beim Prüfen der CLI-Versionen:', error);
    res.status(500).json({ 
      error: 'Fehler beim Prüfen der CLI-Versionen', 
      message: error.message || 'Unbekannter Fehler',
      moveAnalyzer: 'Fehler',
      iota: 'Fehler'
    });
  }
} 