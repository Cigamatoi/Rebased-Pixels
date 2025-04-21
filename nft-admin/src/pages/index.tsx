import { useEffect, useState } from 'react';
import Head from 'next/head';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

import { ContributorsService, ContributorsData, ExportedFileInfo } from '@/utils/contributors';
import { selectRandomElement } from '@/utils/randomOracle';
import { generateNftDescription, generateNftName, prepareNftTransaction } from '@/utils/nftMinting';
import { isAdmin } from '@/utils/adminUtils';
import { mintNftWithApi, selectRandomWinnerWithApi } from '@/utils/cli-client';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [exports, setExports] = useState<ExportedFileInfo[]>([]);
  const [selectedExport, setSelectedExport] = useState<ExportedFileInfo | null>(null);
  const [contributors, setContributors] = useState<ContributorsData | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [nftImageUrl, setNftImageUrl] = useState<string>('');
  const [isMinting, setIsMinting] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const contributorsService = new ContributorsService();

  // Überprüfe, ob der aktuelle Benutzer Admin-Rechte hat
  useEffect(() => {
    if (account) {
      setIsUserAdmin(isAdmin(account.address));
    } else {
      setIsUserAdmin(false);
    }
  }, [account]);

  // Lade die Liste der exportierten Teilnehmerlisten
  useEffect(() => {
    async function loadExports() {
      setIsLoading(true);
      try {
        const exportFiles = await contributorsService.getExportedFiles();
        setExports(exportFiles);
        
        // Wähle standardmäßig die neueste
        if (exportFiles.length > 0) {
          const sorted = [...exportFiles].sort((a, b) => {
            if (a.epochNumber === null) return 1;
            if (b.epochNumber === null) return -1;
            return b.epochNumber - a.epochNumber;
          });
          
          setSelectedExport(sorted[0]);
          await loadContributorsForExport(sorted[0]);
        }
      } catch (error) {
        toast.error('Fehler beim Laden der Export-Dateien');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadExports();
  }, []);
  
  // Lade die Teilnehmer für einen Export
  async function loadContributorsForExport(exportFile: ExportedFileInfo) {
    setIsLoading(true);
    setContributors(null);
    setWinner(null);
    
    try {
      const data = await contributorsService.loadContributors(exportFile.path);
      setContributors(data);
      
      // Lade auch das Bild für diese Epoche
      if (data?.epochNumber) {
        // Hier würde man normalerweise den Screenshot der Epoch laden
        // Vereinfachte Version: Verwende eine Dummy-URL
        setNftImageUrl(`/api/screenshots/epoch-${data.epochNumber}.png`);
      }
    } catch (error) {
      toast.error(`Fehler beim Laden der Teilnehmerliste: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Wähle einen zufälligen Gewinner aus
  async function selectWinner() {
    if (!contributors || !contributors.contributors.length) {
      toast.error('Keine Teilnehmer in der Liste');
      return;
    }
    
    setIsLoading(true);
    try {
      // Führe die Zufallsauswahl durch - für jeden Benutzer möglich
      let winner;
      
      if (account && account.address) {
        // Verwende die API mit der Adresse des aktuellen Benutzers
        winner = await selectRandomWinnerWithApi(
          contributors.contributors,
          account.address
        );
      } else {
        // Fallback zur normalen Zufallsauswahl ohne Benutzeradresse
        winner = await selectRandomElement(contributors.contributors);
      }
      
      setWinner(winner);
      toast.success('Gewinner zufällig ausgewählt!');
      
      // Automatisches Minting mit Admin-Adresse
      await mintNFTWithCLI(winner);
    } catch (error) {
      toast.error(`Fehler bei der Gewinnerauswahl: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Minting mit der MOVE CLI (verwendet immer die Admin-Adresse)
  async function mintNFTWithCLI(winnerAddress: string | null = null) {
    const winnerToUse = winnerAddress || winner;
    
    if (!winnerToUse) {
      toast.error('Kein Gewinner ausgewählt');
      return;
    }
    
    if (!contributors) {
      toast.error('Keine Teilnehmerdaten geladen');
      return;
    }
    
    setIsMinting(true);
    try {
      const name = generateNftName(contributors.epochNumber);
      const description = generateNftDescription(
        contributors.epochNumber, 
        contributors.contributors.length
      );
      
      // Verwende die tatsächliche IPFS-URL aus dem Export oder einen Platzhalter
      const imageUrl = nftImageUrl || 'https://via.placeholder.com/500?text=Rebased+Pixels';
      
      // Rufe den API-Endpunkt über die Client-Funktion auf - immer mit Admin-Adresse
      const data = await mintNftWithApi(
        winnerToUse,
        name,
        description,
        imageUrl
      );
      
      toast.success(`NFT erfolgreich für ${winnerToUse} geminted! (Admin-Modus)`);
      console.log('Mint success with CLI:', data);
    } catch (error) {
      toast.error(`Fehler beim CLI-Minting: ${error}`);
      console.error('Error minting with CLI:', error);
    } finally {
      setIsMinting(false);
    }
  }
  
  return (
    <>
      <Head>
        <title>Rebased Pixels NFT-Admin</title>
        <meta name="description" content="NFT-Verwaltung für Rebased Pixels" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Rebased Pixels NFT-Admin</h1>
          <div className="flex items-center gap-4">
            {isUserAdmin && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                Admin
              </div>
            )}
            <Link href="/cli-check" className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 text-sm">
              CLI-Status
            </Link>
            <ConnectButton />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Linke Spalte: Export-Auswahl und Teilnehmerliste */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Teilnehmerlisten</h2>
            
            {/* Export-Auswahl */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Epoche auswählen:</label>
              <select 
                className="w-full p-2 border rounded"
                value={selectedExport?.path || ''}
                onChange={(e) => {
                  const selected = exports.find(exp => exp.path === e.target.value);
                  if (selected) {
                    setSelectedExport(selected);
                    loadContributorsForExport(selected);
                  }
                }}
                disabled={isLoading || exports.length === 0}
              >
                {exports.length === 0 && (
                  <option value="">Keine Exporte verfügbar</option>
                )}
                {exports.map((exp) => (
                  <option key={exp.path} value={exp.path}>
                    Epoche {exp.epochNumber} - {exp.exportedAt}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Teilnehmerliste */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Teilnehmer:</h3>
              {isLoading ? (
                <p>Lade Daten...</p>
              ) : !contributors ? (
                <p>Keine Teilnehmerdaten geladen</p>
              ) : (
                <>
                  <p className="mb-2">
                    <strong>Epoche #{contributors.epochNumber}</strong>
                  </p>
                  <p className="mb-2">
                    <strong>Zeitraum:</strong> {new Date(contributors.epochStartTime).toLocaleString()} - {new Date(contributors.epochEndTime).toLocaleString()}
                  </p>
                  <p className="mb-2">
                    <strong>Anzahl Teilnehmer:</strong> {contributors.contributors.length}
                  </p>
                  <div className="max-h-60 overflow-y-auto mt-4 border p-2 rounded">
                    <ul className="space-y-1">
                      {contributors.contributors.map((address) => (
                        <li key={address} className={`text-xs ${winner === address ? 'bg-green-100 font-bold' : ''}`}>
                          {address}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Rechte Spalte: Gewinner-Auswahl und NFT-Minting */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">NFT Verwaltung</h2>
            
            {/* Gewinner-Auswahl */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Gewinner auswählen:</h3>
              <div className="mt-6 space-y-4">
                <button 
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                  onClick={selectWinner}
                  disabled={isLoading || !contributors}
                >
                  Gewinner auswählen & NFT minten
                </button>
                
                {/* Manuelle Minting-Option nur anzeigen, wenn bereits ein Gewinner ausgewählt wurde */}
                {winner && (
                  <button
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400"
                    onClick={() => mintNFTWithCLI()}
                    disabled={isMinting || !winner}
                  >
                    {isMinting ? 'Minting...' : 'NFT manuell minten'}
                  </button>
                )}
              </div>
              
              {winner && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="font-semibold">Gewinner:</p>
                  <p className="text-xs break-all">{winner}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <ToastContainer position="bottom-right" />
    </>
  );
} 