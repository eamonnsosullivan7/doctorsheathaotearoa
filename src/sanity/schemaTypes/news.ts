import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'

export const news = defineType({
  name: 'news',
  title: 'News',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'subtitle', type: 'string'}),
    defineField({name: 'date', type: 'date', validation: (rule) => rule.required()}),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 6,
      description: 'Shown on the news page. The most recent item is featured.',
    }),
    defineField({
      name: 'link',
      title: 'Article link',
      type: 'url',
      description: 'Where "Read full article" goes.',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
  ],
  orderings: [{title: 'Date, newest', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', subtitle: 'subtitle', media: 'image'},
  },
})
