// pages/api/novel-text.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' })
  }

  // Guard sederhana biar proxy ini cuma dipakai buat ngambil chapter dari CDN novel,
  // bukan disalahgunakan buat proxy sembarang URL.
  if (!/nacdn\.novelhubapp\.com/i.test(url)) {
    return res.status(400).json({ error: 'URL not allowed' })
  }

  try {
    const response = await axios.get(url, {
      responseType: 'text',
      transformResponse: (data) => data, // ini emang plain text, jangan di-JSON.parse
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/plain, */*',
      },
    })

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate')
    res.status(200).send(response.data)
  } catch (error: any) {
    console.error('Novel text proxy error:', error?.response?.status, error?.message)
    res.status(500).json({
      error: 'Failed to fetch chapter text',
      detail: error?.message || 'unknown',
      upstreamStatus: error?.response?.status ?? null,
    })
  }
}
