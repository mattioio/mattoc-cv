import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Badge } from '@/components/ui/badge'
import { CaseStudyLayout } from '@/components/CaseStudyBlocks'
import { HeroCarousel } from '@/components/HeroCarousel'
import type { Media, LayoutBlock } from '@/payload-types'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    depth: 1,
  })

  const post = result.docs[0]
  if (!post) return { title: 'Not Found' }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
    },
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
    },
    select: { slug: true, externalUrl: true },
    limit: 1000,
  })
  return posts.docs
    .filter((post) => !post.externalUrl)
    .map((post) => ({ slug: post.slug }))
}

export const revalidate = 60

function resolveMedia(field: unknown): Media | null {
  if (!field || typeof field === 'string') return null
  return field as Media
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    depth: 3,
  })

  const post = result.docs[0]
  if (!post) notFound()

  if (post.externalUrl) {
    redirect(post.externalUrl)
  }

  const featuredImage = resolveMedia(post.featuredImage)
  const heroImages = Array.isArray(post.heroImages)
    ? post.heroImages
        .map((item) => resolveMedia(item.image))
        .filter(Boolean) as Media[]
    : []
  const categories = Array.isArray(post.categories)
    ? post.categories.filter((c) => typeof c === 'object')
    : []
  const hasLayout = Array.isArray(post.layout) && post.layout.length > 0

  // Format the published date
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  // Fetch other case studies (excluding current)
  const otherResult = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
      slug: { not_equals: slug },
    },
    sort: '-publishedAt',
    depth: 2,
    limit: 10,
  })
  const otherCaseStudies = otherResult.docs.filter(
    (p) => p.postType === 'case-study' || (!p.postType && !p.externalUrl),
  )

  const hasHeroMedia = heroImages.length > 0 || featuredImage?.url
  const heroCarouselImages = heroImages.length > 0
    ? heroImages.map((img) => ({ id: img.id, url: img.url!, alt: img.alt || post.title }))
    : featuredImage?.url
      ? [{ id: featuredImage.id, url: featuredImage.url, alt: featuredImage.alt || post.title }]
      : []

  return (
    <article>
      {/* Hero with carousel background */}
      <header className="relative min-h-[85vh] bg-foreground text-white">
        {/* Background carousel / image */}
        {hasHeroMedia && <HeroCarousel images={heroCarouselImages} />}

        {/* Fallback dark bg when no images */}
        {!hasHeroMedia && <div className="absolute inset-0 bg-foreground" />}

        {/* Content overlay */}
        <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-5xl flex-col justify-end px-6 pb-20 pt-32">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat: { id: string; name: string }) => (
                <span
                  key={cat.id}
                  className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/70"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          <h1
            className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
            {publishedDate && <span>{publishedDate}</span>}
            {post.readTime && (
              <>
                {publishedDate && <span>&middot;</span>}
                <span>{post.readTime} read</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Layout blocks */}
      {hasLayout && <CaseStudyLayout blocks={post.layout as LayoutBlock[]} />}

      {/* Fallback: simple rich text content */}
      {!hasLayout && post.content && (
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="prose prose-lg max-w-none">
            <RichText data={post.content} />
          </div>
        </div>
      )}

      {/* Other case studies */}
      {otherCaseStudies.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-20">
          <h2
            className="mb-8 text-lg font-semibold tracking-tight text-foreground/40"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            More Case Studies
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherCaseStudies.map((otherPost) => {
              const img =
                otherPost.heroImages?.[0]?.image &&
                typeof otherPost.heroImages[0].image === 'object'
                  ? otherPost.heroImages[0].image
                  : otherPost.featuredImage &&
                      typeof otherPost.featuredImage === 'object'
                    ? otherPost.featuredImage
                    : null
              const href = otherPost.externalUrl || `/case-studies/${otherPost.slug}`
              const isExternal = !!otherPost.externalUrl

              return (
                <Link
                  key={otherPost.id}
                  href={href}
                  {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                    {img?.url && (
                      <Image
                        src={img.url}
                        alt={img.alt || otherPost.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <h3
                    className="mt-3 text-sm font-semibold leading-snug tracking-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {otherPost.title}
                  </h3>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-all group-hover:gap-2.5 group-hover:text-foreground">
                    View
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

    </article>
  )
}
