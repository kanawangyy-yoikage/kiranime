/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_ANIME_API: 'https://www.sankavollerei.web.id/anime/animasu',
    NEXT_PUBLIC_MAL_API: 'https://api.myanimelist.net/v2',
    NEXT_PUBLIC_JIKAN_API: 'https://api.jikan.moe/v4',
  },
}

module.exports = nextConfig
