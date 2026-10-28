import {UserIcon} from '@sanity/icons/User'
import {defineField, defineType} from 'sanity'

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'role', type: 'string', description: 'e.g. "Chair, DHAS Trust"'}),
    defineField({
      name: 'photo',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
    defineField({
      name: 'bioSummary',
      title: 'Bio summary',
      type: 'text',
      rows: 3,
    }),
    defineField({name: 'bio', type: 'blockContent'}),
    defineField({name: 'email', type: 'email'}),
    defineField({name: 'phone', type: 'string'}),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Lower numbers appear first on the About page.',
    }),
  ],
  orderings: [{title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'photo'},
  },
})
