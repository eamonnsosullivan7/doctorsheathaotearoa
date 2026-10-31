import type {PortableTextBlock} from '@portabletext/types'
import {sanityClient} from 'sanity:client'

export interface SanityImage {
  asset: {_ref: string}
  alt?: string
  hotspot?: {x: number; y: number}
}

export interface EventSummary {
  _id: string
  title: string
  slug: string
  startDate: string
  endDate?: string
  location?: string
  organisers?: string
  link?: string
  shortDescription?: string
  image?: SanityImage
  hostLogo?: SanityImage
  hasReport: boolean
}

export interface Event extends EventSummary {
  description?: PortableTextBlock[]
  report?: PortableTextBlock[]
}

export interface NewsItem {
  _id: string
  title: string
  subtitle?: string
  date: string
  summary?: string
  link?: string
  image?: SanityImage
}

export interface TeamMember {
  _id: string
  name: string
  role?: string
  photo?: SanityImage
  bio?: PortableTextBlock[]
}

export interface SupportEntry {
  _key: string
  title: string
  url?: string
  byline?: string
  source?: string
  description?: PortableTextBlock[]
}

export interface SupportResource {
  _id: string
  title: string
  slug: string
  body?: PortableTextBlock[]
  entriesTitle?: string
  entries?: SupportEntry[]
  details?: {title?: string; body?: PortableTextBlock[]}
}

export interface SupportCategory {
  _id: string
  title: string
  slug: string
  intro?: string
  icon?: 'people' | 'seedling' | 'book'
  resources: SupportResource[]
}

const eventSummaryFields = `
  _id, title, "slug": slug.current, startDate, endDate, location, organisers, link,
  shortDescription, image, hostLogo, "hasReport": defined(report)
`

export function getEvents(limit?: number): Promise<EventSummary[]> {
  const range = limit ? `[0...${limit}]` : ''
  return sanityClient.fetch(
    `*[_type == "event" && defined(slug.current)] | order(startDate desc) ${range} { ${eventSummaryFields} }`,
  )
}

export function getEventsWithContent(): Promise<Event[]> {
  return sanityClient.fetch(
    `*[_type == "event" && defined(slug.current)] { ${eventSummaryFields}, description, report }`,
  )
}

export function getNews(): Promise<NewsItem[]> {
  return sanityClient.fetch(
    `*[_type == "news"] | order(date desc) { _id, title, subtitle, date, summary, link, image }`,
  )
}

export function getTeam(): Promise<TeamMember[]> {
  return sanityClient.fetch(
    `*[_type == "teamMember"] | order(order asc, name asc) { _id, name, role, photo, bio }`,
  )
}

export interface SupportCategorySummary extends Omit<SupportCategory, 'resources'> {
  /** The first few resource titles, in display order. */
  preview: string[]
  resourceCount: number
}

/** Categories for the homepage cards: a preview of what each support section contains. */
export function getSupportOverview(previewCount = 3): Promise<SupportCategorySummary[]> {
  return sanityClient.fetch(
    `
    *[_type == "supportCategory"] | order(order asc) {
      _id, title, "slug": slug.current, intro, icon,
      "preview": *[_type == "supportResource" && references(^._id)] | order(order asc, title asc) [0...$previewCount].title,
      "resourceCount": count(*[_type == "supportResource" && references(^._id)])
    }
  `,
    {previewCount},
  )
}

export function getSupportCategories(): Promise<SupportCategory[]> {
  return sanityClient.fetch(`
    *[_type == "supportCategory"] | order(order asc) {
      _id, title, "slug": slug.current, intro, icon,
      "resources": *[_type == "supportResource" && references(^._id)] | order(order asc, title asc) {
        _id, title, "slug": slug.current, body, entriesTitle, entries, details
      }
    }
  `)
}
