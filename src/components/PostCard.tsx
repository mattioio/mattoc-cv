import Link from 'next/link'
import Image from 'next/image'
import type { Post, Category } from '@/payload-types'
import { Badge } from '@/components/ui/badge'

type Props = {
  post: Post
}

export function PostCard({ post }: Props) {
  const featuredImage =
    post.featuredImage && typeof post.featuredImage === 'object' ? post.featuredImage : null

  const categories = Array.isArray(post.categories)
    ? post.categories.filter((c): c is Category => typeof c === 'object')
    : []

  const href = post.externalUrl || `/case-studies/${post.slug}`
  const isExternal = !!post.externalUrl

  const inner = (
    <div className="group">
      {featuredImage?.url && (
        <div className="relative mb-4 aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      {categories.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <Badge key={cat.id} variant="secondary">
              {cat.name}
            </Badge>
          ))}
        </div>
      )}
      <h3
        className="text-lg font-semibold leading-snug"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>
      )}
      <div className="mt-3 flex items-center gap-3">
        {post.readTime && (
          <span className="text-xs text-muted-foreground">{post.readTime}</span>
        )}
        <span className="text-sm font-medium text-foreground">Read &rarr;</span>
      </div>
    </div>
  )

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    )
  }

  return <Link href={href}>{inner}</Link>
}
