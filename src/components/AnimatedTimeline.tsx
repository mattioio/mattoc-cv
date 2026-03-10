'use client'

import { useEffect, useRef } from 'react'

export function AnimatedTimeline({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const line = lineRef.current
    if (!container || !line) return

    const items = container.querySelectorAll<HTMLElement>('[data-timeline-item]')

    function update() {
      const rect = container!.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      const scrollMid = viewportHeight * 0.65
      const progress = (scrollMid - rect.top) / rect.height
      const clamped = Math.max(0, Math.min(1, progress))

      line!.style.transform = `scaleY(${clamped})`

      // Reveal items as the line reaches them
      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect()
        const itemTop = itemRect.top
        if (itemTop < scrollMid) {
          item.classList.add('timeline-visible')
        }
      })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Background track */}
      <div
        className="absolute left-[5px] top-3 bottom-0 w-px bg-border/40 sm:left-[199px]"
        style={{ maskImage: 'linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)' }}
      />
      {/* Animated fill */}
      <div
        ref={lineRef}
        className="absolute left-[5px] top-3 bottom-0 w-px origin-top bg-foreground sm:left-[199px]"
        style={{ transform: 'scaleY(0)', transition: 'transform 0.1s ease-out', maskImage: 'linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)' }}
      />
      {children}
    </div>
  )
}
