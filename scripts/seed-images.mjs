/**
 * Image seed script — downloads case study images from original portfolio
 * and uploads them to Payload Media, then attaches them to posts.
 *
 * Run: node scripts/seed-images.mjs
 *
 * Requires the dev server to be running at localhost:3000
 */

import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const CDN = 'https://cdn.prod.website-files.com/65a66ba9d613b0ff41c53ce3/'
const TMP_DIR = '/tmp/seed-images'

// ─── Image inventory (from current live site) ────────────────────────────────
// Each post gets a banner/featured image + optional gallery images

const POST_IMAGES = {
  'givematch-a-new-home-for-charities': {
    featured: { file: '6866e0ab3ccbfe0e28542548_gm%20banner.jpg', alt: 'GiveMatch banner — charity platform design' },
    gallery: [
      { file: '6866e0ab3ccbfe0e28542548_gm%20banner.jpg', alt: 'GiveMatch banner — charity platform design' },
      { file: '666ae11c905d69533e97ebb2_comp-01.jpg', alt: 'GiveMatch desktop composition' },
      { file: '666ae11b7de3c2a47cbcc6d9_comp-02.jpg', alt: 'GiveMatch desktop composition variant' },
      { file: '666ae11beccb41a4b7a90ff0_comp-03.jpg', alt: 'GiveMatch desktop composition — dashboard' },
      { file: '666ae11b2ab6c4745c1a1f5e_phone-1.jpg', alt: 'GiveMatch mobile mockup' },
      { file: '666ae11b4f85ccf9a4176fe6_phone-2.jpg', alt: 'GiveMatch mobile mockup — campaign' },
    ],
  },
  'case-study-orchestrating-identity': {
    featured: { file: '66709829d57aeb2a4c8c3b7d_Activity%20-%20Onboard.jpg', alt: 'Orchestrate Identity — onboarding activity flow' },
    gallery: [
      { file: '66709829d57aeb2a4c8c3b7d_Activity%20-%20Onboard.jpg', alt: 'Orchestrate Identity — onboarding activity flow' },
    ],
  },
  'case-study-jenkins-law': {
    featured: { file: '667d61c3b063d633c58ec751_jenk%20thumb%202.jpg', alt: 'Jenkins Law — commercial property website redesign' },
    gallery: [
      { file: '667d61c3b063d633c58ec751_jenk%20thumb%202.jpg', alt: 'Jenkins Law — commercial property website redesign' },
    ],
  },
  'design-at-zego-planning-for-scale': {
    featured: { file: '666ad2108e839b73612999f5_Hero.jpg', alt: 'Zego — design system planning for scale' },
    gallery: [],
  },
  'flypay-the-pivot-to-flyt': {
    featured: { file: '666ad0593e5d60148d389650_2-1.jpg', alt: 'Flypay — the pivot to Flyt' },
    gallery: [],
  },
}

// ─── Auth ────────────────────────────────────────────────────────────────────

async function login() {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
  })
  const data = await res.json()
  if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data))
  console.log('✓ Logged in')
  return data.token
}

// ─── Download image ──────────────────────────────────────────────────────────

async function downloadImage(filename) {
  const url = CDN + filename
  console.log(`  ↓ Downloading ${decodeURIComponent(filename)}...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  // Use decoded filename for local storage
  const localName = decodeURIComponent(filename).replace(/[^a-zA-Z0-9._-]/g, '-')
  const localPath = join(TMP_DIR, localName)
  await writeFile(localPath, buffer)
  return { localPath, buffer, contentType: res.headers.get('content-type') || 'image/jpeg', localName }
}

// ─── Upload to Payload Media ─────────────────────────────────────────────────

async function uploadMedia(token, localName, buffer, contentType, alt) {
  const blob = new Blob([buffer], { type: contentType })
  const formData = new FormData()
  formData.append('file', blob, localName)
  formData.append('_payload', JSON.stringify({ alt }))

  const res = await fetch(`${BASE}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: formData,
  })

  const data = await res.json()
  if (!data.doc?.id) {
    throw new Error(`Upload failed for ${localName}: ${JSON.stringify(data).slice(0, 300)}`)
  }
  console.log(`  ✓ Uploaded: ${localName} → ${data.doc.id}`)
  return data.doc.id
}

// ─── Find post by slug ───────────────────────────────────────────────────────

async function findPostBySlug(token, slug) {
  const res = await fetch(
    `${BASE}/api/posts?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    { headers: { Authorization: `JWT ${token}` } },
  )
  const data = await res.json()
  if (!data.docs?.length) throw new Error(`Post not found: ${slug}`)
  return data.docs[0]
}

// ─── Update post with images ─────────────────────────────────────────────────

async function updatePostImages(token, postId, featuredImageId, galleryIds) {
  const body = { featuredImage: featuredImageId }
  if (galleryIds.length > 0) {
    body.images = galleryIds.map((id) => ({ image: id }))
  }

  const res = await fetch(`${BASE}/api/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!data.doc?.id) {
    throw new Error(`Update post failed: ${JSON.stringify(data).slice(0, 300)}`)
  }
  console.log(`  ✓ Updated post ${postId} — featured + ${galleryIds.length} gallery images`)
}

// ─── Deduplicate downloads ───────────────────────────────────────────────────
// Track already-downloaded files to avoid re-downloading the same image

const downloadCache = new Map()

async function getOrDownloadImage(token, file, alt) {
  if (downloadCache.has(file)) {
    console.log(`  ⟳ Reusing already-uploaded: ${decodeURIComponent(file)}`)
    return downloadCache.get(file)
  }

  const { localPath, buffer, contentType, localName } = await downloadImage(file)
  const mediaId = await uploadMedia(token, localName, buffer, contentType, alt)
  downloadCache.set(file, mediaId)

  // Clean up temp file
  await unlink(localPath).catch(() => {})
  return mediaId
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(TMP_DIR)) {
    await mkdir(TMP_DIR, { recursive: true })
  }

  const token = await login()

  for (const [slug, config] of Object.entries(POST_IMAGES)) {
    console.log(`\n📸 Processing: ${slug}`)

    const post = await findPostBySlug(token, slug)
    console.log(`  Found post: ${post.title} (${post.id})`)

    try {
      // Upload featured image
      const featuredId = await getOrDownloadImage(token, config.featured.file, config.featured.alt)

      // Upload gallery images
      const galleryIds = []
      for (const img of config.gallery) {
        try {
          const mediaId = await getOrDownloadImage(token, img.file, img.alt)
          galleryIds.push(mediaId)
        } catch (err) {
          console.error(`  ✗ Gallery failed: ${img.file} — ${err.message}`)
        }
      }

      await updatePostImages(token, post.id, featuredId, galleryIds)
    } catch (err) {
      console.error(`  ✗ Failed for ${slug}: ${err.message}`)
    }
  }

  console.log('\n✅ Image seed complete!')
}

main().catch((err) => {
  console.error('Image seed failed:', err)
  process.exit(1)
})
