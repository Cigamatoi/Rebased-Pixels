const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const fs = require('fs')
const path = require('path')

// Fester Startzeitpunkt für die erste Epoche (2. April 2024, 00:01:00 UTC)
const EPOCH_START = new Date('2024-04-02T00:01:00Z').getTime()
const EPOCH_DURATION_MS = 3 * 24 * 60 * 60 * 1000 // 3 Tage

// Gibt den letzten Resetzeitpunkt und die verbleibende Zeit zurück
app.get('/api/reset-time', (req, res) => {
  try {
    const now = Date.now()
    const elapsed = now - EPOCH_START
    const completedEpochs = Math.floor(elapsed / EPOCH_DURATION_MS)
    const nextResetTime = EPOCH_START + (completedEpochs + 1) * EPOCH_DURATION_MS
    const timeRemainingMs = nextResetTime - now

    res.json({
      lastReset: new Date(EPOCH_START + completedEpochs * EPOCH_DURATION_MS).toISOString(),
      nextReset: new Date(nextResetTime).toISOString(),
      timeRemainingMs
    })
  } catch (error) {
    console.error('Error in reset-time API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Führt Screenshot und Reset durch
app.post('/api/reset-now', async (req, res) => {
  try {
    const now = Date.now()
    const elapsed = now - EPOCH_START
    const completedEpochs = Math.floor(elapsed / EPOCH_DURATION_MS)
    const nextResetTime = EPOCH_START + (completedEpochs + 1) * EPOCH_DURATION_MS
    
    // Prüfe, ob die Zeit wirklich abgelaufen ist
    if (now >= nextResetTime) {
      // 1. Screenshot erstellen
      const screenshotData = req.body.screenshot // Base64 Bilddaten vom Frontend
      if (screenshotData) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `epoch-${completedEpochs}-${timestamp}.png`
        const screenshotPath = path.join(__dirname, 'public', 'screenshots', filename)
        
        // Verzeichnis erstellen, falls nicht vorhanden
        if (!fs.existsSync(path.join(__dirname, 'public', 'screenshots'))) {
          fs.mkdirSync(path.join(__dirname, 'public', 'screenshots'), { recursive: true })
        }
        
        // Screenshot speichern
        const base64Data = screenshotData.replace(/^data:image\/png;base64,/, '')
        fs.writeFileSync(screenshotPath, base64Data, 'base64')
      }

      // 2. Canvas zurücksetzen (hier später Contract-Interaktion)
      console.log('Canvas zurückgesetzt:', new Date().toISOString())
      
      res.json({ 
        message: 'Canvas wurde zurückgesetzt',
        resetTime: new Date().toISOString(),
        screenshotUrl: screenshotData ? `/screenshots/${filename}` : null
      })
    } else {
      res.json({ 
        message: 'Reset noch nicht fällig',
        nextReset: new Date(nextResetTime).toISOString(),
        timeRemainingMs: nextResetTime - now
      })
    }
  } catch (error) {
    console.error('Error in reset-now API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Gibt alle verfügbaren Screenshots zurück
app.get('/api/screenshots', (req, res) => {
  try {
    const screenshotsDir = path.join(__dirname, 'public', 'screenshots')
    if (!fs.existsSync(screenshotsDir)) {
      return res.json({ screenshots: [] })
    }

    const files = fs.readdirSync(screenshotsDir)
    const screenshots = files
      .filter(file => file.endsWith('.png'))
      .map(file => ({
        filename: file,
        url: `/screenshots/${file}`,
        epoch: parseInt(file.split('-')[1]) || 0,
        timestamp: file.split('-')[2]?.replace('.png', '') || ''
      }))
      .sort((a, b) => b.epoch - a.epoch) // Neueste zuerst

    res.json({ screenshots })
  } catch (error) {
    console.error('Error in screenshots API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Gibt einen spezifischen Screenshot zurück
app.get('/api/screenshots/:filename', (req, res) => {
  try {
    const { filename } = req.params
    const screenshotPath = path.join(__dirname, 'public', 'screenshots', filename)
    
    if (!fs.existsSync(screenshotPath)) {
      return res.status(404).json({ error: 'Screenshot not found' })
    }

    // Lese das Bild als Base64
    const imageBuffer = fs.readFileSync(screenshotPath)
    const base64Image = imageBuffer.toString('base64')
    const mimeType = 'image/png'

    res.json({
      image: `data:${mimeType};base64,${base64Image}`,
      filename,
      epoch: parseInt(filename.split('-')[1]) || 0,
      timestamp: filename.split('-')[2]?.replace('.png', '') || ''
    })
  } catch (error) {
    console.error('Error in screenshot API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`)
}) 