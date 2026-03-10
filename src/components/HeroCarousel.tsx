'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'

type HeroImage = {
  id?: string | number
  url: string
  alt: string
}

export function HeroCarousel({ images }: { images: HeroImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Auto-rotate every 3 seconds
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Images */}
      {images.map((img, i) => (
        <div
          key={img.id || i}
          className="absolute inset-0"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
        >
          <Image
            src={img.url}
            alt={img.alt}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/40" />
    </div>
  )
}
