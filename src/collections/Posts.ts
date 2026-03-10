import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'categories'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Shown below the title in the hero section',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the title',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown in listings and SEO',
      },
    },
    {
      name: 'readTime',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'e.g. "5 min"',
      },
    },
    {
      name: 'postType',
      type: 'select',
      defaultValue: 'case-study',
      options: [
        { label: 'Case Study', value: 'case-study' },
        { label: 'Article', value: 'article' },
        { label: 'Press / Interview', value: 'press' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Controls how this post is displayed on the homepage',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        description:
          'If set, the "Read" link points here instead of the internal post page. Leave blank for internal case studies.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'heroImages',
      type: 'array',
      label: 'Hero Images',
      admin: { description: 'Images shown overlapping the hero section (card mockups, etc.)' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Gallery Images',
      admin: { description: 'Legacy gallery images — prefer using layout blocks instead' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page Layout',
      admin: {
        description: 'Build the case study page with structured content blocks',
      },
      blocks: [
        {
          slug: 'case-study-section',
          labels: { singular: 'Section', plural: 'Sections' },
          fields: [
            {
              name: 'variant',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Standout (Results/Highlight)', value: 'standout' },
              ],
              admin: {
                description: 'Standout sections use a dark background with prominent stats',
              },
            },
            {
              name: 'heading',
              type: 'text',
              admin: {
                description:
                  'Section heading. Omit for a centered body-only layout (overview style).',
              },
            },
            {
              name: 'body',
              type: 'richText',
              editor: lexicalEditor({}),
              admin: { description: 'Section body text' },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional image shown alongside or below body text',
                condition: (_data, siblingData) => siblingData?.variant !== 'standout',
              },
            },
            {
              name: 'imagePosition',
              type: 'select',
              defaultValue: 'below',
              options: [
                { label: 'Below text', value: 'below' },
                { label: 'Right of text', value: 'right' },
                { label: 'Left of text', value: 'left' },
              ],
              admin: {
                description: 'Where to position the image relative to body text',
                condition: (_data, siblingData) =>
                  siblingData?.variant !== 'standout' && !!siblingData?.image,
              },
            },
            {
              name: 'imageCaption',
              type: 'text',
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.variant !== 'standout' && !!siblingData?.image,
              },
            },
            {
              name: 'carousel',
              type: 'array',
              label: 'Carousel Slides',
              admin: {
                description: 'Image carousel shown after body text. Each slide has its own caption.',
                initCollapsed: true,
                condition: (_data, siblingData) => siblingData?.variant !== 'standout',
              },
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                {
                  name: 'caption',
                  type: 'text',
                  admin: { description: 'Caption/description for this slide' },
                },
              ],
            },
            {
              name: 'stats',
              type: 'array',
              label: 'Stats',
              admin: {
                description: 'Key metrics displayed prominently',
                condition: (_data, siblingData) => siblingData?.variant === 'standout',
              },
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Fallback content — used when no layout blocks are defined',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
