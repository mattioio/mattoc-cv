'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type HeaderProps = {
  siteName?: string
  links?: { label: string; url: string }[]
  variant?: 'fixed' | 'sticky'
}

export function Header({ siteName = 'Matthew O\'Connor', links = [], variant = 'fixed' }: HeaderProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [inverted, setInverted] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => setMounted(true), [])

  // Detect dark backgrounds behind the header
  useEffect(() => {
    if (!mounted) return

    let raf = 0
    let invertTimer = 0
    const check = () => {
      const nav = navRef.current
      if (!nav) return

      const rect = nav.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2

      // Temporarily hide nav so elementsFromPoint looks through it
      nav.style.pointerEvents = 'none'
      const behind = document.elementsFromPoint(cx, cy)
      nav.style.pointerEvents = ''

      const dark = behind.some((el) => {
        if (nav.contains(el)) return false
        const bg = getComputedStyle(el).backgroundColor
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/)
        if (!m) return false
        // Skip fully transparent backgrounds
        if (m[4] !== undefined && parseFloat(m[4]) === 0) return false
        const lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255
        return lum < 0.3
      })

      // Debounce inversion to avoid flashing when scrolling past dark sections
      // Revert to dark immediately, but delay switching to inverted
      if (!dark) {
        clearTimeout(invertTimer)
        setInverted(false)
      } else {
        clearTimeout(invertTimer)
        invertTimer = window.setTimeout(() => setInverted(true), 50)
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(check)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    check() // initial check
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      clearTimeout(invertTimer)
    }
  }, [mounted])

  // Layout header hides on homepage (homepage renders its own sticky variant)
  // Also hide before hydration to prevent flash on homepage
  if (variant === 'fixed' && (!mounted || pathname === '/')) return null

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string, index: number) => {
    setActiveIndex(index)
    if (url.startsWith('#') && pathname === '/') {
      e.preventDefault()
      const el = document.querySelector(url)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // On non-homepage routes, prefix anchor links with / so they navigate home first
  const resolveUrl = (url: string) => {
    if (url.startsWith('#') && pathname !== '/') return `/${url}`
    return url
  }

  const isSticky = variant === 'sticky'

  return (
    <header
      className={
        isSticky
          ? 'sticky top-0 z-50 w-full px-3 py-3 sm:px-4 sm:py-4'
          : 'fixed top-0 z-50 w-full px-3 pt-3 sm:px-4 sm:pt-4'
      }
    >
      <nav
        ref={navRef}
        className={[
          isSticky
            ? 'mx-auto flex h-12 items-center justify-center rounded-full px-3 shadow-lg sm:h-14'
            : 'flex h-12 items-center justify-center rounded-full px-5 shadow-lg sm:h-14',
          inverted ? 'bg-background' : 'bg-foreground',
          'transition-colors duration-300',
        ].join(' ')}
        style={
          isSticky
            ? { width: 'fit-content' }
            : { animation: 'nav-in 0.5s ease-out both', width: 'fit-content' }
        }
      >
        {!isSticky && (
          <Link
            href="/"
            className={`flex items-center gap-2 text-xs font-semibold tracking-tight transition-colors duration-300 sm:text-sm ${
              inverted ? 'text-foreground' : 'text-background'
            }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <svg
              className={`h-3.5 w-3.5 transition-colors duration-300 ${inverted ? 'text-foreground/50' : 'text-background/50'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Home
          </Link>
        )}

        {isSticky && (
          <SlidingNav
            links={links}
            resolveUrl={resolveUrl}
            handleClick={handleClick}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            mounted={mounted}
            inverted={inverted}
          />
        )}
      </nav>
    </header>
  )
}

/* ── Sliding pill nav ─────────────────────────────────────────────────────── */

type SlidingNavProps = {
  links: { label: string; url: string }[]
  resolveUrl: (url: string) => string
  handleClick: (e: React.MouseEvent<HTMLAnchorElement>, url: string, index: number) => void
  activeIndex: number
  setActiveIndex: (i: number) => void
  mounted: boolean
  inverted: boolean
}

function SlidingNav({ links, resolveUrl, handleClick, activeIndex, setActiveIndex, mounted, inverted }: SlidingNavProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false })

  // Suppress scroll spy while a click-triggered smooth scroll is in progress
  const scrollLockRef = useRef(false)
  const scrollLockTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const checkRef = useRef<() => void>(undefined)

  const lockScrollSpy = useCallback(() => {
    scrollLockRef.current = true
    clearTimeout(scrollLockTimer.current)
    scrollLockTimer.current = setTimeout(() => {
      scrollLockRef.current = false
      // Re-run scroll spy after lock releases so pill updates to final position
      checkRef.current?.()
    }, 900)
  }, [])

  // Wrap the parent handleClick to also lock scroll spy
  const onLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, url: string, index: number) => {
      lockScrollSpy()
      handleClick(e, url, index)
    },
    [handleClick, lockScrollSpy],
  )

  // Measure the active link and update the pill position
  const updatePill = useCallback(() => {
    const link = linkRefs.current[activeIndex]
    const container = containerRef.current
    if (!link || !container) return

    const containerRect = container.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()

    setPill({
      left: linkRect.left - containerRect.left,
      width: linkRect.width,
      ready: true,
    })
  }, [activeIndex])

  // Recalculate pill on active change + resize
  useEffect(() => {
    updatePill()

    const ro = new ResizeObserver(updatePill)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [updatePill])

  // Scroll spy — activate the last section whose top has scrolled past the trigger line
  useEffect(() => {
    if (!mounted) return

    const sectionIds = links
      .map((l) => l.url)
      .filter((u) => u.startsWith('#'))
      .map((u) => u.slice(1))

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (elements.length === 0) return

    // For each section, find its first heading — that's the real content start.
    // Fall back to the section element itself.
    const anchors = elements.map((el) => {
      const heading = el.querySelector('h2, h3')
      return heading || el
    })

    const check = () => {
      if (scrollLockRef.current) return

      // Trigger line: 40% down the viewport.
      // A section becomes active once its first heading crosses above this line.
      const triggerLine = window.innerHeight * 0.4
      let best = 0
      for (let i = 0; i < anchors.length; i++) {
        if (anchors[i].getBoundingClientRect().top <= triggerLine) {
          best = i
        }
      }

      setActiveIndex(best)
    }

    checkRef.current = check
    window.addEventListener('scroll', check, { passive: true })
    check()
    return () => {
      window.removeEventListener('scroll', check)
    }
  }, [mounted, links, setActiveIndex])

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Sliding pill indicator */}
      <div
        className={`absolute top-0 h-full rounded-full transition-colors duration-300 ${
          inverted ? 'bg-foreground/[0.08]' : 'bg-white/[0.12]'
        }`}
        style={{
          left: pill.left,
          width: pill.width,
          transition: [
            pill.ready ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : '',
            pill.ready ? 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)' : '',
            'background-color 0.3s',
          ].filter(Boolean).join(', ') || 'none',
          opacity: pill.ready ? 1 : 0,
        }}
      />

      {links.map((link, i) => (
        <Link
          key={i}
          ref={(el) => { linkRefs.current[i] = el }}
          href={resolveUrl(link.url)}
          onClick={(e) => onLinkClick(e, link.url, i)}
          className={`relative z-10 rounded-full px-4 py-1.5 text-xs transition-colors duration-300 sm:px-5 sm:text-sm ${
            inverted
              ? i === activeIndex
                ? 'text-foreground'
                : 'text-foreground/50 hover:text-foreground/75'
              : i === activeIndex
                ? 'text-background'
                : 'text-background/50 hover:text-background/75'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}
