'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type CarouselImage = {
  url: string
  alt: string
  caption?: string | null
  width?: number | null
  height?: number | null
}

export function ImageCarousel({ images }: { images: CarouselImage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const itemWidth = el.clientWidth
    const index = Math.round(el.scrollLeft / itemWidth)
    setActiveIndex(Math.min(index, images.length - 1))
  }, [images.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()
    return () => el.removeEventListener('scroll', updateScrollState)
  }, [updateScrollState])

  const scrollTo = useCallback((direction: 'prev' | 'next') => {
    const el = scrollRef.current
    if (!el) return
    const itemWidth = el.clientWidth
    el.scrollBy({
      left: direction === 'next' ? itemWidth : -itemWidth,
      behavior: 'instant',
    })
  }, [])

  if (!images.length) return null

  const activeCaption = images[activeIndex]?.caption

  return (
    <div className="group relative overflow-hidden rounded-lg">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, i) => (
          <div key={i} className="w-full flex-none snap-center">
            <div className="relative aspect-[16/10] bg-muted">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 900px"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer bar: caption + counter + arrows */}
      {images.length > 1 && (
        <div className="-mt-px flex flex-col gap-3 bg-muted/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Caption */}
          <p className="min-h-[1.25rem] text-sm text-foreground/60 sm:flex-1">
            {activeCaption || ''}
          </p>

          {/* Counter + arrows */}
          <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
            <span className="text-sm tabular-nums text-foreground/40">
              {String(activeIndex + 1).padStart(2, '0')}/{String(images.length).padStart(2, '0')}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => scrollTo('prev')}
                disabled={activeIndex === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted disabled:opacity-30"
                aria-label="Previous image"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => scrollTo('next')}
                disabled={activeIndex === images.length - 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted disabled:opacity-30"
                aria-label="Next image"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single image caption (no counter) */}
      {images.length === 1 && activeCaption && (
        <div className="-mt-px bg-muted/80 px-4 py-3">
          <p className="text-sm text-foreground/60">{activeCaption}</p>
        </div>
      )}
    </div>
  )
}
