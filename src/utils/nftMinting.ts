/**
 * NFT-Minting-Hilfsfunktionen für die Rebased Pixels NFT-Admin-Anwendung
 */

/**
 * Generiert einen Namen für das NFT basierend auf der Epoch-Nummer
 * @param epochNumber Die Nummer der Epoch
 * @returns Generierter NFT-Name
 */
export function generateNftName(epochNumber: number | null): string {
  if (epochNumber === null) {
    return "Rebased Pixels NFT";
  }
  return `Rebased Pixels - Epoch #${epochNumber}`;
}

/**
 * Generiert eine Beschreibung für das NFT
 * @param epochNumber Die Nummer der Epoch
 * @param contributorsCount Anzahl der Teilnehmer
 * @returns Generierte NFT-Beschreibung
 */
export function generateNftDescription(epochNumber: number | null, contributorsCount: number): string {
  if (epochNumber === null) {
    return `Ein kollektives Kunstwerk erschaffen von ${contributorsCount} Teilnehmern im Rebased Pixels Projekt.`;
  }
  
  const date = new Date();
  return `Ein kollektives Kunstwerk der Epoch #${epochNumber}, erschaffen von ${contributorsCount} Teilnehmern im Rebased Pixels Projekt. Erstellt am ${date.toLocaleDateString('de-DE')}.`;
}

/**
 * Bereitet eine NFT-Transaktion für IOTA Move vor
 * 
 * @param recipient Empfänger-Adresse
 * @param sender Sender-Adresse
 * @param name Name des NFTs
 * @param description Beschreibung des NFTs
 * @param imageUrl URL des Bildes
 * @returns Vorbereitete Transaktion
 */
export function prepareNftTransaction(
  recipient: string,
  sender: string,
  name: string,
  description: string,
  imageUrl: string
): any {
  // Diese Funktion würde normalerweise eine IOTA Move Transaction vorbereiten
  // Hier stellen wir nur eine einfache Mock-Implementation zur Verfügung
  
  // Ein Transaction-Objekt wäre in der Form:
  const transaction = {
    type: "moveCall",
    target: `${process.env.NEXT_PUBLIC_PACKAGE_ID || '0x0'}::nft_module::mint_nft`,
    arguments: [
      recipient,
      // In IOTA Move werden Strings als byte arrays übergeben
      Buffer.from(name, 'utf8'),
      Buffer.from(description, 'utf8'),
      Buffer.from(imageUrl, 'utf8'),
      Date.now(), // Timestamp als Epoch
    ]
  };
  
  return transaction;
}

/**
 * Bereitet eine Move-CLI-Befehl für NFT-Minting vor
 * @param recipientAddress Empfänger-Adresse
 * @param name Name des NFTs
 * @param description Beschreibung des NFTs
 * @param imageUrl Bild-URL
 * @returns Move-CLI-Befehl als String
 */
export function prepareMoveCliCommand(
  recipientAddress: string,
  name: string,
  description: string,
  imageUrl: string
): string {
  // Bereite einen CLI-Befehl basierend auf der IOTA-Dokumentation vor
  return `nft create --recipient ${recipientAddress} --name "${name}" --description "${description}" --image-url "${imageUrl}"`;
} 