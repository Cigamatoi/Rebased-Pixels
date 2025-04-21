import { NextApiRequest, NextApiResponse } from 'next';
import { mintNftWithMoveCli, checkCliVersions } from '@/utils/moveCliIntegration';
import { isAdmin } from '@/utils/adminUtils';

// Admin-Adresse als Konstante
const ADMIN_ADDRESS = '0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Zuerst überprüfen wir, ob die CLI-Tools verfügbar sind
    try {
      const versions = await checkCliVersions();
      console.log('CLI-Versionen:', versions);
    } catch (versionError) {
      return res.status(500).json({
        error: 'CLI-Tools nicht verfügbar',
        message: 'Die IOTA/MOVE CLI-Tools wurden nicht gefunden oder sind nicht korrekt konfiguriert',
        details: versionError instanceof Error ? versionError.message : String(versionError)
      });
    }

    const { recipientAddress, name, description, imageUrl, adminAddress } = req.body;

    if (!recipientAddress || !name || !description || !imageUrl) {
      return res.status(400).json({ 
        error: 'Fehlende Parameter', 
        message: 'Recipient address, name, description und imageUrl sind erforderlich' 
      });
    }

    // Die Admin-Adresse aus dem Request-Body oder die Standard-Admin-Adresse verwenden
    const adminToUse = adminAddress || ADMIN_ADDRESS;
    
    // Immer Admin-Authentifizierung verwenden, unabhängig vom Sender
    console.log(`Admin-Authentifizierung wird mit Adresse ${adminToUse} verwendet`);

    // Erstelle Metadaten-Objekt
    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes: [
        {
          trait_type: 'Type',
          value: 'Rebased Pixels NFT'
        },
        {
          trait_type: 'Created',
          value: new Date().toISOString()
        },
        {
          trait_type: 'Creator',
          value: 'Admin'
        }
      ]
    };

    // Rufe die CLI-Funktion zum Minten mit Admin-Flag auf und nutze die Admin-Adresse
    const result = await mintNftWithMoveCli(recipientAddress, metadata, imageUrl, true, adminToUse);

    res.status(200).json({ 
      success: true, 
      message: 'NFT erfolgreich mit Admin-Berechtigung geminted', 
      result,
      isAdmin: true,
      adminAddress: adminToUse
    });
  } catch (error: any) {
    console.error('Fehler beim Minten des NFTs:', error);
    res.status(500).json({ 
      error: 'Fehler beim Minten des NFTs', 
      message: error.message || 'Unbekannter Fehler' 
    });
  }
} 