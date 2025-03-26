import { useCurrentAccount, useCurrentWallet } from '@iota/dapp-kit'
import { getFullnodeUrl, IotaClient } from '@iota/iota-sdk/client'
import { useEffect, useRef, useState } from 'react'

import styles from '~/styles/Home.module.css'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedColor, setSelectedColor] = useState('#00ffcc')
  const { connectionStatus, currentWallet } = useCurrentWallet()
  const { account } = useCurrentAccount()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize grid (100x100 pixels)
    for (let x = 0; x < 1000; x += 10) {
      for (let y = 0; y < 1000; y += 10) {
        ctx.fillStyle = '#111'
        ctx.fillRect(x, y, 9, 9)
        ctx.strokeStyle = '#333'
        ctx.strokeRect(x, y, 10, 10)
      }
    }
  }, [])

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (connectionStatus !== 'connected' || !currentWallet || !account) {
      alert('Please connect your wallet first!')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate grid position (100x100 grid)
    const gridX = Math.floor(x / 10) * 10
    const gridY = Math.floor(y / 10) * 10

    try {
      // Create transaction
      const tx = new Transaction()
      tx.setGasBudget(100_000_000) // 0.1 IOTA for gas

      // Add pixel data as transaction data
      const pixelData = {
        x: gridX / 10,
        y: gridY / 10,
        color: selectedColor,
        timestamp: Date.now()
      }

      // Request wallet to sign the transaction
      const { bytes, signature } = await (currentWallet as NonNullable<typeof currentWallet>).features['iota:signTransaction'].signTransaction({
        transaction: tx,
        account: account,
        chain: 'iota:testnet'
      })

      // Send signed transaction to the network
      const transactionResult = await iotaClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature: signature
      })

      // Wait for transaction to complete
      await iotaClient.waitForTransaction({ digest: transactionResult.digest })

      // Update canvas with new pixel
      ctx.fillStyle = selectedColor
      ctx.fillRect(gridX, gridY, 9, 9)
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>REBASED PIXELS</h1>
      </div>
      <div className={styles.colorPicker}>
        <h2>Choose a color</h2>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        />
      </div>
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
        onClick={handleCanvasClick}
        className={styles.canvas}
      />
    </main>
  )
} 