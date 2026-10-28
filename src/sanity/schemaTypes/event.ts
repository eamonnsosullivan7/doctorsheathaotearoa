import {CalendarIcon} from '@sanity/icons/Calendar'
import {defineField, defineType} from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'content', title: 'Content'},
    {name: 'media', title: 'Media'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'details',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'details',
      description: 'Used in the page URL: /event/<slug>',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Start date',
      type: 'date',
      group: 'details',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End date',
      type: 'date',
      group: 'details',
      description: 'Leave empty for single-day events.',
      validation: (rule) =>
        rule.custom((endDate, context) => {
          const startDate = (context.document as {startDate?: string} | undefined)?.startDate
          if (endDate && startDate && endDate < startDate) return 'End date must be after the start date'
          return true
        }),
    }),
    defineField({name: 'location', type: 'string', group: 'details'}),
    defineField({
      name: 'organisers',
      type: 'string',
      group: 'details',
      description: 'Who is running the event, e.g. "Doctors Health Alliance (Australia)".',
    }),
    defineField({
      name: 'link',
      title: 'Event / registration link',
      type: 'url',
      group: 'details',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Shown on event cards.',
      validation: (rule) => rule.max(400).warning('Keep card text short'),
    }),
    defineField({name: 'description', type: 'blockContent', group: 'content'}),
    defineField({
      name: 'report',
      title: 'Event report',
      type: 'blockContent',
      group: 'content',
      description: 'Optional write-up shown after the event.',
    }),
    defineField({
      name: 'image',
      type: 'image',
      group: 'media',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
    defineField({
      name: 'hostLogo',
      title: 'Host logo',
      type: 'image',
      group: 'media',
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
  ],
  orderings: [
    {title: 'Start date, newest', name: 'startDateDesc', by: [{field: 'startDate', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', date: 'startDate', media: 'image'},
    prepare: ({title, date, media}) => ({title, subtitle: date, media}),
  },
})
