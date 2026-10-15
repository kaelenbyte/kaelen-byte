import { useAuth } from '../auth/AuthProvider'
import { useSavedPosts } from '../saved/useSaved'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'
import type { FeedPost } from '../feed/useFeed'
import { PostCard } from './PostCard'
import { EmptyState, ErrorState, LoadingState } from './ui'

export function SavedPage() {
  const { user } = useAuth()
  const saved = useSavedPosts()
  const ids = saved.data?.map((post) => post.id) ?? []
  const hydrated = useQuery({
    queryKey: ['saved', 'hydrated', user?.id, ids],
    enabled: Boolean(user && ids.length),
    queryFn: async (): Promise<FeedPost[]> => {
      const client = getSupabaseClient()
      const rows = saved.data ?? []
      const authorIds = Array.from(new Set(rows.map((post) => post.user_id)))
      const { data: profiles, error } = await client.from('profiles').select('id,username,display_name,avatar_url').in('id', authorIds)
      throwIfError(error)
      const map = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
      return rows.map((post) => ({ ...post, author: map.get(post.user_id) ?? null, likedByMe: false, savedByMe: true }))
    },
  })
  if (saved.isLoading) return <LoadingState label="Loading saved posts..." />
  if (saved.isError) return <ErrorState message="Could not load saved posts." onRetry={() => void saved.refetch()} />
  if (!saved.data?.length) return <EmptyState title="No saved posts" description="Save a post to keep it handy here." />
  if (hydrated.isLoading) return <LoadingState label="Loading saved posts..." />
  if (hydrated.isError) return <ErrorState message="Could not load saved post authors." onRetry={() => void hydrated.refetch()} />
  return <div className="space-y-5">{(hydrated.data ?? []).map((post) => <PostCard key={post.id} post={post} />)}</div>
}
