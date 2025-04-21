// Entferne den fehlerhaften Import und verwende eine allgemeine Typdeklaration
// import { Transaction } from '@iota/sdk-wasm/web';

// NFT-Metadaten Interface
export interface NftMetadata {
  name: string;
  description: string;
  image: string;
  timestamp: string;
}

// Erweiterte Transaktion für NFTs - generischer Typ ohne direkte Abhängigkeit
export interface NftTransaction {
  tag?: string;
  targetAddress?: string;
  metadata?: NftMetadata;
  includeStorageDeposit?: boolean;
  type?: string;
  issuer?: string;
}

/**
 * Bereitet eine NFT-Mint-Transaktion vor
 * @param winnerAddress Die Wallet-Adresse des Gewinners
 * @param issuerAddress Die Wallet-Adresse des NFT-Erstellers
 * @param name Name des NFTs
 * @param description Beschreibung des NFTs
 * @param imageUrl URL des Bildes für den NFT
 * @returns Die vorbereitete NFT-Transaktion
 */
export function prepareNftTransaction(
  winnerAddress: string,
  issuerAddress: string,
  name: string,
  description: string,
  imageUrl: string
): any {
  // Metadaten für das NFT
  const metadata: NftMetadata = {
    name,
    description,
    image: imageUrl,
    timestamp: new Date().toISOString(),
  };

  // Erstelle eine NFT-Transaktion
  const nftTx: any = {
    // NFT-spezifische Eigenschaften
    type: 'NFT_MINT',
    recipientAddress: winnerAddress,
    issuerAddress: issuerAddress,
    metadata,
    includeStorageDeposit: true,
  };

  return nftTx;
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