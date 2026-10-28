/**
 * One-off import of the Webflow CMS CSV exports into Sanity.
 *
 *   npx sanity exec scripts/import-webflow.ts --with-user-token -- <csv-dir>
 *
 * Re-runnable: document IDs are derived from the Webflow item IDs, so a second
 * run overwrites rather than duplicates. Archived Webflow items are skipped.
 * Images are downloaded from the Webflow CDN and uploaded as Sanity assets
 * (Sanity de-duplicates identical files).
 */
import {readdirSync, readFileSync} from 'node:fs'
import {basename, join} from 'node:path'
import {htmlToBlocks} from '@portabletext/block-tools'
import {Schema} from '@sanity/schema'
import {parse} from 'csv-parse/sync'
import {JSDOM} from 'jsdom'
import {getCliClient} from 'sanity/cli'
import {blockContent} from '../src/sanity/schemaTypes/blockContent'

type Row = Record<string, string>

const client = getCliClient({apiVersion: '2026-10-01'})
const csvDir = process.argv.at(-1) ?? ''

const blockContentType = Schema.compile({
  name: 'import',
  types: [
    blockContent,
    {name: 'holder', type: 'object', fields: [{name: 'body', type: 'blockContent'}]},
  ],
})
  .get('holder')
  .fields.find((field: {name: string}) => field.name === 'body').type

function readCsv(collection: string): Row[] {
  const file = readdirSync(csvDir).find((name) => name.includes(` - ${collection} - `) && name.endsWith('.csv'))
  if (!file) throw new Error(`No CSV for "${collection}" in ${csvDir}`)
  const rows: Row[] = parse(readFileSync(join(csvDir, file)), {columns: true, skip_empty_lines: true})
  return rows.filter((row) => row.Archived !== 'true')
}

/** Outlook "safelinks" wrap the real URL in a query parameter. */
function unwrapSafelink(href: string): string {
  try {
    const url = new URL(href)
    if (url.hostname.endsWith('safelinks.protection.outlook.com')) return url.searchParams.get('url') ?? href
  } catch {
    // Relative or mailto links: leave as is.
  }
  return href
}

/** Strip Webflow artefacts: empty spacer paragraphs, zero-width joiners, empty ids. */
function cleanHtml(html: string): string {
  const {document} = new JSDOM(`<body>${html}</body>`).window
  document.querySelectorAll('[id=""]').forEach((el) => el.removeAttribute('id'))
  document.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', unwrapSafelink(a.getAttribute('href')!)))
  const walker = document.createTreeWalker(document.body, 4 /* NodeFilter.SHOW_TEXT */)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    node.textContent = node.textContent!.replace(/‍/g, '')
  }
  document.querySelectorAll('p, strong, em, a').forEach((el) => {
    if (!el.textContent!.replace(/[\s ]/g, '') && !el.querySelector('img')) el.remove()
  })
  return document.body.innerHTML
}

function toBlocks(html: string | undefined) {
  if (!html?.trim()) return undefined
  const blocks = htmlToBlocks(cleanHtml(html), blockContentType, {
    parseHtml: (input) => new JSDOM(input).window.document,
  })
    .map(trimBlock)
    .filter((block) => block._type !== 'block' || blockText(block).trim())
  return blocks.length ? blocks : undefined
}

type Span = {_type: string; text?: string}
type Block = {_type: string; children?: Span[]}

function blockText(block: Block): string {
  return (block.children ?? []).map((child) => child.text ?? '').join('')
}

/** Remove line breaks left at the start/end of a block by <br> tags. */
function trimBlock<T extends Block>(block: T): T {
  const children = block.children
  if (!children?.length) return block
  const first = children[0]
  const last = children[children.length - 1]
  if (first.text) first.text = first.text.replace(/^[\s ]+/, '')
  if (last.text) last.text = last.text.replace(/[\s ]+$/, '')
  return block
}

/** "Fri Mar 28 2025 00:00:00 GMT+0000 (Coordinated Universal Time)" -> "2025-03-28" */
function toDate(value: string | undefined): string | undefined {
  if (!value) return undefined
  const date = new Date(value.replace(/\s*\(.*\)$/, ''))
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString().slice(0, 10)
}

function text(value: string | undefined): string | undefined {
  const cleaned = value?.replace(/‍/g, '').trim()
  return cleaned || undefined
}

const assetCache = new Map<string, string>()

async function image(url: string | undefined, alt?: string) {
  if (!url) return undefined
  let assetId = assetCache.get(url)
  if (!assetId) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`)
    const filename = decodeURIComponent(basename(new URL(url).pathname)).replace(/^[0-9a-f]{24}_/, '')
    const asset = await client.assets.upload('image', Buffer.from(await response.arrayBuffer()), {filename})
    assetId = asset._id
    assetCache.set(url, assetId)
  }
  return {_type: 'image', asset: {_type: 'reference', _ref: assetId}, ...(alt ? {alt} : {})}
}

function slug(current: string) {
  return {_type: 'slug', current}
}

async function importEvents() {
  const docs = []
  for (const row of readCsv('Events')) {
    const startDate = toDate(row['Start Date/Time'])
    const endDate = toDate(row['End Date/Time'])
    docs.push({
      _id: `event-${row['Item ID']}`,
      _type: 'event',
      title: text(row.Name),
      slug: slug(row.Slug),
      startDate,
      endDate: endDate && endDate !== startDate ? endDate : undefined,
      location: text(row.Location),
      organisers: text(row.Organisers),
      link: text(row['RSVP Link']),
      shortDescription: text(row['Short Description']),
      description: toBlocks(row.Description),
      report: toBlocks(row.Report),
      image: await image(row.Image, text(row.Name)),
      hostLogo: await image(row['Company/Host Logo'], text(row.Organisers)),
    })
  }
  return docs
}

async function importNews() {
  const docs = []
  for (const row of readCsv('News')) {
    docs.push({
      _id: `news-${row['Item ID']}`,
      _type: 'news',
      title: text(row.Name),
      slug: slug(row.Slug),
      subtitle: text(row.Subtitle),
      date: toDate(row.Date),
      summary: text(row.Description),
      link: text(row.Link),
      image: await image(row.Image),
    })
  }
  return docs
}

async function importTeam() {
  const docs = []
  for (const row of readCsv('Trustees')) {
    docs.push({
      _id: `teamMember-${row['Item ID']}`,
      _type: 'teamMember',
      name: text(row.Name),
      slug: slug(row.Slug),
      role: text(row['Job Title']),
      photo: await image(row['Profile Picture'], text(row.Name)),
      bioSummary: text(row['Bio Summary']),
      bio: toBlocks(row.Bio),
      email: text(row.Email)?.toLowerCase(),
      phone: text(row['Phone Number']),
      order: Number(row['Display Order']) || undefined,
    })
  }
  return docs
}

// Webflow stored the category as a plain option on each item. The intros are
// the descriptions used for the same three areas on the home page.
const categories = [
  {
    webflowName: 'Support for you & your colleagues',
    title: 'Support for you & your colleagues',
    slug: 'support-for-you-and-your-colleagues',
    intro:
      'Confidential, compassionate support for doctors and medical students facing personal, professional, or health challenges.',
  },
  {
    webflowName: 'Get involved in supporting doctors',
    title: 'Get involved in supporting doctors',
    slug: 'get-involved',
    intro: 'Join our network of doctors helping doctors. Volunteer for the roster, offer services, or contribute your expertise.',
  },
  {
    webflowName: 'Articles & Podcasts',
    title: 'Articles, Podcasts & Books',
    slug: 'articles-podcasts-books',
    intro: 'Explore insights, interviews, and stories from doctors supporting doctors.',
  },
]

// Tidier slugs where the Webflow one was clearly accidental.
const slugFixes: Record<string, string> = {
  'www-doctorshealth-co-nz-services-eap': 'eap-counselling-services',
  podcasts: 'podcasts-and-webinars',
}

function importSupport() {
  const categoryDocs = categories.map((category, index) => ({
    _id: `supportCategory-${category.slug}`,
    _type: 'supportCategory',
    title: category.title,
    slug: slug(category.slug),
    intro: category.intro,
    order: index + 1,
  }))

  const resourceDocs = readCsv('Services & Resources').map((row) => {
    const category = categories.find((c) => c.webflowName === row['Service Category'])
    if (!category) throw new Error(`Unknown category "${row['Service Category']}" on ${row.Name}`)
    const detailsBody = toBlocks(row['Dropdown Text'])
    return {
      _id: `supportResource-${row['Item ID']}`,
      _type: 'supportResource',
      title: text(row.Name),
      slug: slug(slugFixes[row.Slug] ?? row.Slug),
      category: {_type: 'reference', _ref: `supportCategory-${category.slug}`},
      order: Number(row['Sort order']) || undefined,
      body: toBlocks(row.Description),
      details: detailsBody ? {title: text(row['Dropdown Title']) ?? 'More information', body: detailsBody} : undefined,
    }
  })

  return [...categoryDocs, ...resourceDocs]
}

/** Drop undefined fields so they don't overwrite anything with null. */
function compact<T extends object>(doc: T): T {
  return JSON.parse(JSON.stringify(doc))
}

async function run() {
  if (!csvDir) throw new Error('Pass the folder containing the Webflow CSV exports')
  const docs = [...(await importEvents()), ...(await importNews()), ...(await importTeam()), ...importSupport()]
  const transaction = client.transaction()
  for (const doc of docs) transaction.createOrReplace(compact(doc) as {_id: string; _type: string})
  await transaction.commit()

  const counts = docs.reduce<Record<string, number>>((acc, doc) => {
    acc[doc._type] = (acc[doc._type] ?? 0) + 1
    return acc
  }, {})
  console.log('Imported:', counts, `(${assetCache.size} images)`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
