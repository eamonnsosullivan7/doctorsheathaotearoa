// @ts-check
import react from '@astrojs/react'
import sanity from '@sanity/astro'
import {defineConfig} from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.doctorshealth.co.nz',
  integrations: [
    sanity({
      projectId: 'mq6n6kkq',
      dataset: 'production',
      apiVersion: '2026-10-01',
      // Static build: always read fresh content at build time.
      useCdn: false,
      studioBasePath: '/studio',
      injectTypes: true,
    }),
    react(),
  ],
})
