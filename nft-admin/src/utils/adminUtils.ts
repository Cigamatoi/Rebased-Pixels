/**
 * Admin-Hilfsfunktionen, die im Browser und auf dem Server funktionieren
 */

// Admin-Adresse aus der Umgebungsvariable
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5';

/**
 * Prüft, ob der Benutzer Admin-Rechte hat (basierend auf der Wallet-Adresse)
 * @param userAddress Die Adresse des Benutzers
 */
export function isAdmin(userAddress: string): boolean {
  return userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
} 