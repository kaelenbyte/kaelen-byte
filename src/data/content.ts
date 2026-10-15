import type { PortableTextBlock } from '@portabletext/types'

export type Article = {
  _id: string
  slug: string
  title: string
  category: string
  excerpt: string
  publishedAt: string
  coverImage?: {
    _type: 'image'
    asset: { _ref: string; _type: 'reference' }
    alt?: string
  }
  body: PortableTextBlock[]
}
