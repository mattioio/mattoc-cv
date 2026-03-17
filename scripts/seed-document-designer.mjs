/**
 * Seed script for the "Document Designer" case study.
 * Run: node scripts/seed-document-designer.mjs
 * Requires the dev server to be running at localhost:3000
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000'

async function login() {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
  })
  const data = await res.json()
  if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data))
  return data.token
}

function lexicalDoc(...items) {
  const children = []
  for (const item of items) {
    if (typeof item === 'string') {
      children.push({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [{ type: 'text', format: 0, style: '', mode: 'normal', text: item, version: 1 }],
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
      })
    } else if (item.type === 'list') {
      children.push({
        type: 'list',
        listType: 'bullet',
        start: 1,
        format: '',
        indent: 0,
        version: 1,
        children: item.items.map((text) => ({
          type: 'listitem',
          format: '',
          indent: 0,
          version: 1,
          value: 1,
          children: [{ type: 'text', format: 0, style: '', mode: 'normal', text, version: 1 }],
          direction: 'ltr',
        })),
        direction: 'ltr',
        tag: 'ul',
      })
    }
  }
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
      direction: 'ltr',
    },
  }
}

async function uploadLocalImage(token, filePath, altText) {
  const fs = await import('fs')
  const path = await import('path')
  const buffer = fs.readFileSync(filePath)
  const filename = path.basename(filePath)
  const blob = new Blob([buffer], { type: 'image/jpeg' })
  const formData = new FormData()
  formData.append('file', blob, filename)
  formData.append('_payload', JSON.stringify({ alt: altText }))
  const res = await fetch(`${BASE}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: formData,
  })
  const data = await res.json()
  if (!data.doc?.id) throw new Error('Upload failed: ' + JSON.stringify(data).slice(0, 300))
  console.log(`  Uploaded ${filename} -> ID ${data.doc.id}`)
  return data.doc.id
}

async function main() {
  const token = await login()
  console.log('Logged in')

  // Get case-study category ID
  const catRes = await fetch(`${BASE}/api/categories?where[slug][equals]=case-study`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const catData = await catRes.json()
  const caseStudyId = catData.docs[0].id

  // Upload images
  const imgDir = process.env.IMG_DIR || '/tmp/docdesigner-images/tessts'
  console.log('Uploading hero images...')
  const hero1 = await uploadLocalImage(token, `${imgDir}/ai-hero1.jpg`, 'Document Designer hero - property brochure builder')
  const hero2 = await uploadLocalImage(token, `${imgDir}/ai-hero2.jpg`, 'Document Designer hero - template preview')
  const hero3 = await uploadLocalImage(token, `${imgDir}/ai-hero3.jpg`, 'Document Designer hero - document output')

  console.log('Uploading carousel images...')
  const car1 = await uploadLocalImage(token, `${imgDir}/ai-carousel1.jpg`, 'Document Designer - viewings form')
  const car2 = await uploadLocalImage(token, `${imgDir}/ai-carousel2.jpg`, 'Document Designer - input controls')
  const car3 = await uploadLocalImage(token, `${imgDir}/ai-carousel3.jpg`, 'Document Designer - template system')
  const car4 = await uploadLocalImage(token, `${imgDir}/ai-carousel4.jpg`, 'Document Designer - output preview')

  const layout = [
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'The problem',
      body: lexicalDoc(
        "Lettings agencies already have tools for brochures. They just aren't fit for purpose.",
        "Google Docs is the default. It works, but it's slow, inconsistent, and hard to make look good. Layouts drift, branding breaks, and non-designers end up doing design work.",
        "The result is time wasted and output that doesn't reflect the business.",
      ),
    },
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'The idea',
      body: lexicalDoc(
        "Don't improve the tools. Remove the problem.",
        "If the design is already solved, users shouldn't touch layout at all. They should only provide content.",
        'So the product removes the canvas and replaces it with structure.',
        'Documents are pre-designed, branded, and effectively impossible to break.',
      ),
    },
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'The product',
      body: lexicalDoc(
        'Document designer turns structured inputs into finished PDFs.',
        'Users log in, pick a template, fill in a form, and get a complete document instantly. Company data is already known, so branding is applied automatically.',
        "The shift is simple: you don't design the document. You fill out a simple form.",
      ),
    },
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'Designing the experience',
      body: lexicalDoc(
        "The challenge wasn't building an editor. It was avoiding one.",
        'To make this work, documents had to be reduced to data. Each section becomes a set of inputs. Variations are handled with conditional logic.',
        'This changes the interaction entirely. Instead of adjusting layout, users complete a form that reliably produces the right result.',
        "It also removes failure. There's no way to misalign or break the design because users never touch it.",
      ),
    },
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'Flexibility vs control',
      body: lexicalDoc(
        'More control leads to worse outcomes.',
        'Layouts are fixed. Flexibility lives in the inputs. Conditional logic and small overrides handle edge cases without compromising consistency.',
        'This keeps outputs clean while still covering real scenarios.',
      ),
      carousel: [
        { image: car3, caption: 'Quick options and override controls for complex lettings' },
        { image: car4, caption: 'The output generated from that selection' },
        { image: car1, caption: 'Selecting agents from the company' },
        { image: car2, caption: 'Those agents populated in the document' },
      ],
    },
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'The system',
      body: lexicalDoc(
        'The product is structured around businesses and templates.',
        "Each business has its own set of templates, along with its logo, colours, and typography baked into every document. I can create a business, invite users, assign specific templates to them, and switch into their account to see exactly what they see before anything goes live.",
        "Templates are built through a hands-on process. I start by defining the exact inputs the document needs, for example property details, image galleries, floor plans, and key selling points. From there, I generate a layout that maps directly to those inputs, then test it inside a real company account with actual data. This usually exposes edge cases, like missing fields or awkward content lengths, which I refine before publishing. The goal is that by the time a template goes live, it works reliably across real scenarios without needing manual adjustment.",
        'Each one is tailored to the business it serves.',
      ),
    },
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'Building with AI',
      body: lexicalDoc(
        'This product was built entirely with AI.',
        'No Figma. No static designs. The system was created directly in code through conversation.',
        'AI handled architecture, UI, and implementation. My role was to define problems, guide decisions, and refine the experience.',
        "It feels less like designing and more like sculpting, but at full speed. Instead of moving through a traditional design loop of wireframes, mocks, and handoff, I was iterating directly on the product itself. I could make a change, see it live, spot issues immediately, and refine again within minutes. That feedback loop, which normally takes days, was compressed into a continuous cycle of build, test, adjust, all happening in real time.",
      ),
    },
    {
      blockType: 'case-study-section',
      variant: 'standout',
      heading: 'Outcome',
      body: lexicalDoc(
        'Built in five days, largely because the design loop was happening directly in the product. Instead of moving through separate stages, I was iterating live: building, testing with real data, spotting issues, and refining within minutes. That compressed loop made it possible to reach a usable, end-to-end product quickly.',
        "Agencies can now produce brochures faster, with consistent design, without relying on general-purpose tools. Documents are generated, stored, and reused in one place.",
        'A messy, manual process becomes structured and repeatable.',
      ),
    },
  ]

  const postData = {
    title: 'Designing without design tools',
    slug: 'designing-without-design-tools',
    subtitle: 'Designing a better way to create documents without design tools.',
    excerpt: 'A product that turns structured inputs into finished, branded PDFs. Built entirely with AI.',
    readTime: '5 min',
    postType: 'case-study',
    categories: [caseStudyId],
    status: 'published',
    publishedAt: new Date('2025-03-15').toISOString(),
    heroImages: [
      { image: hero1 },
      { image: hero2 },
      { image: hero3 },
    ],
    layout,
  }

  // Check if post exists
  const checkRes = await fetch(`${BASE}/api/posts?where[slug][equals]=designing-without-design-tools`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const checkData = await checkRes.json()

  if (checkData.docs?.length > 0) {
    const id = checkData.docs[0].id
    const res = await fetch(`${BASE}/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(postData),
    })
    const data = await res.json()
    if (!data.doc?.id) throw new Error('Update failed: ' + JSON.stringify(data).slice(0, 300))
    console.log(`Updated: ${data.doc.title} (${data.doc.id})`)
  } else {
    const res = await fetch(`${BASE}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(postData),
    })
    const data = await res.json()
    if (!data.doc?.id) throw new Error('Create failed: ' + JSON.stringify(data).slice(0, 300))
    console.log(`Created: ${data.doc.title} (${data.doc.id})`)
  }

  console.log('Done!')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
