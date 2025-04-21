import { useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';
import { useCurrentAccount } from '@iota/dapp-kit';
import { useState } from 'react';

// Konstanten für den Smart Contract
const SINGLEPLAYER_PACKAGE_ID = process.env.NEXT_PUBLIC_SINGLEPLAYER_PACKAGE_ID || '0x65775c38e7ef98ffb45fcfbba23cd9af5a5cb2a1716044a7fc5980d28e4bfcd3';
const SINGLEPLAYER_MODULE_NAME = process.env.NEXT_PUBLIC_SINGLEPLAYER_MODULE_NAME || 'singleplayer_paid_nft';
const SINGLEPLAYER_MINT_FUNCTION = process.env.NEXT_PUBLIC_SINGLEPLAYER_MINT_FUNCTION || 'mint_simple_nft';
const COST_IN_IOTA = 5_000_000; // 5 IOTA in Nanos

// Typen für Ergebnisse
export interface NFTMintResult {
  status: string;
  message: string;
  txId?: string;
  success: boolean;
}

export function useNFTMinter() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NFTMintResult | null>(null);

  // Funktion zum Minten des NFTs
  const mintNFT = async (imageUrl: string): Promise<NFTMintResult> => {
    // Prüfen, ob Wallet verbunden ist
    if (!account || !account.address) {
      const errorResult = {
        status: 'error',
        message: 'Wallet nicht verbunden',
        success: false
      };
      setResult(errorResult);
      return errorResult;
    }

    // Prüfen, ob die Bild-URL gültig ist
    if (!imageUrl) {
      const errorResult = {
        status: 'error',
        message: 'Keine gültige Bild-URL',
        success: false
      };
      setResult(errorResult);
      return errorResult;
    }

    try {
      setLoading(true);
      
      // Transaction erstellen
      const tx = new Transaction();
      
      // Erstelle eine Münze für die Zahlung (5 IOTA)
      const payment = tx.splitCoins(tx.gas, [tx.pure.u64(COST_IN_IOTA)]);
      
      // Rufe die NFT-Mint-Funktion mit der Bild-URL auf
      tx.moveCall({
        target: `${SINGLEPLAYER_PACKAGE_ID}::${SINGLEPLAYER_MODULE_NAME}::${SINGLEPLAYER_MINT_FUNCTION}`,
        arguments: [
          payment,
          tx.pure.string(imageUrl)
        ],
      });
      
      // Führe die Transaktion aus und warte auf das Ergebnis
      return new Promise<NFTMintResult>((resolve) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (data: any) => {
              console.log('NFT erfolgreich geminted:', data);
              
              // Extrahiere Transaktions-ID
              const txId = data?.digest || '';
              
              const successResult = {
                status: 'success',
                message: 'NFT erfolgreich geminted',
                txId,
                success: true
              };
              
              setResult(successResult);
              resolve(successResult);
            },
            onError: (error: any) => {
              console.error('Fehler beim Minten des NFTs:', error);
              
              const errorResult = {
                status: 'error',
                message: error instanceof Error ? error.message : 'Unbekannter Fehler',
                success: false
              };
              
              setResult(errorResult);
              resolve(errorResult);
            }
          }
        );
      });
    } catch (error) {
      console.error('Fehler beim Erstellen der Transaktion:', error);
      
      const errorResult = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unbekannter Fehler',
        success: false
      };
      
      setResult(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  return {
    mintNFT,
    loading,
    result
  };
} 