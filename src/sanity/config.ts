import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { schemaTypes } from './schema'

export const sanityConfig = defineConfig({
  name: 'kaelen-byte',
  title: 'Kaelen Byte Studio',
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID?.trim() || 'missing-project-id',
  dataset: import.meta.env.VITE_SANITY_DATASET?.trim() || 'production',
  basePath: '/studio',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
})