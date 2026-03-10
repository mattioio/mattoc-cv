import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PostCard } from '@/components/PostCard'

export const metadata: Metadata = {
  title: 'Case Studies',
}

export const revalidate = 60

export default async function WritingPage() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    depth: 2,
  })

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
      <h1
        className="mb-12 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Case Studies
      </h1>

      {posts.docs.length === 0 ? (
        <p className="text-muted-foreground">No posts published yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.docs.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
