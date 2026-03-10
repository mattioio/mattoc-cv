import type { CollectionConfig } from 'payload'

export const WorkHistory: CollectionConfig = {
  slug: 'work-history',
  admin: {
    useAsTitle: 'company',
    defaultColumns: ['company', 'jobTitle', 'startDate', 'endDate', 'sortOrder'],
    group: 'Content',
  },
  fields: [
    {
      name: 'company',
      type: 'text',
      required: true,
    },
    {
      name: 'jobTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'startDate',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'endDate',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Use "Current" or "Present" for ongoing roles',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'companyUrl',
      type: 'text',
      admin: {
        description: 'Full URL to company website',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'published',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
