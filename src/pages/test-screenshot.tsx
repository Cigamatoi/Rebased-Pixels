import { useState } from 'react'
import Head from 'next/head'

import styles from '../styles/Home.module.css'

export default function TestScreenshot() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testScreenshot = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/test-screenshot')
      const data = await response.json()

      setResult(data)
    } catch (err) {
      setError(`Fehler beim Testen des Screenshots: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Screenshot Test</title>
        <meta name="description" content="Test the screenshot functionality" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Screenshot Test</h1>

        <p className={styles.description}>Klicke auf den Button, um einen Test-Screenshot zu erstellen</p>

        <div className={styles.grid}>
          <button
            onClick={testScreenshot}
            disabled={loading}
            className={styles.card}
            style={{
              cursor: 'pointer',
              backgroundColor: '#1e3a8a',
              color: 'white',
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
            }}
          >
            {loading ? 'Wird erstellt...' : 'Test-Screenshot erstellen'}
          </button>
        </div>

        {error && (
          <div style={{ color: 'red', marginTop: '2rem' }}>
            <h3>Fehler:</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Ergebnis:</h3>
            <pre
              style={{
                background: result.success ? '#d1fae5' : '#fee2e2',
                padding: '1rem',
                borderRadius: '8px',
                overflowX: 'auto',
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
