import React, { useEffect, useState, useRef } from 'react'
import styles from '../styles/PixelGame.module.css'
import { PixelCanvas } from './PixelCanvas'
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract'
import { parseEther } from 'viem'
import { formatTimeLeft } from '@/utils/time'
import { EpochCountdown } from './EpochCountdown'
import { io } from 'socket.io-client'

export const PixelGame: React.FC = () => {
  const { address } = useAccount()
  const [selectedColor, setSelectedColor] = useState('#ff0000')
  const [timeLeft, setTimeLeft] = useState<number | null>(null) // null = loading
  const [isLoading, setIsLoading] = useState(true)
  const [pixels, setPixels] = useState<Array<{ x: number; y: number; color: string }>>([])
  const [isMultiplayer, setIsMultiplayer] = useState(false)
  const socketRef = useRef<any>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Socket.IO Verbindung
  useEffect(() => {
    if (isMultiplayer) {
      socketRef.current = io({
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      socketRef.current.on('connect', () => {
        console.log('Socket.IO verbunden')
      })

      socketRef.current.on('disconnect', () => {
        console.log('Socket.IO getrennt')
      })

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect()
        }
      }
    }
  }, [isMultiplayer])

  // Server-Sync alle 60 Sekunden
  useEffect(() => {
    const fetchEpochTime = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/epoch-time')
        const data = await response.json()
        setTimeLeft(data.timeRemainingMs)
      } catch (error) {
        console.error('Fehler beim Laden der Epochenzeit:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEpochTime()
    const interval = setInterval(fetchEpochTime, 60000)
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
    if (timeLeft === 0) {
      console.log('Epoche beendet 🎉')
      handleEpochEnd()
    }
  }, [timeLeft])

  // Contract-Read für Pixel-Daten
  const { data: pixelData } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllPixels',
    watch: true,
  })

  // Contract-Write für Pixel-Setzung
  const { write: setPixel, data: setPixelData } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'setPixel',
  })

  // Warten auf Transaktion
  const { isLoading: isSettingPixel } = useWaitForTransaction({
    hash: setPixelData?.hash,
  })

  // Pixel-Daten aktualisieren
  useEffect(() => {
    if (pixelData) {
      const formattedPixels = pixelData.map((pixel: any) => ({
        x: Number(pixel.x) * 10,
        y: Number(pixel.y) * 10,
        color: pixel.color,
      }))
      setPixels(formattedPixels)
    }
  }, [pixelData])

  // Pixel-Click-Handler
  const handlePixelClick = (x: number, y: number) => {
    if (!address || isSettingPixel) return

    const pixelX = x / 10
    const pixelY = y / 10

    setPixel({
      args: [pixelX, pixelY, selectedColor],
      value: parseEther('0.001'),
    })
  }

  const handleEpochEnd = () => {
    console.log('Epoche abgelaufen!')
    // Hier können Sie zusätzliche Aktionen beim Epochenende ausführen
  }

  return (
    <div className={styles.pixelGame}>
      <div className={styles.gameHeader}>
        <h1>Pixel Game</h1>
        <EpochCountdown 
          onEpochEnd={handleEpochEnd} 
          canvasRef={canvasRef}
        />
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
        <button 
          className={styles.multiplayerButton}
          onClick={() => setIsMultiplayer(!isMultiplayer)}
        >
          {isMultiplayer ? 'Einzelspieler' : 'Multiplayer'}
        </button>
      </div>
      
      <div className={styles.gameContent}>
        <div className={styles.colorPicker}>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            disabled={!address}
          />
        </div>
        
        <PixelCanvas
          pixels={pixels}
          onPixelClick={handlePixelClick}
          disabled={!address}
          selectedColor={selectedColor}
          isMultiplayer={isMultiplayer}
        />
      </div>
    </div>
  )
} 