/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Empty turbopack config to silence the warning
  // Leaflet works fine with Turbopack in Next.js 16
  turbopack: {},
}

module.exports = nextConfig