import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

import type { SanityImageSource } from '@sanity/image-url'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID?.trim()
export const dataset = import.meta.env.VITE_SANITY_DATASET?.trim() || 'production'

export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2025-02-19',
      useCdn: true,
    })
  : null

const imageUrlBuilder = sanityClient ? createImageUrlBuilder(sanityClient) : null

export function sanityImageUrl(source: SanityImageSource, width: number) {
  return imageUrlBuilder?.image(source).width(width).auto('format').url()
}