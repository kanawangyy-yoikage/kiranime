import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE = 'https://www.webtoons.com';

const fetchHtml = async (path: string) => {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });
  return data;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action, query, url, day } = req.query;

  try {
    if (action === 'trending') {
      const d = (day as string || 'trending').toLowerCase();
      const path = d === 'daily' || d === 'trending' ? '/id/dailySchedule' : d === 'completed' ? '/id/originals/completed' : `/id/originals/${d}`;
      const html = await fetchHtml(path);
      const $ = cheerio.load(html);
      const items: any[] = [];
      $("a[href*='/list?title_no=']").each((_, el) => {
        const $a = $(el);
        const href = $a.attr('href') ?? '';
        if (!href) return;
        const absUrl = href.startsWith('http') ? href : `${BASE}${href}`;
        const title = $a.find('.subj, p.subj').first().text().trim() || $a.attr('title')?.trim() || '';
        const thumb = $a.find('img').first().attr('src') ?? null;
        items.push({ title, thumbnail: thumb, url: absUrl.split('&webtoon-platform-redirect')[0] });
      });
      return res.status(200).json({ items: items.filter((v, i, a) => a.findIndex(x => x.url === v.url) === i) });
    }

    if (action === 'search') {
      const html = await fetchHtml(`/id/search?keyword=${encodeURIComponent(query as string)}`);
      const $ = cheerio.load(html);
      const items: any[] = [];
      $("a[href*='/list?title_no=']").each((_, el) => {
        const $a = $(el);
        const href = $a.attr('href') ?? '';
        if (!href) return;
        const absUrl = href.startsWith('http') ? href : `${BASE}${href}`;
        const title = $a.find('strong.title, p.subj').first().text().trim();
        const thumb = $a.find('img').first().attr('src') ?? null;
        items.push({ title, thumbnail: thumb, url: absUrl.split('&')[0] });
      });
      return res.status(200).json({ items });
    }

    if (action === 'detail') {
      const html = await fetchHtml(url as string);
      const $ = cheerio.load(html);
      const title = $('h1.subj, .info .subj').first().text().trim();
      const thumbnail = $('.detail_header .thmb img').first().attr('src') || '';
      return res.status(200).json({ title, thumbnail, url });
    }

    if (action === 'pages') {
      const html = await fetchHtml(url as string);
      const $ = cheerio.load(html);
      const images: string[] = [];
      $('#_imageList img').each((_, el) => {
        const src = $(el).attr('data-url') || $(el).attr('src');
        if (src) images.push(src);
      });
      return res.status(200).json({ images });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
