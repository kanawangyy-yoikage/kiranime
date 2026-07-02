// pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' })
  }

  try {
    // Beberapa CDN (Webtoons, MyAnimeList) punya hotlink protection yang cuma
    // ngizinin Referer dari domain resminya sendiri, bukan dari origin URL gambarnya.
    // Ini penyebab thumbnail dari MAL (Jadwal Rilis) & panel Webtoons sering gagal muncul.
    const hostname = new URL(url).hostname
    let referer = new URL(url).origin
    if (/webtoons\.com|pstatic\.net/i.test(hostname)) {
      referer = 'https://www.webtoons.com/'
    } else if (/myanimelist\.net/i.test(hostname)) {
      referer = 'https://myanimelist.net/'
    }

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
