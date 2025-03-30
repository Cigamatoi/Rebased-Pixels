/**
 * IPFS-Hilfsfunktionen zum Upload von Canvas-Bildern
 */
import { NFTStorage } from 'nft.storage'

// Der kostenlose Demo-API-Key ist nicht mehr gültig
// Ein persönlicher API-Key kann hier eingetragen werden:
// Registriere dich auf https://nft.storage/ und erstelle einen eigenen API-Key
const NFT_STORAGE_KEY = ''

/**
 * Wandelt eine Data-URL in einen Blob um
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new Blob([u8arr], { type: mime })
}

/**
 * Alternative Methode zum "Hochladen" eines Bildes ohne echten IPFS-Upload
 * Erstellt eine Blob-URL, die nur temporär ist, aber für Testzwecke ausreicht
 */
export async function createLocalBlobUrl(canvasDataURL: string): Promise<string> {
  try {
    const blob = dataURLtoBlob(canvasDataURL)

    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Fehler beim Erstellen der Blob-URL:', error)
    throw error
  }
}

/**
 * Lädt ein Canvas-Bild auf IPFS hoch und gibt die URL zurück
 * Hinweis: Diese Funktion benötigt einen gültigen API-Key
 */
export async function uploadCanvasToIPFS(canvasDataURL: string): Promise<string> {
  // Wenn kein API-Key vorhanden ist, verwende die lokale Blob-URL-Methode
  if (!NFT_STORAGE_KEY) {
    console.log('Kein API-Key vorhanden, verwende lokale Blob-URL.')

    return createLocalBlobUrl(canvasDataURL)
  }

  try {
    // Erstellen eines NFTStorage-Clients
    const client = new NFTStorage({ token: NFT_STORAGE_KEY })

    // Data-URL in Blob umwandeln
    const blob = dataURLtoBlob(canvasDataURL)

    // Bild auf IPFS hochladen
    const cid = await client.storeBlob(blob)

    // IPFS-URL zurückgeben (über Gateway für direkte Anzeige)
    return `https://nftstorage.link/ipfs/${cid}`
  } catch (error) {
    console.error('Fehler beim Hochladen auf IPFS:', error)
    console.log('Verwende lokale Blob-URL als Fallback.')

    return createLocalBlobUrl(canvasDataURL)
  }
}

/**
 * Prüft, ob eine URL gültig ist
 */
export async function isValidUrl(url: string): Promise<boolean> {
  try {
    // Bei Blob-URLs wird immer true zurückgegeben
    if (url.startsWith('blob:')) {
      return true
    }

    const response = await fetch(url, { method: 'HEAD' })

    return response.ok
  } catch (error) {
    console.error('Fehler beim Überprüfen der URL:', error)

    return false
  }
}

/**
 * Erstellt NFT-Metadaten im Standard-Format
 */
export function createNFTMetadata(name: string, description: string, imageUrl: string) {
  return {
    name,
    description,
    image: imageUrl,
    attributes: [
      {
        trait_type: 'Typ',
        value: 'NAKAMA Canvas',
      },
      {
        trait_type: 'Erstellt am',
        value: new Date().toISOString(),
      },
    ],
  }
}

/**
 * Lädt ein Bild von einer URL herunter und speichert es als Datei
 * @param url Die URL des Bildes (kann Blob-URL oder normale URL sein)
 * @param filename Der Dateiname für die heruntergeladene Datei (ohne Erweiterung)
 */
export async function downloadImageFromUrl(url: string, filename = 'rebased-pixels'): Promise<void> {
  try {
    // Erstelle einen Link-Element
    const link = document.createElement('a')
    link.href = url

    // Falls es keine Blob-URL ist, müssen wir das Bild zuerst laden und in eine Blob-URL umwandeln
    if (!url.startsWith('blob:')) {
      const response = await fetch(url)
      const blob = await response.blob()
      link.href = URL.createObjectURL(blob)
    }

    // Setze den Dateinamen (mit .png Erweiterung)
    link.download = `${filename}.png`

    // Füge den Link zum DOM hinzu (unsichtbar)
    document.body.appendChild(link)

    // Klick simulieren, um den Download zu starten
    link.click()

    // Link wieder entfernen
    document.body.removeChild(link)

    // Wenn wir eine temporäre Blob-URL erstellt haben, geben wir sie wieder frei
    if (!url.startsWith('blob:') && link.href.startsWith('blob:')) {
      URL.revokeObjectURL(link.href)
    }
  } catch (error) {
    console.error('Fehler beim Herunterladen des Bildes:', error)
    throw error
  }
}

/**
 * Speichert das Bild auf dem Server im public/images Verzeichnis
 * @param canvasDataURL Data URL des Canvas-Bildes
 * @param filename Dateiname ohne Erweiterung
 * @returns Die URL zum gespeicherten Bild
 */
export async function saveImageToServer(canvasDataURL: string, filename = 'epoch-screenshot'): Promise<string> {
  try {
    // API-Endpunkt aufrufen
    const response = await fetch('/api/save-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: canvasDataURL,
        filename,
      }),
    })

    if (!response.ok) {
      throw new Error(`Server-Antwort: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Unbekannter Fehler beim Speichern des Bildes')
    }

    console.log('Bild erfolgreich auf dem Server gespeichert:', data.url)

    return data.url
  } catch (error) {
    console.error('Fehler beim Speichern des Bildes auf dem Server:', error)
    throw error
  }
}
