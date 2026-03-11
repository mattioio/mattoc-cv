import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/payload-types'

type Props = {
  post: Post
  index?: number
}

export function WritingCard({ post, index = 0 }: Props) {
  const firstHeroImage =
    post.heroImages?.[0]?.image && typeof post.heroImages[0].image === 'object'
      ? post.heroImages[0].image
      : null
  const featuredImage =
    firstHeroImage ||
    (post.featuredImage && typeof post.featuredImage === 'object' ? post.featuredImage : null)

  const href = post.externalUrl || `/case-studies/${post.slug}`
  const isExternal = !!post.externalUrl
  const num = String(index + 1).padStart(2, '0')

  const CardInner = (
    <div className="group grid gap-6 sm:grid-cols-[1fr_1fr] sm:items-center">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        {featuredImage?.url && (
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || post.title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div>
        <span className="text-xs font-medium tracking-wider text-muted-foreground/60">{num}</span>
        <h3
          className="mt-1 text-xl font-bold leading-snug tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground">
          View case study
          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </span>
      </div>
    </div>
  )

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {CardInner}
      </a>
    )
  }

  return <Link href={href}>{CardInner}</Link>
}
