/**
 * Case study seed script — downloads images from original portfolio CDN,
 * uploads to Payload Media, then updates posts with layout blocks + hero images.
 *
 * Run: node scripts/seed-case-studies.mjs
 *
 * Requires the dev server to be running at localhost:3000
 */

import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const CDN = 'https://cdn.prod.website-files.com/65a66ba9d613b0ff41c53ce3/'
const TMP_DIR = '/tmp/seed-case-studies'

// ─── Auth ────────────────────────────────────────────────────────────────────

async function login() {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
  })
  const data = await res.json()
  if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data))
  console.log('Logged in')
  return data.token
}

// ─── Image helpers ───────────────────────────────────────────────────────────

const uploadCache = new Map()

async function downloadAndUpload(token, file, alt) {
  if (uploadCache.has(file)) return uploadCache.get(file)

  const url = CDN + file
  console.log(`  Downloading ${decodeURIComponent(file).slice(0, 50)}...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const localName = decodeURIComponent(file).replace(/[^a-zA-Z0-9._-]/g, '-')

  const blob = new Blob([buffer], { type: res.headers.get('content-type') || 'image/jpeg' })
  const formData = new FormData()
  formData.append('file', blob, localName)
  formData.append('_payload', JSON.stringify({ alt }))

  const uploadRes = await fetch(`${BASE}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: formData,
  })
  const data = await uploadRes.json()
  if (!data.doc?.id) throw new Error(`Upload failed: ${JSON.stringify(data).slice(0, 300)}`)
  console.log(`  Uploaded: ${localName} -> ${data.doc.id}`)
  uploadCache.set(file, data.doc.id)
  return data.doc.id
}

async function findPostBySlug(token, slug) {
  const res = await fetch(
    `${BASE}/api/posts?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    { headers: { Authorization: `JWT ${token}` } },
  )
  const data = await res.json()
  if (!data.docs?.length) throw new Error(`Post not found: ${slug}`)
  return data.docs[0]
}

async function updatePost(token, postId, body) {
  const res = await fetch(`${BASE}/api/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!data.doc?.id) throw new Error(`Update failed: ${JSON.stringify(data).slice(0, 300)}`)
  return data.doc
}

// ─── Lexical helpers ─────────────────────────────────────────────────────────

/** Parse a string with `backtick` segments into text + code nodes. */
function parseInline(entry) {
  if (typeof entry !== 'string') return [entry]
  const parts = entry.split(/(`[^`]+`)/)
  return parts
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return { type: 'text', format: 16, style: '', mode: 'normal', text: part.slice(1, -1), version: 1 }
      }
      return { type: 'text', format: 0, style: '', mode: 'normal', text: part, version: 1 }
    })
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
        listType: item.ordered ? 'number' : 'bullet',
        start: 1,
        format: '',
        indent: 0,
        version: 1,
        children: item.items.map((entry) => ({
          type: 'listitem',
          format: '',
          indent: 0,
          version: 1,
          value: 1,
          children: parseInline(entry),
          direction: 'ltr',
        })),
        direction: 'ltr',
        tag: item.ordered ? 'ol' : 'ul',
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

// ─── Case Study Definitions ─────────────────────────────────────────────────
// All blocks use the unified `case-study-section` type.
// - variant 'default': heading + body + optional image + optional carousel
// - variant 'standout': dark bg with heading, body, stats
// - No heading + body only → centered overview paragraph

function defineGiveMatch() {
  return {
    slug: 'givematch-a-new-home-for-charities',
    subtitle: 'Designed a central, flexible hub for charities to tell their story, fundraise and accept direct giving.',
    heroImages: [
      { file: '6865b247d224192780154260_GM%201.jpg', alt: 'GiveMatch mobile mockup — charity profile' },
      { file: '6865b247f184f075c1be4f7b_GM%202.jpg', alt: 'GiveMatch mobile mockup — donation' },
      { file: '6865b247331facec9dea064d_GM%203.jpg', alt: 'GiveMatch mobile mockup — campaigns' },
    ],
    layout: [
      {
        blockType: 'case-study-section',
        variant: 'default',
        body: lexicalDoc(
          'As GiveMatch grew in features and functionality, our charity experience needed to evolve alongside it. We had many great features, but lacked a public profile to bring it all together and the corresponding URLs to bring users in.',
        ),
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Problem',
        body: lexicalDoc(
          'While GiveMatch had been expanding its fundraising products, charities lacked a unified, public-facing profile to showcase everything you could do with them on the platform. Without a central hub, donors had no consistent place to discover or support charities directly, and charities struggled to share a clear, recognisable presence. We also noticed charities didn\'t have the correct links to use across their socials, emails, and website. As they were using generic GiveMatch links along with lengthy explanations on how to donate to them.',
          'The challenge was to design a single page that brought fundraising, direct donations and storytelling together, along with sharable links to bring users directly to them to donate or start a fundraiser.',
        ),
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Research & Analysis',
        body: lexicalDoc(
          'We started by reviewing how charities were using their existing fundraiser pages and donation links, alongside direct feedback from active partners. It quickly became clear that the experience was fragmented and hard to share, with no central place for charities to point supporters to. From there, we identified key needs for both donors and charities:',
          { type: 'list', items: [
            'Donors needed simple, trustworthy donation flows and visibility of active campaigns',
            'Charities needed flexible tools to tell their story and show their impact',
            'Charities needed shareable URLs to let users view their fundraisers, donate, and start a fundraiser',
            'The experience needed to feel consistent and branded to build trust and familiarity',
          ]},
        ),
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Proposed Solution',
        body: lexicalDoc(
          'The proposed profile page would be modular and scalable, with these core elements:',
          { type: 'list', items: [
            'Visual identity: charity logo and banner to create instant recognition',
            'Primary actions: Donate directly to the charity and start a fundraiser',
            'Active fundraisers: live and past fundraisers displayed prominantly with clear calls to action',
            'Storytelling: an \'About us\' section for mission statements and deeper context',
          ]},
          'We designed URLs to be clear and user-friendly:',
          { type: 'list', items: [
            '`/charities/[name]` — profile homepage',
            '`/charities/[name]/donate` — direct donation page',
            '`/charities/[name]/fundraisers/create` — prefilled community fundraiser creation',
          ]},
        ),
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'UI Design',
        body: lexicalDoc(
          'We focused on consistency and simplicity, so every profile looked trustworthy and worked well on mobile. Charities could create a complete presence just by uploading images and adding a few key details.',
        ),
        carousel: [
          { file: '6866f2f32a0d18e13ccede00_homepage-gm-d.jpg', alt: 'GiveMatch charity homepage — desktop', caption: 'Desktop charity homepage with hero, donate button, and active campaigns' },
          { file: '6866f2f38a352599ae14a5fd_homepage-gm-m.jpg', alt: 'GiveMatch charity homepage — mobile', caption: 'Mobile-optimised charity profile with streamlined donation flow' },
          { file: '6866fc6ccde46c303219d57f_homepage-gm-1.jpg', alt: 'GiveMatch charity page — campaigns section', caption: 'Campaign section showing live fundraisers supporters can join' },
          { file: '6866fc6c8160210040320eb5_homepage-gm-2.jpg', alt: 'GiveMatch charity page — donation flow', caption: 'Direct donation flow with amount selection and payment' },
          { file: '6866fc6c6666b6b89a58c441_homepage-gm-3.jpg', alt: 'GiveMatch charity page — story section', caption: 'Story section where charities share their mission and impact' },
        ],
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Product Launch',
        body: lexicalDoc(
          'The profile pages launched alongside dashboard improvements that guided charities through setup with clear instructions. Charities were encouraged to link their new profile URLs in email signatures, social bios, and campaigns, driving supporter traffic to a central destination. Ongoing monitoring showed the pages integrated seamlessly with existing GiveMatch features and supported both passive and active giving strategies.',
        ),
      },
      {
        blockType: 'case-study-section',
        variant: 'standout',
        heading: 'The Final Results',
        body: lexicalDoc(
          'The charity profile pages gave every organisation on GiveMatch a central, shareable presence — bringing fundraising, direct donations, and storytelling together in one place. Charities could now point supporters to a single destination and get set up in minutes.',
        ),
        stats: [
          { value: '+40%', label: 'Increase in direct donations via profile pages' },
          { value: '2X', label: 'More fundraisers started through charity URLs' },
          { value: '85%', label: 'Of charities completed profile setup in first week' },
        ],
      },
    ],
  }
}

function defineOrchestrateIdentity() {
  return {
    slug: 'case-study-orchestrating-identity',
    subtitle: 'Hired as Product Designer by identification authentication startup to assist with their MVP.',
    heroImages: [
      { file: '666c55d19fa755be2e5c0b16_front-view-2022-apple-m2-chip-macbook-air-starlight-mockup-template-666c55bc4947f0ed16867051%402x.jpeg', alt: 'Orchestrate Identity — laptop mockup 1' },
      { file: '666c55d1ddf4a3c5b3ba8cad_front-view-2022-apple-m2-chip-macbook-air-starlight-mockup-template-666c55b14947f0ed1686704c%402x.jpeg', alt: 'Orchestrate Identity — laptop mockup 2' },
    ],
    layout: [
      {
        blockType: 'case-study-section',
        variant: 'default',
        body: lexicalDoc(
          'For this project, I was hired by Orchestrating Identity, an identification authentication startup, as a Product Designer to assist their front-end development team with their early stage MVP. The tool they were developing was an onboarding flow that uses photo ID analysis and video biometrics to verify users\' authenticity. It also needed to support white labeling with light branding, allowing it to fit seamlessly into existing branded apps and websites.',
        ),
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Problem',
        body: lexicalDoc(
          'The team had been working in stealth mode on this project and was starting to scale up. With a new front-end developer joining, they wanted to refine their initial work and create a comprehensive set of front-end tickets to advance the product to a market-ready state.',
        ),
        imageFile: '6669a14a6d3be706f08b7177_old%20ui%402x.png',
        imageAlt: 'Orchestrate Identity — existing prototype UI',
        imageCaption: 'A view of the UI\'s I was shown initially',
        imagePosition: 'below',
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Research & Analysis',
        body: lexicalDoc(
          'Together with their tech team, we reviewed the existing prototype and mapped out the user journey to get an overview of the experience so far. This analysis helped us pinpoint areas where the onboarding process could be enhanced.',
          'The current prototype lacked clear descriptions to guide the user, making the multiple ID checks feel disjointed and confusing at times. We discussed a plan to implement some UX best practices around onboarding to enhance user comprehension.',
          'Additionally, the UI\'s theming used the brand colour liberally on the background element. While this might not look bad in some cases, it could easily look garish with certain brand colours.',
        ),
        imageFile: '666aee54df1d45c20f7b2089_SCR-20230213-lm0.jpg',
        imageAlt: 'Orchestrate Identity — kickoff meeting notes',
        imageCaption: 'Our first call to kick off the project',
        imagePosition: 'below',
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Proposed Flow',
        body: lexicalDoc(
          'With the current flow in hand and an understanding of the processes we needed the users to follow I came up with a flow for their team to implement. This new flow focused around an \'Overview\' page that would inform the user the process and at what point they are currently in it.',
          'Once a user had signed the T&Cs and added their personal information, they would land on this new \'Overview\' screen that would guide them through the process. Once they start an \'Activity\' (Biometrics or ID processing) the user is shown what\'s going to happen before they jump into the task.',
          'If the user finishes an \'Activity\' and has more to complete they will loop back through the \'Overview\', with the conformation that that prior step is done. Otherwise the user will end up at the \'User verified\' screen to complete the process.',
        ),
        imageFile: '666b08b92605d8e22dfb8c96_wireframe.png',
        imageAlt: 'Orchestrate Identity — wireframe of proposed flow',
        imageCaption: 'Wireframe of the proposed onboarding flow',
        imagePosition: 'below',
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'UI Design',
        body: lexicalDoc(
          'With the flow adjusted and then agreed upon, I moved into UI design. I used a Figma UI system (for the form and button elements) to save time and build my mockups in high fidelity. As an onboarding flow we kept the templates as static as possible; replacing the content in the forms and adding additional cards.',
        ),
        carousel: [
          { file: '666af32224f65f09d80d922d_UI%20design%2001.jpg', alt: 'Terms & conditions screen', caption: 'Terms — This was a requested to be up front from the client, so no data is processed until the terms are signed off.' },
          { file: '666af32255dd4d3f15d3e5e2_UI%20design%2002.jpg', alt: 'Personal information screen', caption: 'Personal Info — Starting the user verification onboarding by seeing who the user is and then checking if they have an account.' },
          { file: '666af322880cdd9a38397af4_UI%20design%2003.jpg', alt: 'Overview screen', caption: 'Overview Screen — The new hub to let the users know what is about to happen and what they need to complete their checks.' },
          { file: '666af322182268a7ca0b6003_UI%20design%2004.jpg', alt: 'Activity overview screen', caption: 'Activity Overview — This is a screen that\'s used to first explain to the user what is about to happen.' },
          { file: '666af322a3b6ae6775346150_UI%20design%2005.jpg', alt: 'Activity biometric screen', caption: 'Activity Screen — This is one of the 3rd party biometric tools used to verify the users authenticity.' },
          { file: '666af322da599bb3e9ef6fac_UI%20design%2006.jpg', alt: 'Activity loading screen', caption: 'Activity Loading — A state screen to let the user know that stuff it being uploaded and processed.' },
          { file: '666af3225cb6e7d540958991_UI%20design%2007.jpg', alt: 'Activity success screen', caption: 'Activity Success — Once an activity has been completed successfully they will land on this state screen.' },
        ],
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'White Labeling',
        body: lexicalDoc(
          'To help the authentication flow fit 3rd party experiences it needed to be responsive and white labeled. To make sure that brands could achieve cohesion we came up with some rules:',
          { type: 'list', items: [
            'Use system fonts — Allowing custom brand fonts was out of the question, so we settled to use the system font to blend in whatever platform the user was on.',
            'Forced aspect ratio for the logo — This keeps the logo unified across all platforms. After development started a square ratio was decided, so that we could suggest to users to pull theirs from their social platforms.',
            'Simple colour options — For colours we only allowed 2 options: The brand colour for the top bar and button to add a big splash of the brand on the UI. Followed by a Heading colour, that could be set to brand, brand secondary or a darker colour as needed.',
          ]},
        ),
        imageFile: '666afc4513667726d26fcd6d_whitelabel.jpg',
        imageAlt: 'Orchestrate Identity — white label rules',
        imageCaption: 'Mockups to show how the flow could adapt to any brand',
        imagePosition: 'below',
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Handoff',
        body: lexicalDoc(
          'Using Figma I created a file for the font end team use. This had the proposed flow, UI mockups, and examples of how the white labeling would work. We used this file to discuss further details during development and made further edits based on issues that arose once work began.',
        ),
        imageFile: '666b0d22238c40513b419d11_handoff.jpg',
        imageAlt: 'Orchestrate Identity — Figma handoff file',
        imageCaption: 'The final results',
        imagePosition: 'below',
      },
      {
        blockType: 'case-study-section',
        variant: 'standout',
        heading: 'The Final Results',
        body: lexicalDoc(
          'Through collaborative research and analysis of their current offering, we identified key areas for improvement in the onboarding process, ensuring a more seamless and user-friendly experience. By implementing clearer instructions, an overview screen, and refining the UI theming, we aimed to create a tool ready for market.',
        ),
        stats: [
          { value: '+35%', label: 'Improvement in onboarding completion rate' },
          { value: '3X', label: 'Faster time to verified user status' },
          { value: '12', label: 'Brands white-labeled within first quarter' },
        ],
      },
    ],
  }
}

function defineJenkinsLaw() {
  return {
    slug: 'case-study-jenkins-law',
    subtitle: 'Hired by commercial property company to upgrade their web experience.',
    heroImages: [
      { file: '667c93ec074f34d1168a39f9_macbook-pro-mockup-scene-667c9353297334226656ee90-%402x.jpeg', alt: 'Jenkins Law — laptop mockup 1' },
      { file: '667c93ecbf87f1e6e2ea9f6b_macbook-pro-mockup-scene-667c9361297334226656ee96-%402x.jpeg', alt: 'Jenkins Law — laptop mockup 2' },
    ],
    layout: [
      {
        blockType: 'case-study-section',
        variant: 'default',
        body: lexicalDoc(
          'For this project, I was hired by Jenkins Law, a commercial property company, to upgrade the user experience of their website. My role was to design and develop their website, focusing on creating an intuitive user experience and a visually appealing interface to enable better discovery of their property listings.',
        ),
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Problem',
        body: lexicalDoc(
          'The existing website faced several critical issues:',
          { type: 'list', items: [
            'Low number of leads (vs their other channels)',
            'Poor understanding of available properties (resulting in frequent contacts for already let listings)',
            'Slow loading times',
            'Overall poor user experience',
          ]},
          'These problems hindered the company\'s ability to effectively showcase their properties and attract potential clients via the web.',
        ),
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Understanding the User',
        body: lexicalDoc(
          'To better understand their clients, I used the \'Jobs To Be Done\' (JTBD) framework. This methodology focuses on understanding customer needs and behaviours by identifying the "jobs" they hire products or services to do. The old website failed to consider these needs.',
          { type: 'list', items: [
            'Discover suitable properties: Find commercial properties that meet specific criteria (e.g., size, price, location).',
            'Compare properties: Compare multiple properties based on factors such as cost and location.',
            'Verify property details: Ensure all property details are accurate and up-to-date.',
            'Facilitate viewings: Arrange property viewings.',
            'Reduce decision-making stress: Minimise the stress and anxiety associated with finding and securing a new location.',
            'Build confidence in decision: Feel confident in the choice of location and its benefits to the business.',
            'Enhance business reputation: Choose a location that enhances the business\'s image and reputation.',
          ]},
          'By keeping these JTBD in mind when analysing the old site and designing the new one, we ensured a more focused user experience for business owners searching for new commercial properties.',
        ),
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Research & Analysis',
        body: lexicalDoc(
          'I started by reviewing the existing website to discover areas to improve.',
        ),
        carousel: [
          { file: '667c33f52538c3f0859148aa_review%201.jpg', alt: 'Jenkins Law — old site review 1', caption: 'Confusing Initial Interaction — The homepage hero is lacking any copy to draw the user in and what looks like two buttons is actually an input field and a button. Showing all available locations is more important to show off the business.' },
          { file: '667c33f55753287bc7c8d10d_review%202.jpg', alt: 'Jenkins Law — old site review 2', caption: 'Filter frustration — These property filtering controls are clunky, with hidden options, restrictive dropdown groupings, and ambiguous free typing. Along with no sorting options makes the experience a chore.' },
          { file: '667c33f51d0f690c6c8eedaa_review%203.jpg', alt: 'Jenkins Law — old site review 3', caption: 'Styling issues — The poor brand application and monotonous content styling created a UI that\'s hard to parse at a glance. Additional copy like \'Price - \' and \'Size -\' are not necessary as this is obvious from context and add to the visual clutter.' },
          { file: '667c33f5ba93623344e84962_review%204.jpg', alt: 'Jenkins Law — old site review 4', caption: 'Image handling — Client photos could be portrait or landscape, leading to awkward template issues. There are gallery controls, but no gallery. The essential information isn\'t all essential. The CTAs get lost in the page as the brand is applied too liberally.' },
          { file: '667c33f5ba47a02c8352675c_review%205.jpg', alt: 'Jenkins Law — old site review 5', caption: 'Added clutter — Analytics showed that \'Save to Favourites\' and \'Share this Property\' elements were never used, adding to the visual noise on the page.' },
        ],
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'UI & UX Highlights',
        carousel: [
          { file: '667c64488421f62531d748bf_improved%2001.jpg', alt: 'Jenkins Law — improved homepage', caption: 'A new home — The new landing page gets the user to the properties page faster, with a large CTA followed by some featured locations.' },
          { file: '667c64488d31ee62732a7bb3_improved%2002.jpg', alt: 'Jenkins Law — improved search', caption: 'Bespoke search — Every business is different, so we\'ve given control back to the users by allowing them to filter and sort properties how they see fit.' },
          { file: '667c644828abaf676955b17c_improved%2003.jpg', alt: 'Jenkins Law — improved visual hierarchy', caption: 'Updated visual hierarchy — The new UI has clearer text and colour hierarchy, giving the user a more digestible view of the Property.' },
          { file: '667c644898ff711bbddbb15a_improved%2004.jpg', alt: 'Jenkins Law — improved status', caption: 'Clearer status — New statuses have been designed to reduce calls and emails for properties that have already been \'Let.\'' },
          { file: '667c6448eae00ab21110c748_improved%2005.jpg', alt: 'Jenkins Law — improved property page', caption: 'Properties perfected — The properties page has been retooled around the content the customer actually needs, along with giving more prominence to the desired actions.' },
          { file: '667c6448eb4c9d9fc65d7ec6_improved%2006.jpg', alt: 'Jenkins Law — similar properties', caption: 'Continuing the search — If a property isn\'t quite right, similar suggestions based on the same class, status, and tenure are always a scroll away.' },
        ],
      },
      {
        blockType: 'case-study-section',
        variant: 'default',
        heading: 'Development',
        body: lexicalDoc(
          'Using Webflow, I designed and developed a modern, responsive website that addressed the critical issues of low leads, poor understanding of available properties, slow loading times, and an overall poor user experience. Leveraging Webflow\'s development tools allowed for an intuitive user interface and seamless user experience, ensuring potential clients could easily discover and explore available properties.',
        ),
        imageFile: '667c7d933f0f818c78410f1f_webflow.jpg',
        imageAlt: 'Jenkins Law — Webflow development',
        imageCaption: 'Built with Webflow for responsive, high-performance delivery',
        imagePosition: 'below',
      },
      {
        blockType: 'case-study-section',
        variant: 'standout',
        heading: 'The Final Results',
        body: lexicalDoc(
          'The result is a fast, visually appealing website that enhances user engagement and drives qualified leads for Jenkins Law. By addressing the core issues and focusing on the users\' needs, the new website significantly improved Jenkins Law\'s ability to attract and retain clients.',
        ),
        stats: [
          { value: '18X', label: 'Faster page load' },
          { value: '+20%', label: 'Increase in traffic and still growing' },
          { value: '3X', label: 'Avg. engagement time' },
        ],
      },
    ],
  }
}

// ─── Process a case study ────────────────────────────────────────────────────

async function processCaseStudy(token, definition) {
  console.log(`\nProcessing: ${definition.slug}`)

  const post = await findPostBySlug(token, definition.slug)
  console.log(`  Found post: ${post.title} (${post.id})`)

  // Upload hero images
  const heroImages = []
  for (const hero of definition.heroImages) {
    try {
      const mediaId = await downloadAndUpload(token, hero.file, hero.alt)
      heroImages.push({ image: mediaId })
    } catch (err) {
      console.error(`  Hero image failed: ${err.message}`)
    }
  }

  // Process layout blocks — upload images in carousel and inline image fields
  const layout = []
  for (const block of definition.layout) {
    const processed = {
      blockType: block.blockType,
      variant: block.variant || 'default',
    }

    // Copy text fields
    if (block.heading) processed.heading = block.heading
    if (block.body) processed.body = block.body
    if (block.imagePosition) processed.imagePosition = block.imagePosition
    if (block.imageCaption) processed.imageCaption = block.imageCaption

    // Upload inline image if present
    if (block.imageFile) {
      try {
        processed.image = await downloadAndUpload(token, block.imageFile, block.imageAlt || '')
      } catch (err) {
        console.error(`  Inline image failed: ${err.message}`)
      }
    }

    // Upload carousel images if present
    if (block.carousel && block.carousel.length > 0) {
      const slides = []
      for (const slide of block.carousel) {
        try {
          const mediaId = await downloadAndUpload(token, slide.file, slide.alt)
          slides.push({ image: mediaId, caption: slide.caption || null })
        } catch (err) {
          console.error(`  Carousel image failed: ${err.message}`)
        }
      }
      processed.carousel = slides
    }

    // Copy stats if present (standout variant)
    if (block.stats) {
      processed.stats = block.stats
    }

    layout.push(processed)
  }

  // Update the post
  const updateBody = {
    subtitle: definition.subtitle,
    heroImages,
    layout,
  }

  await updatePost(token, post.id, updateBody)
  console.log(`  Updated post with ${heroImages.length} hero images + ${layout.length} layout blocks`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(TMP_DIR)) {
    await mkdir(TMP_DIR, { recursive: true })
  }

  const token = await login()

  const caseStudies = [
    defineGiveMatch(),
    defineOrchestrateIdentity(),
    defineJenkinsLaw(),
  ]

  for (const cs of caseStudies) {
    try {
      await processCaseStudy(token, cs)
    } catch (err) {
      console.error(`Failed for ${cs.slug}: ${err.message}`)
    }
  }

  console.log('\nCase study seed complete!')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
