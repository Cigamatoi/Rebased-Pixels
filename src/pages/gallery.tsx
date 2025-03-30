import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import Gallery from '../components/NFTGallery'
import styles from '../styles/Gallery.module.css'
import pageStyles from '../styles/PixelGame.module.css'

export default function GalleryPage() {
  const router = useRouter()

  return (
    <div className={pageStyles.gameContainer}>
      <Head>
        <title>NAKAMA - Gallery</title>
        <meta name="description" content="NAKAMA Canvas Painting Gallery" />
      </Head>

      <div className={pageStyles.pageWrapper}>
        <header className={pageStyles.pageHeader}>
          <div className={pageStyles.headerContent}>
            <div className={pageStyles.headerTitle}>GALLERY</div>
            <div className={pageStyles.headerButtons}>
              <button onClick={() => router.push('/game')} className={pageStyles.backButton}>
                ← Back to Game
              </button>
            </div>
          </div>
        </header>

        <main className={pageStyles.mainContent}>
          <div className={styles.galleryContainer}>
            <Gallery title="Previous Epochs Gallery" />
          </div>
        </main>
      </div>
    </div>
  )
}
