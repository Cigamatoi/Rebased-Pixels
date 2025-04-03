import React, { useRef, useEffect, useState } from 'react'
import styles from '../../styles/PixelGameMobile.module.css'

interface PixelCanvasMobileProps {
  width: number
  height: number
  pixelSize: number
  onPixelClick: (x: number, y: number) => void
  disabled?: boolean
}

const PixelCanvasMobile: React.FC<PixelCanvasMobileProps> = ({
  width,
  height,
  pixelSize,
  onPixelClick,
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(width)
  const [canvasHeight, setCanvasHeight] = useState(height)

  // Canvas-Größe anpassen
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas leeren
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Raster zeichnen
    ctx.strokeStyle = '#1a1a2e'
    ctx.lineWidth = 1

    for (let x = 0; x <= width; x += pixelSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y <= height; y += pixelSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }, [width, height, pixelSize])

  // Click-Handler-Effekt
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Click-Handler
    const handleClick = (e: MouseEvent) => {
      if (disabled) {
        console.log('Canvas ist deaktiviert')
        return
      }

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Auf Raster ausrichten
      const pixelX = Math.floor(x / pixelSize) * pixelSize
      const pixelY = Math.floor(y / pixelSize) * pixelSize

      onPixelClick(pixelX, pixelY)
    }

    // Event-Listener
    canvas.addEventListener('click', handleClick)

    // Cleanup
    return () => {
      canvas.removeEventListener('click', handleClick)
    }
  }, [onPixelClick, disabled, pixelSize])

  return (
    <div 
      ref={wrapperRef}
      className={styles.mobileWrapper}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={styles.pixelCanvas}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}

export default PixelCanvasMobile 