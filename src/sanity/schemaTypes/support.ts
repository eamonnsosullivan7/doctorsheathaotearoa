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
    defineField({name: 'order', type: 'number'}),
  ],
  orderings: [{title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
})

export const supportResource = defineType({
  name: 'supportResource',
  title: 'Support resource',
  type: 'document',
  icon: LinkIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{type: 'supportCategory'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Position within its category. Lower numbers appear first.',
    }),
    defineField({name: 'body', type: 'blockContent'}),
    defineField({
      name: 'details',
      title: 'Expandable details',
      type: 'object',
      description: 'Optional extra section shown collapsed inside the resource, e.g. a list of recommended providers.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'title', type: 'string'}),
        defineField({name: 'body', type: 'blockContent'}),
      ],
    }),
    defineField({
      name: 'links',
      title: 'Quick links',
      type: 'array',
      description: 'Optional list of links shown as buttons under the text.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'resourceLink',
          fields: [
            defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'url', type: 'url', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'url'}},
        }),
      ],
    }),
  ],
  orderings: [{title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', subtitle: 'category.title'},
  },
})
