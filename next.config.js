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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'rebasedpixels.herokuapp.com'
          }
        ],
        destination: 'https://rebasedpixels.herokuapp.com/:path*',
        permanent: true
      }
    ]
  }
}

// eslint-disable-next-line no-undef
module.exports = nextConfig
