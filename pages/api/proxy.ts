// pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' })
  }

  try {
    // Webtoons CDN butuh Referer dari webtoons.com sendiri, bukan origin CDN-nya,
    // kalau nggak gambar bakal ke-block hotlink protection (ini penyebab gambar novel sering gagal muncul)
    const isWebtoonsCdn = /webtoons\.com|pstatic\.net/i.test(new URL(url).hostname)
    const referer = isWebtoonsCdn ? 'https://www.webtoons.com/' : new URL(url).origin

    const response = await axios.get(url, {
      responseType: 'arraybuffer', // Penting untuk gambar
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': referer,
      },
    })

    const contentType = response.headers['content-type'] as string
    res.setHeader('Content-Type', contentType || 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate')
    res.send(response.data)
  } catch (error) {
    console.error('Image proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch image' })
  }
}
