import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Matthew O\'Connor',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      admin: {
        description: 'Used in meta tags',
      },
    },
    {
      name: 'introText',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Main intro paragraph shown on the homepage hero',
      },
    },
    {
      name: 'contactEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'contactPrompt',
      type: 'textarea',
      admin: {
        description: 'Text shown above the contact email in the contact section',
      },
    },
    {
      name: 'cvDownloadUrl',
      type: 'text',
      admin: {
        description: 'URL to downloadable CV PDF',
      },
    },
    {
      name: 'portfolioDownloadUrl',
      type: 'text',
      admin: {
        description: 'URL to downloadable portfolio PDF',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'twitter', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'dribbble', type: 'text' },
        { name: 'github', type: 'text' },
      ],
    },
  ],
}
