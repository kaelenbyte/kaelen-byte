import { useEffect, useState } from 'react'

import type { Article } from '../data/content'
import { sanityClient } from './client'

export type ContentQueryStatus = 'loading' | 'ready' | 'error' | 'unconfigured'

type QueryState<T> = {
  data: T | undefined
  status: ContentQueryStatus
}

const allPublishedArticlesQuery = `*[
  _type == "article" &&
  defined(slug.current) &&
  defined(publishedAt) &&
  dateTime(publishedAt) <= dateTime(now())
] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  publishedAt,
  coverImage,
  body
}`

const publishedArticleQuery = `*[
  _type == "article" &&
  slug.current == $slug &&
  defined(publishedAt) &&
  dateTime(publishedAt) <= dateTime(now())
][0] {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  publishedAt,
  coverImage,
  body
}`

function useLiveQuery<T>(query: string, paramsJson = '{}'): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    status: sanityClient ? 'loading' : 'unconfigured',
  })

  useEffect(() => {
    const client = sanityClient
    if (!client) return

    let active = true
    const params = JSON.parse(paramsJson) as Record<string, string>

    const refresh = async () => {
      try {
        const data = await client.fetch<T>(query, params)
        if (active) setState({ data, status: 'ready' })
      } catch {
        if (active) setState((current) => ({ ...current, status: 'error' }))
      }
    }

    void refresh()

    const subscription = client.listen(query, params, { includeResult: false }).subscribe({
      next: () => void refresh(),
      error: () => {
        if (active) setState((current) => ({ ...current, status: 'error' }))
      },
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [paramsJson, query])

  return sanityClient ? state : { data: undefined, status: 'unconfigured' }
}

export function usePublishedArticles() {
  return useLiveQuery<Article[]>(allPublishedArticlesQuery)
}

export function usePublishedArticle(slug: string | undefined) {
  return useLiveQuery<Article | null>(publishedArticleQuery, JSON.stringify({ slug }))
}