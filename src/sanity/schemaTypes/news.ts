import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'
import {newsTypes} from '../lib/newsTypes'

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
      name: 'type',
      type: 'string',
      description: 'Shown as a label, and sets the link wording, e.g. "Read the newsletter".',
      options: {
        list: Object.entries(newsTypes).map(([value, {label}]) => ({value, title: label})),
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'source',
      type: 'string',
      description: 'Who published it, e.g. "Doctors Health Alliance". Leave empty for DHA’s own news.',
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown in the news list.',
      validation: (rule) => rule.max(300).warning('Keep the excerpt to one or two sentences'),
    }),
    defineField({
      name: 'body',
      title: 'Summary',
      type: 'blockContent',
      description: 'Optional longer summary shown when this is the featured (most recent) item, e.g. what this issue contains.',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
      description: 'The full newsletter, article or report.',
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
