/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Prevent Next from inferring a wrong workspace root when multiple lockfiles exist
  outputFileTracingRoot: path.join(__dirname),
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
