/**
 * This file was auto-generated — stub version.
 * Run `pnpm generate:types` after connecting your DATABASE_URL to regenerate.
 */

import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

// Registers our types with the Payload local API so queries return typed results
declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}

export interface Config {
  collections: {
    users: User
    media: Media
    categories: Category
    posts: Post
    'work-history': WorkHistory
  }
  globals: {
    'site-settings': SiteSettings
    navigation: Navigation
  }
}

export interface User {
  id: string
  name?: string | null
  updatedAt: string
  createdAt: string
  email: string
  resetPasswordToken?: string | null
  resetPasswordExpiration?: string | null
  salt?: string | null
  hash?: string | null
  loginAttempts?: number | null
  lockUntil?: string | null
  password?: string | null
}

export interface Media {
  id: string
  alt: string
  updatedAt: string
  createdAt: string
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
}

export interface Category {
  id: string
  name: string
  slug: string
  updatedAt: string
  createdAt: string
}

export type CaseStudySectionBlock = {
  blockType: 'case-study-section'
  variant: 'default' | 'standout'
  heading?: string | null
  body?: SerializedEditorState | null
  image?: (string | null) | Media
  imagePosition?: 'below' | 'right' | 'left' | null
  imageCaption?: string | null
  carousel?: {
    image: string | Media
    caption?: string | null
    id?: string | null
  }[] | null
  stats?: {
    value: string
    label: string
    id?: string | null
  }[] | null
  id?: string | null
}

export type LayoutBlock = CaseStudySectionBlock

export interface Post {
  id: string
  title: string
  subtitle?: string | null
  slug: string
  status: 'draft' | 'published'
  publishedAt?: string | null
  excerpt?: string | null
  readTime?: string | null
  postType?: ('case-study' | 'article' | 'press') | null
  externalUrl?: string | null
  featuredImage?: (string | null) | Media
  heroImages?: { image: string | Media; id?: string | null }[] | null
  images?: { image: string | Media; caption?: string | null; id?: string | null }[] | null
  layout?: LayoutBlock[] | null
  content?: SerializedEditorState | null
  categories?: (string | Category)[] | null
  author?: (string | null) | User
  updatedAt: string
  createdAt: string
  _status?: ('draft' | 'published') | null
}

export interface WorkHistory {
  id: string
  company: string
  jobTitle: string
  startDate: string
  endDate?: string | null
  description: string
  companyUrl?: string | null
  sortOrder: number
  status: 'draft' | 'published'
  updatedAt: string
  createdAt: string
}

export interface SiteSettings {
  id: string
  siteName: string
  siteDescription?: string | null
  introText: string
  contactEmail: string
  contactPrompt?: string | null
  cvDownloadUrl?: string | null
  portfolioDownloadUrl?: string | null
  logo?: (string | null) | Media
  socialLinks?: {
    twitter?: string | null
    instagram?: string | null
    linkedin?: string | null
    dribbble?: string | null
    github?: string | null
  }
  updatedAt: string
  createdAt: string
  globalType?: string | null
}

export interface Navigation {
  id: string
  links?: {
    label: string
    url: string
    id?: string | null
  }[]
  updatedAt: string
  createdAt: string
  globalType?: string | null
}
