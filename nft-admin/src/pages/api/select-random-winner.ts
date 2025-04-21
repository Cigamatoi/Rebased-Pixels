import { NextApiRequest, NextApiResponse } from 'next';
import { selectRandomWinnerWithCli, checkCliVersions } from '@/utils/moveCliIntegration';
import { isAdmin } from '@/utils/adminUtils';

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

    const { addresses, senderAddress } = req.body;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ 
        error: 'Fehlende Parameter', 
        message: 'Eine Liste von Adressen ist erforderlich' 
      });
    }

    // Prüfe, ob der Sender die Admin-Adresse ist
    const useAdminAuth = senderAddress ? isAdmin(senderAddress) : false;
    
    if (useAdminAuth) {
      console.log('Admin-Authentifizierung wird verwendet für Zufallsauswahl');
    } else {
      console.log('Standard-Zufallsauswahl wird verwendet (kein Admin)');
    }

    // Wähle einen zufälligen Gewinner - für Nicht-Admins erlauben wir die Auswahl auch,
    // aber nur Admins können später NFTs minten
    const winner = await selectRandomWinnerWithCli(addresses, useAdminAuth);

    res.status(200).json({ 
      success: true, 
      message: useAdminAuth 
        ? 'Zufälligen Gewinner ausgewählt (Admin-Modus)' 
        : 'Zufälligen Gewinner ausgewählt (nur Admin-Benutzer können NFTs minten)', 
      winner,
      isAdmin: useAdminAuth,
      canMintNft: useAdminAuth
    });
  } catch (error: any) {
    console.error('Fehler bei der Auswahl eines zufälligen Gewinners:', error);
    res.status(500).json({ 
      error: 'Fehler bei der Auswahl eines zufälligen Gewinners', 
      message: error.message || 'Unbekannter Fehler' 
    });
  }
} 