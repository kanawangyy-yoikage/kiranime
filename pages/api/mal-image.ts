import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query

  if (!url || typeof url !== 'string') return res.status(400).send('URL required')

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://myanimelist.net/',
      },
    })

    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=604800')
    res.send(Buffer.from(response.data))
  } catch (error) {
    res.status(500).send('Failed to fetch MAL image')
  }
}
