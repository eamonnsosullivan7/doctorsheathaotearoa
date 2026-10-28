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

export interface SupportCategory {
  _id: string
  title: string
  slug: string
  intro?: string
  resources: {
    _id: string
    title: string
    slug: string
    body?: PortableTextBlock[]
    details?: {title?: string; body?: PortableTextBlock[]}
    links?: {_key: string; label: string; url: string}[]
  }[]
}

const eventSummaryFields = `
  _id, title, "slug": slug.current, startDate, endDate, location, organisers, link,
  shortDescription, image, hostLogo
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

export function getSupportCategories(): Promise<SupportCategory[]> {
  return sanityClient.fetch(`
    *[_type == "supportCategory"] | order(order asc) {
      _id, title, "slug": slug.current, intro,
      "resources": *[_type == "supportResource" && references(^._id)] | order(order asc, title asc) {
        _id, title, "slug": slug.current, body, details, links
      }
    }
  `)
}
