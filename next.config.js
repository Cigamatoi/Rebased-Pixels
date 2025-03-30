/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    // Liste der unterstützten Sprachen
    locales: ['de', 'en'],
    // Standardsprache
    defaultLocale: 'de',
    // Automatische Spracherkennung im Browser deaktivieren
    localeDetection: false,
  },
  eslint: {
    // Dies erlaubt erfolgreiche Production-Builds auch wenn ESLint-Fehler vorhanden sind
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dies erlaubt erfolgreiche Production-Builds auch wenn TypeScript-Fehler vorhanden sind
    ignoreBuildErrors: true,
  },
}

// eslint-disable-next-line no-undef
module.exports = nextConfig
