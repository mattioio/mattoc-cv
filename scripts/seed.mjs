/**
 * Seed script — portfolio content for Matthew O'Connor CV
 * Run: node scripts/seed.mjs
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

// ─── Auth ────────────────────────────────────────────────────────────────────
async function login() {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data));
  console.log('✓ Logged in');
  return data.token;
}

// ─── API helpers ─────────────────────────────────────────────────────────────
async function createCategory(token, name, slug) {
  // Check if category already exists
  const check = await fetch(`${BASE}/api/categories?where[slug][equals]=${slug}`, {
    headers: { Authorization: `JWT ${token}` },
  });
  const existing = await check.json();
  if (existing.docs?.length > 0) {
    console.log(`  ✓ Category exists: ${name}`);
    return existing.docs[0].id;
  }
  const res = await fetch(`${BASE}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ name, slug }),
  });
  const data = await res.json();
  if (!data.doc?.id) throw new Error('Category failed: ' + JSON.stringify(data).slice(0, 200));
  console.log(`  + Category: ${name}`);
  return data.doc.id;
}

async function createWorkHistory(token, entry) {
  // Check if entry already exists by company + jobTitle
  const check = await fetch(`${BASE}/api/work-history?where[company][equals]=${encodeURIComponent(entry.company)}&where[jobTitle][equals]=${encodeURIComponent(entry.jobTitle)}`, {
    headers: { Authorization: `JWT ${token}` },
  });
  const existing = await check.json();
  if (existing.docs?.length > 0) {
    // Update existing
    const id = existing.docs[0].id;
    await fetch(`${BASE}/api/work-history/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(entry),
    });
    console.log(`  ✓ Updated: ${entry.company} — ${entry.jobTitle}`);
    return id;
  }
  const res = await fetch(`${BASE}/api/work-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(entry),
  });
  const data = await res.json();
  if (!data.doc?.id) throw new Error('WorkHistory failed: ' + JSON.stringify(data).slice(0, 200));
  console.log(`  + Work: ${entry.company} — ${entry.jobTitle}`);
  return data.doc.id;
}

async function createPost(token, post) {
  // Check if post already exists by slug
  const check = await fetch(`${BASE}/api/posts?where[slug][equals]=${encodeURIComponent(post.slug)}`, {
    headers: { Authorization: `JWT ${token}` },
  });
  const existing = await check.json();
  if (existing.docs?.length > 0) {
    // Update existing
    const id = existing.docs[0].id;
    await fetch(`${BASE}/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(post),
    });
    console.log(`  ✓ Updated: ${post.title}`);
    return id;
  }
  const res = await fetch(`${BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(post),
  });
  const data = await res.json();
  if (!data.doc?.id) throw new Error('Post failed: ' + JSON.stringify(data).slice(0, 200));
  console.log(`  + Post: ${post.title}`);
  return data.doc.id;
}

async function updateGlobal(token, slug, data) {
  const res = await fetch(`${BASE}/api/globals/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  console.log(`  ✓ Updated global: ${slug}`);
  return result;
}

// ─── Lexical content helper ───────────────────────────────────────────────────
function lexicalDoc(...paragraphs) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [{ type: 'text', format: 0, style: '', mode: 'normal', text, version: 1 }],
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr',
    },
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const token = await login();

  // ─── Update Site Settings ─────────────────────────────────────────────────
  console.log('\nUpdating site settings...');
  await updateGlobal(token, 'site-settings', {
    siteName: 'Matthew O\'Connor',
    siteDescription: 'Digital product designer based in London',
    introText:
      'I\'m a digital product designer living in London. With an affinity for all things digital and design, I\'ve spent my professional career learning how to use design to solve business problems.',
    contactEmail: 'matthew@notanother.studio',
    contactPrompt:
      'Still have questions? Feel free to contact me if you have any questions about my history and experience.',
    cvDownloadUrl:
      'https://drive.google.com/file/d/1HkUcFf6XEqC-VQR-2WjIX2USaPiFqDrJ/view?usp=sharing',
    portfolioDownloadUrl:
      'https://drive.google.com/file/d/1YjczjivAO8wz8xyU_ZUNZsv0rWChxQ26/view?usp=drive_link',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/matthew-o-connor-1147122b/',
    },
  });

  // ─── Update Navigation ───────────────────────────────────────────────────
  console.log('\nUpdating navigation...');
  await updateGlobal(token, 'navigation', {
    links: [
      { label: 'Work', url: '#work' },
      { label: 'Writing', url: '#case-studies' },
    ],
  });

  // ─── Create Categories ───────────────────────────────────────────────────
  console.log('\nCreating categories...');
  const caseStudyId = await createCategory(token, 'Case Study', 'case-study');
  const interviewId = await createCategory(token, 'Interview', 'interview');
  const designProcessId = await createCategory(token, 'Design Process', 'design-process');

  // ─── Create Work History ──────────────────────────────────────────────────
  console.log('\nCreating work history...');
  const workEntries = [
    {
      company: 'GiveMatch',
      jobTitle: 'Senior Product Designer',
      startDate: '2024',
      endDate: 'Current',
      description:
        'Joined to lead end-to-end product design across the platform. Worked with founders and engineers on fundraising tools for charities and communities, including campaigns, donation flows, dashboards, and profile pages, focusing on creating a coherent, scalable experience.',
      companyUrl: 'https://givematch.com/',
      sortOrder: 0,
      status: 'published',
    },
    {
      company: 'Zego',
      jobTitle: 'Lead Product Designer',
      startDate: '2022',
      endDate: '2023',
      description:
        'Rejoined the B2B venture to improve UI & UX of their Fleet management portal. Worked alongside PMs and developers to implement a new design system and clean up the overall experience.',
      companyUrl: 'https://www.zego.com/',
      sortOrder: 1,
      status: 'published',
    },
    {
      company: 'Not Another Studio',
      jobTitle: 'Director',
      startDate: '2020',
      endDate: 'Current',
      description:
        'Set up studio in August 2020 to facilitate contract work and consolidate CoolSource Cards side project. Main focus is web and marketing materials for brands.',
      companyUrl: 'https://www.notanother.studio/',
      sortOrder: 2,
      status: 'published',
    },
    {
      company: 'Zego',
      jobTitle: 'UI Designer',
      startDate: '2018',
      endDate: '2020',
      description:
        'Joined as second design team member (team grew to 5). Helped craft a design system to unify team output and create consistent UIs.',
      companyUrl: 'https://www.zego.com/',
      sortOrder: 3,
      status: 'published',
    },
    {
      company: 'CoolSource Cards',
      jobTitle: 'Illustrator & Director',
      startDate: '2018',
      endDate: 'Present',
      description:
        'Founded and serve as creative director of vibrant greeting card company. Oversee full design to print process. Established brand with retail placements including Whole Foods.',
      companyUrl: 'https://www.coolsourcecards.com/',
      sortOrder: 4,
      status: 'published',
    },
    {
      company: 'Striing.io',
      jobTitle: 'UI/UX Designer',
      startDate: '2017',
      endDate: '2018',
      description:
        'Helped startup with design skills gap. Designed UX of core table delivery service, branding, website design and development. Assisted with onsite UX testing at Las Iguanas pilot site.',
      sortOrder: 5,
      status: 'published',
    },
    {
      company: 'Flyt (Flypay)',
      jobTitle: 'Digital Designer — Product Designer',
      startDate: '2013',
      endDate: '2018',
      description:
        'Early startup member handling web dev and videography, transitioning to product design. Launched multiple products: Flypay app, Wahaca QuickPay App, Dirty Burger app, GBK App + Website, Chilango website, Flyt website + portal.',
      companyUrl: 'https://flyt.io/',
      sortOrder: 6,
      status: 'published',
    },
    {
      company: 'Freelance',
      jobTitle: 'Designer',
      startDate: '2011',
      endDate: '2013',
      description:
        'Post-university partnership with developer to learn web design/development on the job and build portfolio. Established design, CSS and HTML skills while learning client sourcing and management.',
      sortOrder: 7,
      status: 'published',
    },
  ];

  for (const entry of workEntries) {
    await createWorkHistory(token, entry);
  }

  // ─── Create Writing / Case Studies ────────────────────────────────────────
  console.log('\nCreating writing...');
  const writingEntries = [
    {
      title: 'A new home for charities on GiveMatch',
      slug: 'givematch-a-new-home-for-charities',
      excerpt:
        'Designed a central, flexible hub for charities to tell their story, fundraise and accept direct giving.',
      readTime: '5 min',
      content: lexicalDoc(
        'This case study explores the design process behind creating a central hub for charities on the GiveMatch platform.',
        'The goal was to give charities a flexible, customisable space where they could tell their story, showcase their campaigns, and accept donations — all in one place.',
        'Working closely with the founding team and engineers, I led the end-to-end design from research and ideation through to final UI delivery.',
      ),
      postType: 'case-study',
      categories: [caseStudyId],
      status: 'published',
      publishedAt: new Date('2024-06-01').toISOString(),
    },
    {
      title: 'Orchestrating Identity: Optimising onboarding',
      slug: 'case-study-orchestrating-identity',
      excerpt:
        'Hired as Product Designer by identification authentication startup to assist with their MVP.',
      readTime: '5 min',
      content: lexicalDoc(
        'Orchestrate Identity needed to streamline their onboarding flow for a complex identity verification product.',
        'I was brought in as Product Designer to help shape the MVP experience, focusing on reducing friction in the signup and verification steps.',
        'Through user testing and iterative design, we were able to significantly improve completion rates while maintaining the security requirements of the platform.',
      ),
      postType: 'case-study',
      categories: [caseStudyId],
      status: 'published',
      publishedAt: new Date('2023-01-15').toISOString(),
    },
    {
      title: 'Jenkins Law: Perfecting properties',
      slug: 'case-study-jenkins-law',
      excerpt:
        'Hired by commercial property company to upgrade their web experience.',
      readTime: '5 min',
      content: lexicalDoc(
        'Jenkins Law, a commercial property company, needed a modern web presence that could showcase their portfolio and attract new clients.',
        'I led the redesign of their website, focusing on clean presentation of property listings, intuitive navigation, and a professional aesthetic that reflected their brand values.',
        'The result was a responsive, high-performance site that improved enquiry rates and positioned Jenkins Law as a modern, approachable firm.',
      ),
      postType: 'case-study',
      categories: [caseStudyId],
      status: 'published',
      publishedAt: new Date('2022-06-01').toISOString(),
    },
    {
      title: 'Designing without design tools',
      slug: 'designing-without-design-tools',
      excerpt:
        'A product that turns structured inputs into finished, branded PDFs. Built entirely with AI.',
      readTime: '5 min',
      content: lexicalDoc(
        'Document designer turns structured inputs into finished PDFs. Users log in, pick a template, fill in a form, and get a complete document instantly.',
      ),
      postType: 'case-study',
      categories: [caseStudyId],
      status: 'published',
      publishedAt: new Date('2025-03-15').toISOString(),
    },
    {
      title: 'Design at Zego: Planning for scale',
      slug: 'design-at-zego-planning-for-scale',
      excerpt:
        'How I moved Zego from Sketch to Figma to reduce design debt and build a scalable design system for the growing team.',
      readTime: '5 min',
      externalUrl: 'https://api.zego.com/blog/design-at-zego-planning-for-scale/',
      content: lexicalDoc(
        'This article was published on the Zego engineering blog.',
      ),
      postType: 'article',
      categories: [designProcessId],
      status: 'published',
      publishedAt: new Date('2020-03-01').toISOString(),
    },
    {
      title: 'Talking Flypay with Marvel App',
      slug: 'flypay-the-pivot-to-flyt',
      excerpt:
        'I was interviewed by Marvel App about life at Flypay, how the product evolved, and the eventual pivot to Flyt.',
      readTime: '8 min',
      externalUrl: 'https://marvelapp.com/blog/flypay-pivot-flyt/',
      content: lexicalDoc(
        'This interview was published on the Marvel App blog.',
      ),
      postType: 'press',
      categories: [interviewId],
      status: 'published',
      publishedAt: new Date('2018-05-01').toISOString(),
    },
  ];

  for (const post of writingEntries) {
    await createPost(token, post);
  }

  console.log(
    '\n✅ Seed complete! 8 work history entries + 6 writing pieces + 3 categories + site settings.',
  );
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
