'use client'

import { useEffect, useState } from 'react'
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
  useEffect(() => setMounted(true), [])

  // Layout header hides on homepage (homepage renders its own sticky variant)
  // Also hide before hydration to prevent flash on homepage
  if (variant === 'fixed' && (!mounted || pathname === '/')) return null

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
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
        className={
          isSticky
            ? 'mx-auto flex h-12 max-w-sm items-center justify-center gap-1 rounded-full bg-foreground px-2 shadow-lg sm:h-14 sm:gap-2'
            : 'flex h-12 items-center justify-center rounded-full bg-foreground px-5 shadow-lg sm:h-14'
        }
        style={
          isSticky
            ? undefined
            : { animation: 'nav-in 0.5s ease-out both', width: 'fit-content' }
        }
      >
        {!isSticky && (
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold tracking-tight text-background sm:text-sm"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <svg className="h-3.5 w-3.5 text-background/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Home
          </Link>
        )}

        {isSticky && (
          <div className="flex items-center gap-0.5 sm:gap-1">
            {links.map((link, i) => (
              <Link
                key={i}
                href={resolveUrl(link.url)}
                onClick={(e) => handleClick(e, link.url)}
                className="rounded-full px-3 py-1.5 text-xs text-background/70 transition-colors hover:text-background sm:px-4 sm:text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
