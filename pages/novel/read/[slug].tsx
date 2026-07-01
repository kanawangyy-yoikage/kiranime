// pages/novel/read/[slug].tsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function NovelReader() {
  const router = useRouter()
  const { slug } = router.query
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    // KiraNime API
    fetch(`/api/novel?action=read&slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        setContent(data.content || 'Konten tidak tersedia.')
        setLoading(false)
      })
      .catch(err => {
        console.error('Reader error:', err)
        setLoading(false)
      })
  }, [slug])

  return (
    <>
      <Head><title>Membaca Novel - KiraNime</title></Head>
      <div className="card p-6 max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>
        )}
      </div>
    </>
  )
}
