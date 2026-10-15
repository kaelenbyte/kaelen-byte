import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { PostDetails, Profile } from '../../integrations/supabase/database.types'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'
import { getFeedPage, type Cursor } from '../posts/api'
import { useAuth } from '../auth/AuthProvider'

export type FeedPost = PostDetails & {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null
  likedByMe: boolean
  savedByMe: boolean
}

const dedupeById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      result.push(item)
    }
  }
  return result
}

export const useFeed = () => {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const feedQuery = useInfiniteQuery({
    queryKey: ['feed'],
    initialPageParam: null as Cursor,
    queryFn: ({ pageParam }) => getFeedPage(25, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 15_000,
  })

  const posts = useMemo(() => {
    const flattened = feedQuery.data?.pages.flatMap((page) => page.items) ?? []
    return dedupeById(flattened)
  }, [feedQuery.data])

  const postIds = useMemo(() => posts.map((post) => post.id), [posts])
  const authorIds = useMemo(
    () => Array.from(new Set(posts.map((post) => post.user_id))),
    [posts],
  )

  const authorsQuery = useQuery({
    queryKey: ['feed', 'authors', authorIds],
    enabled: authorIds.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const client = getSupabaseClient()
      const { data, error } = await client
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', authorIds)
      throwIfError(error)
      return data ?? []
    },
  })

  const likesQuery = useQuery({
    queryKey: ['feed', 'my-likes', userId, postIds],
    enabled: Boolean(userId) && postIds.length > 0,
    staleTime: 10_000,
    queryFn: async () => {
      const client = getSupabaseClient()
      const { data, error } = await client
        .from('likes')
        .select('post_id')
        .eq('user_id', userId as string)
        .in('post_id', postIds)
      throwIfError(error)
      return (data ?? []).map((row) => row.post_id)
    },
  })

  const savedQuery = useQuery({
    queryKey: ['feed', 'my-saves', userId, postIds],
    enabled: Boolean(userId) && postIds.length > 0,
    staleTime: 10_000,
    queryFn: async () => {
      const client = getSupabaseClient()
      const { data, error } = await client
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', userId as string)
        .in('post_id', postIds)
      throwIfError(error)
      return (data ?? []).map((row) => row.post_id)
    },
  })

  const authorMap = useMemo(() => {
    const map = new Map<string, FeedPost['author']>()
    for (const author of authorsQuery.data ?? []) {
      map.set(author.id, author)
    }
    return map
  }, [authorsQuery.data])

  const likedSet = useMemo(() => new Set(likesQuery.data ?? []), [likesQuery.data])
  const savedSet = useMemo(() => new Set(savedQuery.data ?? []), [savedQuery.data])

  const feed: FeedPost[] = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        author: authorMap.get(post.user_id) ?? null,
        likedByMe: likedSet.has(post.id),
        savedByMe: savedSet.has(post.id),
      })),
    [posts, authorMap, likedSet, savedSet],
  )

  return {
    feed,
    isLoading: feedQuery.isLoading,
    isError: feedQuery.isError,
    error: feedQuery.error,
    refetch: feedQuery.refetch,
    fetchNextPage: feedQuery.fetchNextPage,
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    isRefetching: feedQuery.isRefetching,
  }
}

export { dedupeById }
