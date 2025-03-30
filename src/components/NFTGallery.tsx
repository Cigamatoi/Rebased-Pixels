import { useEffect, useState } from 'react'

import styles from '../styles/NFTGallery.module.css'

interface ImageItem {
  id: string
  url: string
  title: string
  date: string
  epochNumber: number
}

interface GalleryProps {
  title?: string
  showTitle?: boolean
}

const Gallery: React.FC<GalleryProps> = ({ title = 'Gallery', showTitle = true }) => {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<string | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true)

        // API-Anfrage an den neuen Endpunkt mit dem letzten Abrufzeitpunkt
        const url = lastFetch
          ? `/api/get-screenshots?lastFetch=${encodeURIComponent(lastFetch)}`
          : '/api/get-screenshots'

        console.log('Fetching images from:', url)
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Received data:', data)

        // Speichere das Abrufzeitpunkt für den nächsten Abruf
        if (data.lastFetch) {
          setLastFetch(data.lastFetch)
        }

        // Neue Bilder zu den bestehenden hinzufügen
        setImages((prevImages) => {
          // Kombiniere alte und neue Bilder
          const combinedImages = [...prevImages]

          // Füge nur Bilder hinzu, die noch nicht vorhanden sind
          data.images.forEach((newImage: ImageItem) => {
            if (!combinedImages.some((img) => img.id === newImage.id)) {
              combinedImages.push(newImage)
            }
          })

          // Sortiere nach Epochennummer (absteigend)
          return combinedImages.sort((a, b) => b.epochNumber - a.epochNumber)
        })

        setError(null)
      } catch (err) {
        console.error('Error fetching images:', err)
        setError('Fehler beim Laden der Galerie. Bitte versuchen Sie es später erneut.')
      } finally {
        setLoading(false)
      }
    }

    fetchImages()

    // Regelmäßig nach neuen Bildern suchen (alle 30 Sekunden)
    const interval = setInterval(fetchImages, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading && images.length === 0) {
    return (
      <div className={styles.galleryContainer}>
        {showTitle && <h2 className={styles.galleryTitle}>{title}</h2>}
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading gallery...</p>
        </div>
      </div>
    )
  }

  if (error && images.length === 0) {
    return (
      <div className={styles.galleryContainer}>
        {showTitle && <h2 className={styles.galleryTitle}>{title}</h2>}
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => {
              setLoading(true)
              setError(null)
              // Trigger reload
              window.location.reload()
            }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className={styles.galleryContainer}>
        {showTitle && <h2 className={styles.galleryTitle}>{title}</h2>}
        <div className={styles.emptyContainer}>
          <p>No images have been created yet.</p>
          <p>The first image will be generated at the end of the current epoch (3 days).</p>
          <p>Or you can create a screenshot manually from the game page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.galleryContainer}>
      {showTitle && <h2 className={styles.galleryTitle}>{title}</h2>}

      <p className={styles.gallerySubtitle}>
        Explore unique pictures from each completed epoch. Every 3 days, a new piece of art is generated from the
        community canvas.
      </p>

      {loading && (
        <div className={styles.updatingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Looking for new images...</p>
        </div>
      )}

      <div className={styles.imageGrid}>
        {images.map((image) => (
          <div key={image.id} className={styles.imageCard}>
            <div className={styles.imageContainer}>
              <img
                src={image.url}
                alt={image.title}
                className={styles.galleryImage}
                onError={(e) => {
                  console.error(`Failed to load image: ${image.url}`)
                  // Fallback Bild falls das eigentliche Bild nicht geladen werden kann
                  e.currentTarget.src = '/images/placeholder-empty.png'
                }}
              />
            </div>
            <div className={styles.imageInfo}>
              <h3 className={styles.imageTitle}>{image.title}</h3>
              <p className={styles.imageDate}>{new Date(image.date).toLocaleDateString('en-US')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Gallery
