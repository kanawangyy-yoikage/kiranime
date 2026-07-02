import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

/**
 * Generic image proxy for any external image URL.
 * Adds proper headers (User-Agent, Referer) to bypass CORS/Banding restrictions.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter required' })
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      // Some providers (MAL, manga sites) require a realistic referer.
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': new URL(url).origin,
        Accept: 'image/*,*/*;q=0.8',
      },
    })

    const contentType = response.headers['content-type'] as string | undefined
    res.setHeader('Content-Type', contentType || 'image/jpeg')
    // Cache for a day (adjust if needed)
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate')
    res.send(Buffer.from(response.data))
  } catch (error) {
    console.error('Image proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch image' })
  }
}
