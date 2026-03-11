import type { Metadata } from 'next'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { WorkHistoryItem } from '@/components/WorkHistoryItem'
import { AnimatedTimeline } from '@/components/AnimatedTimeline'
import { WritingCard } from '@/components/WritingCard'
import { Header } from '@/components/Header'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Matthew O\'Connor — Product Designer',
  description:
    'Digital product designer based in London. Turning complexity into clarity through design thinking, user research, and scalable design systems.',
  openGraph: {
    title: 'Matthew O\'Connor — Product Designer',
    description:
      'Digital product designer based in London. Turning complexity into clarity.',
    type: 'website',
  },
}

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [siteSettings, navigation, workHistory, posts] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.findGlobal({ slug: 'navigation' }).catch(() => null),
    payload
      .find({
        collection: 'work-history',
        where: { status: { equals: 'published' } },
        sort: 'sortOrder',
        limit: 20,
      })
      .catch(() => ({ docs: [] })),
    payload
      .find({
        collection: 'posts',
        where: { status: { equals: 'published' } },
        sort: '-publishedAt',
        limit: 50,
        depth: 2,
      })
      .catch(() => ({ docs: [] })),
  ])

  const siteName = siteSettings?.siteName || 'Matthew O\'Connor'
  const navLinks = (navigation?.links || []) as { label: string; url: string }[]
  const introText =
    siteSettings?.introText ||
    'Digital product designer based in London.'
  const contactEmail = siteSettings?.contactEmail || ''
  const contactPrompt = siteSettings?.contactPrompt || ''
  const cvUrl = siteSettings?.cvDownloadUrl || ''
  const portfolioUrl = siteSettings?.portfolioDownloadUrl || ''

  const caseStudies = posts.docs.filter((p) => p.postType === 'case-study' || (!p.postType && !p.externalUrl))
  const externalPosts = posts.docs.filter((p) => p.postType === 'article' || p.postType === 'press' || (!p.postType && !!p.externalUrl))

  return (
    <div>
      {/* Hero / Intro */}
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-16 text-center sm:pt-20">
        <div className="animate-fade-in">
          <div className="mx-auto mb-8 w-40 sm:w-48">
            <Image
              src="/matthew-face.svg"
              alt="Matthew O'Connor"
              width={760}
              height={685}
              priority
              className="h-auto w-full"
            />
          </div>
          <h1
            className="mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Turning complexity into clarity
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foreground/60">
            {introText}
          </p>
        </div>
      </section>

      {/* Sticky nav — appears after hero, sticks on scroll */}
      <Header siteName={siteName} links={[{ label: 'Portfolio & CV', url: '#downloads' }, ...navLinks]} variant="sticky" />

      {/* Portfolio & CV callout card */}
      {(portfolioUrl || cvUrl) && (
        <section id="downloads" className="mx-auto max-w-6xl px-6 pb-16 pt-8">
          <div className="rounded-2xl bg-muted px-8 py-12 text-center sm:px-16 sm:py-16">
            <svg className="mx-auto mb-5 h-8 w-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <h2
              className="mx-auto mt-3 max-w-md text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Grab my portfolio &amp; CV
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Case studies, visual design and a full career overview, ready to download.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {portfolioUrl && (
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
                >
                  Portfolio
                  <svg className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              )}
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
                >
                  Curriculum Vitae
                  <svg className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Work History */}
      {workHistory.docs.length > 0 && (
        <section id="work" className="full-bleed bg-muted/50">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <h2
              className="mb-12 text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Experience
            </h2>
            <AnimatedTimeline>
              {workHistory.docs.map((item, i) => (
                <WorkHistoryItem
                  key={item.id}
                  company={item.company}
                  jobTitle={item.jobTitle}
                  startDate={item.startDate}
                  endDate={item.endDate}
                  description={item.description}
                  companyUrl={item.companyUrl}
                  index={i}
                />
              ))}
            </AnimatedTimeline>
          </div>
        </section>
      )}

      {/* Case Studies */}
      {caseStudies.length > 0 && (
        <section id="case-studies" className="mx-auto max-w-6xl px-6 py-20">
          <h2
            className="mb-12 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Case Studies
          </h2>
          <div className="space-y-12">
            {caseStudies.map((post, i) => (
              <div key={post.id}>
                <WritingCard post={post} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured In */}
      {externalPosts.length > 0 && (
        <section id="featured" className="mx-auto max-w-6xl px-6 py-20">
          <h2
            className="mb-12 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Featured In
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {externalPosts.map((post) => {
              const img =
                post.featuredImage && typeof post.featuredImage === 'object'
                  ? post.featuredImage
                  : null
              return (
                <a
                  key={post.id}
                  href={post.externalUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-xl border border-border transition-colors hover:bg-muted/50"
                >
                  {img?.url && (
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      <Image
                        src={img.url}
                        alt={img.alt || post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">
                      {post.postType === 'press' ? 'Interview' : 'Article'}
                    </p>
                    <h3
                      className="mt-2 text-lg font-bold tracking-tight"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-all group-hover:gap-3">
                      Read article
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
        <div className="animate-fade-in mx-auto max-w-2xl rounded-2xl bg-muted/50 px-8 py-16 text-center sm:px-16 sm:py-20">
          {contactPrompt && (() => {
            const match = contactPrompt.match(/^(.+?[?.])\s*(.*)$/)
            const heading = match ? match[1] : contactPrompt
            const body = match ? match[2] : ''
            return (
              <>
                <h2
                  className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {heading}
                </h2>
                {body && (
                  <p className="mb-6 text-base leading-relaxed text-foreground/60">
                    {body}
                  </p>
                )}
              </>
            )
          })()}
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="group/btn inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Get in touch
              <svg className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          )}
        </div>
      </section>
    </div>
  )
}
