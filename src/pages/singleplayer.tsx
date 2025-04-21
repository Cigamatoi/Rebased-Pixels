import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  ConnectButton,
  useCurrentAccount,
  useCurrentWallet,
} from '@iota/dapp-kit'
import styles from '~/styles/PixelGame.module.css'

// Constants for the singleplayer NFT contract 
const SINGLEPLAYER_PACKAGE_ID = process.env.NEXT_PUBLIC_SINGLEPLAYER_PACKAGE_ID || '0x65775c38e7ef98ffb45fcfbba23cd9af5a5cb2a1716044a7fc5980d28e4bfcd3'
const SINGLEPLAYER_MODULE_NAME = process.env.NEXT_PUBLIC_SINGLEPLAYER_MODULE_NAME || 'singleplayer_paid_nft'
const SINGLEPLAYER_MINT_FUNCTION = process.env.NEXT_PUBLIC_SINGLEPLAYER_MINT_FUNCTION || 'mint_simple_nft'
const COST_IN_IOTA = 5
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || 'rms1qz5zu9qs5jmn07sxcdpmty0qdj89qpgwt536xjjq3an8lec0gg0qcepgrxx'

// Types for wallet connection result
interface WalletConnectionResult {
  status: string
  message: string
  address?: string
}

// The Singleplayer component
export default function Singleplayer({ hideNavbar = false }: { hideNavbar?: boolean }) {
  const router = useRouter()
  const account = useCurrentAccount()
  const { connectionStatus } = useCurrentWallet()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [walletConnectionResult, setWalletConnectionResult] = useState<WalletConnectionResult | null>(null)

  // Funktion zum Abrufen des Canvas-Bildes vom iframe
  const getCanvasImage = (): string => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      console.error('iframe nicht gefunden oder contentWindow nicht verfügbar');
      return '';
    }
    
    try {
      // Rufe die prepareCanvasImage-Funktion im iframe auf
      const contentWindow = iframeRef.current.contentWindow as any;
      if (typeof contentWindow.prepareCanvasImage === 'function') {
        const imageData = contentWindow.prepareCanvasImage();
        // Prüfe, ob das Ergebnis ein String ist
        if (typeof imageData === 'string') {
          return imageData;
        } else {
          console.error('prepareCanvasImage hat keinen String zurückgegeben');
          return '';
        }
      } else {
        console.error('prepareCanvasImage-Funktion im iframe nicht gefunden');
        return '';
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Canvas-Bildes:', error);
      return '';
    }
  }

  // Make wallet connection function available for the iframe
  useEffect(() => {
    if (iframeLoaded && router && account) {
      // Verbesserte Methode, um die Funktionen explizit an das iframe zu übergeben
      if (iframeRef.current && iframeRef.current.contentWindow) {
        console.log('Übergebe connectIOTAWallet an das iframe...');
        
        // Explizit die Funktionen dem iframe-Fenster zuweisen
        (iframeRef.current.contentWindow as any).connectIOTAWallet = async (): Promise<WalletConnectionResult> => {
          console.log('connectIOTAWallet im iframe aufgerufen');
          return window.connectIOTAWallet!();
        };
        
        console.log('Funktionen wurden dem iframe zugewiesen');
      }

      // Declare the connectIOTAWallet function to be called from the iframe
      window.connectIOTAWallet = async (): Promise<WalletConnectionResult> => {
        try {
          // Überprüfe, ob die Wallet bereits verbunden ist
          if (account && account.address) {
            console.log('Wallet already connected:', account.address)
            return { 
              status: 'connected', 
              address: account.address,
              message: 'Wallet connected'
            }
          }
          
          // Simuliere einen Klick auf den Connect-Button, wenn nicht verbunden
          console.log('Requesting wallet connection...')
          const connectButton = document.querySelector('[data-testid="connect-wallet-button"]') as HTMLButtonElement
          if (connectButton) {
            console.log('Automatically clicking Connect button...')
            connectButton.click()
            
            // Neuer Ansatz: Warte auf Verbindung mit Promise und Timeout
            return new Promise((resolve) => {
              let attempts = 0
              const checkInterval = setInterval(() => {
                attempts++
                
                // Prüfe, ob die Wallet jetzt verbunden ist
                if (account && account.address) {
                  clearInterval(checkInterval)
                  console.log('Wallet successfully connected:', account.address)
                  resolve({ 
                    status: 'connected', 
                    address: account.address,
                    message: 'Wallet connected'
                  })
                }
                
                // Nach 30 Sekunden aufgeben
                if (attempts >= 30) {
                  clearInterval(checkInterval)
                  console.log('Timeout waiting for wallet connection')
                  resolve({ 
                    status: 'error', 
                    message: 'Timeout waiting for wallet connection'
                  })
                }
              }, 1000) // Prüfe jede Sekunde
            })
          } else {
            console.error('Connect button not found')
            return { 
              status: 'error', 
              message: 'Connect button not found' 
            }
          }
        } catch (error) {
          console.error('Error connecting wallet:', error)
          return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      }
    }

    return () => {
      // Clean up
      if (window) {
        window.connectIOTAWallet = undefined;
        
        // Auch im iframe aufräumen
        if (iframeRef.current && iframeRef.current.contentWindow) {
          (iframeRef.current.contentWindow as any).connectIOTAWallet = undefined;
        }
      }
    }
  }, [iframeLoaded, router, account]);

  return (
    <div className={hideNavbar ? styles.pixelGameContainerFullscreen : styles.pixelGameContainer}>
      {!hideNavbar && (
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerTitle}>REBASED PIXELS</div>
            <div className={styles.headerButtons}>
              <ConnectButton className={styles.connectWalletButton} />
              <button onClick={() => router.push('/start')} className={styles.backButton}>
                ← Back
              </button>
            </div>
          </div>
        </header>
      )}

      <div className={styles.gameInfo}>
        <h2>Singleplayer Mode</h2>
        <p>Draw freely without blockchain transactions. Create amazing pixel art with various tools!</p>
      </div>

      <div className={styles.gameContainer}>
        <iframe 
          id="singleplayer-iframe"
          ref={iframeRef}
          src="/singleplayer.html" 
          style={{
            width: '100%',
            border: 'none',
            overflow: 'hidden',
            minHeight: '600px',
          }}
          title="Singleplayer Pixel Editor"
          onLoad={() => {
            setIframeLoaded(true);
            
            // Sofort nach dem Laden des iframes die Funktionen zuweisen
            if (iframeRef.current && iframeRef.current.contentWindow) {
              console.log('Weise Funktionen dem iframe direkt nach dem Laden zu...');
              
              // Definiere connectIOTAWallet im iframe
              (iframeRef.current.contentWindow as any).connectIOTAWallet = async (): Promise<WalletConnectionResult> => {
                console.log('connectIOTAWallet im iframe aufgerufen');
                
                try {
                  // Überprüfe, ob die Wallet bereits verbunden ist
                  if (account && account.address) {
                    console.log('Wallet already connected:', account.address)
                    return { 
                      status: 'connected', 
                      address: account.address,
                      message: 'Wallet connected'
                    }
                  }
                  
                  // Simuliere einen Klick auf den Connect-Button, wenn nicht verbunden
                  console.log('Requesting wallet connection...')
                  const connectButton = document.querySelector('[data-testid="connect-wallet-button"]') as HTMLButtonElement
                  if (connectButton) {
                    console.log('Automatically clicking Connect button...')
                    connectButton.click()
                    
                    // Neuer Ansatz: Warte auf Verbindung mit Promise und Timeout
                    return new Promise((resolve) => {
                      let attempts = 0
                      const checkInterval = setInterval(() => {
                        attempts++
                        
                        // Prüfe, ob die Wallet jetzt verbunden ist
                        if (account && account.address) {
                          clearInterval(checkInterval)
                          console.log('Wallet successfully connected:', account.address)
                          resolve({ 
                            status: 'connected', 
                            address: account.address,
                            message: 'Wallet connected'
                          })
                        }
                        
                        // Nach 30 Sekunden aufgeben
                        if (attempts >= 30) {
                          clearInterval(checkInterval)
                          console.log('Timeout waiting for wallet connection')
                          resolve({ 
                            status: 'error', 
                            message: 'Timeout waiting for wallet connection'
                          })
                        }
                      }, 1000) // Prüfe jede Sekunde
                    })
                  } else {
                    console.error('Connect button not found')
                    return { 
                      status: 'error', 
                      message: 'Connect button not found' 
                    }
                  }
                } catch (error) {
                  console.error('Error connecting wallet:', error)
                  return {
                    status: 'error',
                    message: error instanceof Error ? error.message : 'Unknown error',
                  }
                }
              };
              
              console.log('Funktionen wurden dem iframe direkt zugewiesen');
            }
          }}
        ></iframe>
      </div>

      <footer className={styles.pageFooter}>From Ciga with love - powered by IOTA Rebased Testnet</footer>
    </div>
  )
}

// Declare global types for the window object
declare global {
  interface Window {
    connectIOTAWallet?: () => Promise<WalletConnectionResult>
    prepareCanvasImage?: () => string
  }
}
