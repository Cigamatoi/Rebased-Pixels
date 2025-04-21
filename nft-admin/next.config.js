/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/exports/:path*',
        destination: 'http://localhost:3000/exports/:path*' // Zugriff auf Exporte des Hauptprojekts
      }
    ]
  }
}

module.exports = nextConfig 