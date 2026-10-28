import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'Doctors Health Aotearoa',
  projectId: 'mq6n6kkq',
  dataset: 'production',
  plugins: [structureTool({structure}), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: 'supportResource-by-category',
        title: 'Resource in category',
        schemaType: 'supportResource',
        parameters: [{name: 'categoryId', type: 'string'}],
        value: ({categoryId}: {categoryId: string}) => ({
          category: {_type: 'reference', _ref: categoryId},
        }),
      },
    ],
  },
})
