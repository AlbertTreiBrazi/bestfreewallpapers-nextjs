'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '@/types'

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = q
    ? categories.filter(c => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
    : categories

  return (
    <>
      <div className="relative mb-8">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search categories..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-12 pr-5 py-3 focus:outline-none focus:border-green-600 transition-colors"
        />
      </div>

      {q && (
        <p className="text-gray-400 text-sm mb-5">
          {filtered.length} {filtered.length === 1 ? 'category' : 'categories'} for &quot;{query}&quot;
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group relative rounded-xl overflow-hidden bg-gray-800 aspect-square block"
          >
            {(cat.preview_thumbnail || cat.preview_image) && (
              <Image
                src={cat.preview_thumbnail || cat.preview_image!}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-white font-semibold text-lg">{cat.name}</h2>
              {cat.description && (
                <p className="text-gray-300 text-xs mt-1 line-clamp-2">{cat.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && q && (
        <div className="text-center py-20 text-gray-500">
          No categories found for &quot;{query}&quot;.
        </div>
      )}

      {categories.length === 0 && (
        <div className="text-center py-20 text-gray-500">No categories found.</div>
      )}
    </>
  )
}
