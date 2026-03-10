import type { Metadata } from 'next'
import { Syne, Plus_Jakarta_Sans } from 'next/font/google'
import '../globals.css'
import { HeaderWrapper } from '@/components/HeaderWrapper'
import { Footer } from '@/components/Footer'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Matthew O\'Connor',
    default: 'Matthew O\'Connor - Product Designer',
  },
  description: 'Digital product designer based in London',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${plusJakarta.variable} ${plusJakarta.className} flex min-h-screen flex-col`}
      >
        <HeaderWrapper />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
