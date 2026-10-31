import {FolderIcon} from '@sanity/icons/Folder'
import {LinkIcon} from '@sanity/icons/Link'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Support page content is split into categories (the page sections) and
 * resources (one collapsible entry each). In Webflow the category was a
 * free-text option on every item; making it a document lets editors rename a
 * section, reorder sections, or write its intro without touching each item.
 */
export const supportCategory = defineType({
  name: 'supportCategory',
  title: 'Support category',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'Used as the section anchor, e.g. /support#articles-podcasts-books',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'intro', type: 'text', rows: 3}),
    defineField({
      name: 'icon',
      type: 'string',
      options: {
        list: [
          {title: 'People', value: 'people'},
          {title: 'Seedling', value: 'seedling'},
          {title: 'Book', value: 'book'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({name: 'order', type: 'number'}),
  ],
  orderings: [{title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
})

const resourceEntry = defineArrayMember({
  type: 'object',
  name: 'resourceEntry',
  title: 'Entry',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'url', title: 'Link', type: 'url'}),
    defineField({
      name: 'byline',
      type: 'string',
      description: 'Authors, host or the people providing the service, e.g. "Dr Sue Hawken".',
    }),
    defineField({
      name: 'source',
      type: 'string',
      description: 'Publisher, journal or organisation, e.g. "Oxford University Press, 2008".',
    }),
    defineField({
      name: 'description',
      type: 'blockContent',
      description: 'The first paragraph is always shown; anything after it is tucked behind a "More about…" toggle.',
    }),
  ],
  preview: {
    select: {title: 'title', byline: 'byline', source: 'source'},
    prepare: ({title, byline, source}) => ({title, subtitle: [byline, source].filter(Boolean).join(' · ')}),
  },
})

export const supportResource = defineType({
  name: 'supportResource',
  title: 'Support resource',
  type: 'document',
  icon: LinkIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'entries', title: 'Entries'},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Introduction',
      type: 'blockContent',
      group: 'content',
    }),
    defineField({
      name: 'entriesTitle',
      title: 'Entries heading',
      type: 'string',
      group: 'entries',
      description: 'Optional heading above the entries, e.g. "Recommended providers".',
    }),
    defineField({
      name: 'entries',
      type: 'array',
      group: 'entries',
      description:
        'Services, providers, podcasts, books or papers listed under this resource. Entries with only a title and link are shown as a compact link list; entries with a description or byline are shown as cards.',
      of: [resourceEntry],
    }),
    defineField({
      name: 'details',
      title: 'Expandable details',
      type: 'object',
      group: 'content',
      description: 'Optional extra section shown collapsed at the end of the resource.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'title', type: 'string'}),
        defineField({name: 'body', type: 'blockContent'}),
      ],
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'settings',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      group: 'settings',
      to: [{type: 'supportCategory'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      group: 'settings',
      description: 'Position within its category. Lower numbers appear first.',
    }),
  ],
  orderings: [{title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', subtitle: 'category.title'},
  },
})
