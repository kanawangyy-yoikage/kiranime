import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { Search } from 'lucide-react'

interface CategorySearchBarProps {
  type: 'anime' | 'manga' | 'webtoon' | 'novel'
  placeholder?: string
  className?: string
}

export default function CategorySearchBar({ type, placeholder, className }: CategorySearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${type}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative w-full sm:w-72 shrink-0 ${className || ''}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || 'Cari judul\u2026'}
        className="input-field py-2.5 pr-11 text-sm"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-ocean hover:bg-oceanAccent-secondary rounded-full transition-colors"
        aria-label="Cari"
      >
        <Search size={14} className="text-white" aria-hidden="true" />
      </button>
    </form>
  )
}
