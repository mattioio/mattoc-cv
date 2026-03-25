/**
 * Seed script for the "How AI replaced Figma" case study (Portfolio Builder).
 * Run: IMG_DIR=~/Downloads node scripts/seed-portfolio-builder.mjs
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
  const imgDir = process.env.IMG_DIR || '/tmp/portfolio-builder-images'
  console.log('Uploading hero images...')
  const hero1 = await uploadLocalImage(token, `${imgDir}/portfolio-hero1.jpg`, 'Portfolio builder draw mode on laptop')
  const hero2 = await uploadLocalImage(token, `${imgDir}/portfolio-hero2.jpg`, 'Portfolio builder about me page on laptop')

  console.log('Uploading tool carousel images...')
  const toolCar1 = await uploadLocalImage(token, `${imgDir}/portfolio-carousel1.jpg`, 'Slide arrangement panel')
  const toolCar2 = await uploadLocalImage(token, `${imgDir}/portfolio-carousel2.jpg`, 'Page-level settings panel')
  const toolCar3 = await uploadLocalImage(token, `${imgDir}/portfolio-carousel3.jpg`, 'Global colour and font settings')
  const toolCar4 = await uploadLocalImage(token, `${imgDir}/portfolio-carousel4.jpg`, 'Drawing mode layers panel')
  const toolCar5 = await uploadLocalImage(token, `${imgDir}/portfolio-carousel5.jpg`, 'Drawing mode toolbar with move tool')

  console.log('Uploading smart behaviour carousel images...')
  const smartCar1 = await uploadLocalImage(token, `${imgDir}/smart-carousel1.jpg`, 'Work history timeline auto-generated from job slides')
  const smartCar2 = await uploadLocalImage(token, `${imgDir}/smart-carousel2.jpg`, 'Case studies auto-numbered contextually')
  const smartCar3 = await uploadLocalImage(token, `${imgDir}/smart-carousel3.jpg`, 'Footer luminance detection and inversion')

  const layout = [
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'The problem',
      body: lexicalDoc(
        'My portfolio lived in Figma as a set of frames exported to PDF. Maintaining it became frustrating:',
        { type: 'list', items: [
          'Small edits required opening the file, adjusting layouts, fixing spacing, and exporting again.',
          'Manual page-by-page design meant small changes could cascade across slides.',
          'The PDFs were huge and always needed a long compression step after export.',
        ]},
      ),
    },
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'The idea',
      body: lexicalDoc(
        "Instead of editing a static document repeatedly, I wanted a system to generate it. As I'd already made a PDF export tool with AI I knew I could make something bespoke to help remove my pain points:",
        { type: 'list', items: [
          'Build a lightweight document builder tailored to my portfolio.',
          'Define reusable templates and assemble them into a document.',
          'Let the system handle layout so I can focus on content.',
          'Add in programmatic elements so some pages build themselves.',
        ]},
      ),
    },
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'The tool',
      body: lexicalDoc(
        'Custom PDF builder designed for my portfolio. Features:',
        { type: 'list', items: [
          'Slide arrangement panel to reorder pages.',
          'Library of reusable templates, bespoke for my needs.',
          'Page-level settings per slide.',
          'Global document settings.',
          'Lightweight drawing mode for simple sketches (adding life back into a static document).',
        ]},
      ),
      carousel: [
        { image: toolCar1, caption: 'Full slide editing with drag and drop' },
        { image: toolCar2, caption: 'Each page has specific controls, including layout variants, dark mode, simple font sizing' },
        { image: toolCar3, caption: 'Global settings for changing theme colour, fonts, rounding, reusable background images, and other bespoke inputs' },
        { image: toolCar4, caption: 'Drawing mode with full layer control, grouping, and reordering' },
        { image: toolCar5, caption: 'Basic drawing options along with delete, move, and shape input' },
      ],
    },
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'Smart behaviour',
      body: lexicalDoc(
        'Some sections behave intelligently. This behaviour is only possible because the system is code-driven, and for me it was only feasible to implement using AI to write that code.',
        '"Places I have worked" pages auto-generate a timeline slide. So the more work-history slides I add, the longer the timeline slide becomes.',
        'Case study pages are automatically numbered based on the number of templates.',
        'Drawing mode was added towards the end of the build to add a human quality to the document. It features layers, groups, multiple line thicknesses and colours mapped to the theme.',
      ),
      carousel: [
        { image: smartCar1, caption: 'Work history slide is populated from jobs slides' },
        { image: smartCar2, caption: 'Case studies are numbered in order, like page number, but contextual to themselves' },
        { image: smartCar3, caption: 'Footers check the pixels below for luminance values and invert accordingly' },
      ],
    },
    {
      blockType: 'case-study-section',
      variant: 'default',
      heading: 'Building with AI',
      body: lexicalDoc(
        'This process is where AI assistance shines; it allowed me to write code to automate layouts and behaviours I could not have implemented manually. For instance the first PDF it output was ~350MB. All I had to do was ask my AI to "make it smaller" and it managed to compress the file output to ~4MB.',
        'Development process highlights:',
        { type: 'list', items: [
          'Built iteratively with AI-assisted development.',
          'Describe behaviour \u2192 test immediately \u2192 refine interface.',
          'Design and build happened simultaneously; no static mockups.',
        ]},
      ),
    },
    {
      blockType: 'case-study-section',
      variant: 'standout',
      heading: 'Outcome',
      body: lexicalDoc(
        'The tool dramatically simplifies maintaining my portfolio, letting me focus on content rather than layout and repetitive formatting. I no longer need to go through a lengthy compression process (often multiple times as I spot mistakes post processing), and the file looks better and is more consistent.',
        { type: 'list', items: [
          'Editing is faster.',
          'PDFs are lighter, easier to share.',
          'Repeatable process for future documents.',
          'Turns a frustrating workflow into a small, personal publishing system.',
        ]},
      ),
    },
  ]

  const postData = {
    title: 'How AI replaced Figma, transforming how I manage my portfolio',
    slug: 'how-ai-replaced-figma',
    subtitle: 'Building a custom PDF portfolio builder with AI.',
    excerpt: 'A custom PDF builder that replaced Figma for managing my portfolio. Built with AI, it handles layout, templates, and even drawing mode.',
    readTime: '6 min',
    postType: 'case-study',
    categories: [caseStudyId],
    status: 'published',
    publishedAt: new Date('2025-03-20').toISOString(),
    heroImages: [
      { image: hero1 },
      { image: hero2 },
    ],
    layout,
  }

  // Check if post exists
  const checkRes = await fetch(`${BASE}/api/posts?where[slug][equals]=how-ai-replaced-figma`, {
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
