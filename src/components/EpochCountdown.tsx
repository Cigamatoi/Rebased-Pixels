import { useEffect, useState } from 'react'
import { formatTimeLeft } from '../utils/time'
import styles from '../styles/PixelGame.module.css'

interface EpochCountdownProps {
  onEpochEnd?: () => void
  canvasRef?: React.RefObject<HTMLCanvasElement>
}

export const EpochCountdown: React.FC<EpochCountdownProps> = ({ onEpochEnd, canvasRef }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    const fetchTimeLeft = async () => {
      try {
        const response = await fetch('/api/reset-time')
        const { timeRemainingMs } = await response.json()
        setTimeLeft(timeRemainingMs)
        setIsLoading(false)
      } catch (error) {
        console.error('Fehler beim Laden der verbleibenden Zeit:', error)
        setIsLoading(false)
      }
    }

    fetchTimeLeft()

    // Aktualisiere die Zeit jede Sekunde
    const interval = setInterval(() => {
      setTimeLeft(prev => prev !== null ? Math.max(0, prev - 1000) : null)
    }, 1000)

    // Synchronisiere mit dem Server jede Minute
    const syncInterval = setInterval(fetchTimeLeft, 60 * 1000)

    return () => {
      clearInterval(interval)
      clearInterval(syncInterval)
    }
  }, [])

  // Epochenende-Handler
  useEffect(() => {
    if (timeLeft === 0 && !isResetting) {
      handleEpochEnd()
    }
  }, [timeLeft, isResetting])

  const handleEpochEnd = async () => {
    if (!canvasRef?.current || isResetting) return

    try {
      setIsResetting(true)
      
      // 1. Screenshot erstellen
      const canvas = canvasRef.current
      const screenshot = canvas.toDataURL('image/png')
      
      // 2. Reset durchführen
      const response = await fetch('https://rebasedpixels.herokuapp.com/api/reset-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ screenshot })
      })
      
      const data = await response.json()
      console.log('Reset durchgeführt:', data)
      
      // 3. Callback aufrufen
      if (onEpochEnd) {
        onEpochEnd()
      }
    } catch (error) {
      console.error('Fehler beim Reset:', error)
    } finally {
      setIsResetting(false)
    }
  }

  if (isLoading) {
    return <div>Lade...</div>
  }

  if (timeLeft === null) {
    return <div>Fehler beim Laden der Zeit</div>
  }

  return (
    <div className={styles.timer}>
      <div className={styles.timerIcon}>⏳</div>
      <div className={styles.timerText}>
        {timeLeft === 0 ? (
          'Epochenende'
        ) : (
          <span className={styles.timeValue}>{formatTimeLeft(timeLeft)}</span>
        )}
      </div>
    </div>
  )
}
