import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface CliVersions {
  moveAnalyzer: string;
  iota: string;
}

export default function CliCheck() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<CliVersions | null>(null);

  useEffect(() => {
    async function checkCliVersions() {
      try {
        const response = await fetch('/api/check-cli');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Fehler beim Prüfen der CLI-Tools');
        }
        
        const data = await response.json();
        setVersions(data);
      } catch (error) {
        console.error('Fehler:', error);
        setError(error instanceof Error ? error.message : 'Unbekannter Fehler');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkCliVersions();
  }, []);

  return (
    <>
      <Head>
        <title>CLI-Check | Rebased Pixels NFT-Admin</title>
        <meta name="description" content="Überprüfung der CLI-Installation" />
      </Head>
      
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">CLI-Installation überprüfen</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Status der CLI-Tools</h2>
          
          {isLoading ? (
            <p>Überprüfe CLI-Installation...</p>
          ) : error ? (
            <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded">
              <h3 className="font-bold">Fehler bei der Überprüfung</h3>
              <p>{error}</p>
              <div className="mt-4">
                <p className="font-semibold">Mögliche Lösungen:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Überprüfe, ob die Pfade in der .env.local Datei korrekt sind</li>
                  <li>Stelle sicher, dass die CLI-Tools installiert sind</li>
                  <li>Überprüfe die Berechtigungen für die Ausführung der EXE-Dateien</li>
                </ul>
              </div>
            </div>
          ) : versions ? (
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <h3 className="font-semibold text-blue-800">MOVE Analyzer:</h3>
                  <p className="font-mono text-sm mt-1">{versions.moveAnalyzer || 'Nicht verfügbar'}</p>
                  <p className="text-xs mt-2 text-blue-600">
                    Pfad: {process.env.NEXT_PUBLIC_MOVE_ANALYZER_PATH || 'C:\\iota\\Move-analyzer.exe'}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <h3 className="font-semibold text-green-800">IOTA CLI:</h3>
                  <p className="font-mono text-sm mt-1">{versions.iota || 'Nicht verfügbar'}</p>
                  <p className="text-xs mt-2 text-green-600">
                    Pfad: {process.env.NEXT_PUBLIC_IOTA_CLI_PATH || 'C:\\iota\\iota.exe'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold">Status:</h3>
                {versions.moveAnalyzer !== 'Fehler' || versions.iota !== 'Fehler' ? (
                  <p className="text-green-600">Mindestens ein CLI-Tool ist verfügbar und kann verwendet werden.</p>
                ) : (
                  <p className="text-red-600">Keine CLI-Tools verfügbar. NFT-Minting über CLI wird nicht funktionieren.</p>
                )}
              </div>
            </div>
          ) : (
            <p>Keine Informationen verfügbar</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Zurück zur Hauptseite
          </Link>
        </div>
      </main>
    </>
  );
} 