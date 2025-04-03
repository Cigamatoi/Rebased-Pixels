import { useEffect, useState, useRef } from 'react'
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

  // Server-Sync alle 60 Sekunden
  useEffect(() => {
    const fetchResetTime = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('https://rebasedpixels.herokuapp.com/api/reset-time')
        const data = await response.json()
        setTimeLeft(data.timeRemainingMs)
      } catch (error) {
        console.error('Fehler beim Laden der Reset-Zeit:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResetTime()
    const interval = setInterval(fetchResetTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Lokaler Countdown jede Sekunde
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return 0
        return Math.max(prev - 1000, 0)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

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

  return (
    <div className={styles.timer}>
      <div className={styles.timerIcon}>⏳</div>
      <div className={styles.timerText}>
        {isLoading || timeLeft === null ? (
          '⏳ Lade...'
        ) : (
          <span className={styles.timeValue}>{formatTimeLeft(timeLeft)}</span>
        )}
      </div>
    </div>
  )
}
