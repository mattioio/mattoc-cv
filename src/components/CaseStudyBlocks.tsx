'use client'

import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { CaseStudySectionBlock, LayoutBlock, Media } from '@/payload-types'
import { ImageCarousel } from './ImageCarousel'

function resolveMedia(field: string | Media | null | undefined): Media | null {
  if (!field || typeof field === 'string') return null
  return field
}

function SectionCarousel({ slides }: { slides: NonNullable<CaseStudySectionBlock['carousel']> }) {
  const images = slides
    .map((slide) => {
      const media = resolveMedia(slide.image)
      if (!media?.url) return null
      return {
        url: media.url,
        alt: media.alt || '',
        caption: slide.caption,
        width: media.width,
        height: media.height,
      }
    })
    .filter(Boolean) as {
    url: string
    alt: string
    caption?: string | null
    width?: number | null
    height?: number | null
  }[]

  if (!images.length) return null
  return <ImageCarousel images={images} />
}

function SectionImage({ block }: { block: CaseStudySectionBlock }) {
  const media = resolveMedia(block.image)
  if (!media?.url) return null

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <Image
          src={media.url}
          alt={media.alt || ''}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-contain"
        />
      </div>
      {block.imageCaption && (
        <p className="mt-2 text-center text-sm text-muted-foreground">{block.imageCaption}</p>
      )}
    </div>
  )
}

function CaseStudySection({ block }: { block: CaseStudySectionBlock }) {
  const hasHeading = !!block.heading
  const hasBody = !!block.body
  const hasImage = !!resolveMedia(block.image)
  const hasCarousel = !!(block.carousel && block.carousel.length > 0)
  const imagePos = block.imagePosition || 'below'

  // Centered overview: no heading, just body text
  if (!hasHeading && hasBody) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="prose prose-base mx-auto max-w-none text-foreground/70">
          <RichText data={block.body!} />
        </div>
        {hasCarousel && (
          <div className="mt-10">
            <SectionCarousel slides={block.carousel!} />
          </div>
        )}
      </section>
    )
  }

  // Two-column: heading left, content right
  const imageInline = hasImage && (imagePos === 'left' || imagePos === 'right')
  const imageBelow = hasImage && imagePos === 'below'

  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-12">
        {hasHeading && (
          <div>
            <h2
              className="text-lg font-semibold tracking-tight text-foreground/40"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {block.heading}
            </h2>
          </div>
        )}
        <div>
          {/* Body + inline image */}
          {imageInline ? (
            <div
              className={`grid gap-8 lg:grid-cols-2 ${imagePos === 'left' ? 'lg:[&>:first-child]:order-2' : ''}`}
            >
              <div className="prose prose-base max-w-none text-foreground/80">
                {hasBody && <RichText data={block.body!} />}
              </div>
              <SectionImage block={block} />
            </div>
          ) : (
            <>
              {hasBody && (
                <div className="prose prose-base max-w-none text-foreground/80">
                  <RichText data={block.body!} />
                </div>
              )}
              {imageBelow && (
                <div className="mt-8">
                  <SectionImage block={block} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Carousel after the two-column area */}
      {hasCarousel && (
        <div className="mt-10">
          <SectionCarousel slides={block.carousel!} />
        </div>
      )}
    </section>
  )
}

function StandoutSection({ block }: { block: CaseStudySectionBlock }) {
  const statCount = block.stats?.length || 0
  const gridCols =
    statCount === 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : statCount === 3
        ? 'sm:grid-cols-3'
        : 'sm:grid-cols-2'

  return (
    <section className="full-bleed relative overflow-hidden bg-foreground py-24 text-background">
      {/* Subtle gradient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-6">
        {block.heading && (
          <h2
            className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {block.heading}
          </h2>
        )}
        {block.body && (
          <div className="prose prose-lg prose-invert max-w-3xl text-background/70">
            <RichText data={block.body} />
          </div>
        )}
        {block.stats && block.stats.length > 0 && (
          <>
            <div className="mt-14 mb-14 h-px bg-background/10" />
            <div className={`grid gap-10 ${gridCols}`}>
              {block.stats.map((stat, i) => (
                <div key={stat.id || i}>
                  <p
                    className="text-5xl font-bold tracking-tight lg:text-6xl"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-background/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export function CaseStudyLayout({ blocks }: { blocks: LayoutBlock[] }) {
  return (
    <div>
      {blocks.map((block, i) => {
        if (block.blockType !== 'case-study-section') return null
        if (block.variant === 'standout') {
          return <StandoutSection key={block.id || i} block={block} />
        }
        return <CaseStudySection key={block.id || i} block={block} />
      })}
    </div>
  )
}
