import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '../auth/AuthProvider'
import { useFollowing } from '../follows/useFollows'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'
import type { FeedPost } from '../feed/useFeed'
import type { PostDetails } from '../../integrations/supabase/database.types'
import { PostCard } from './PostCard'
import { Avatar, EmptyState, ErrorState, LoadingState } from './ui'

export function FollowingPage() {
  const { user } = useAuth()
  const following = useFollowing(user?.id)
  const followedIds = useMemo(() => following.data?.map((profile) => profile.id) ?? [], [following.data])

  const feed = useQuery({
    queryKey: ['feed', 'following', user?.id, followedIds],
    enabled: Boolean(user && following.isSuccess),
    queryFn: async (): Promise<FeedPost[]> => {
      if (!user || followedIds.length === 0) return []
      const client = getSupabaseClient()
      const { data: posts, error: postError } = await client
        .from('post_details')
        .select('*')
        .in('user_id', followedIds)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(50)
      throwIfError(postError)
      const rows = (posts ?? []) as PostDetails[]
      if (rows.length === 0) return []
      const ids = rows.map((post) => post.id)
      const authorIds = Array.from(new Set(rows.map((post) => post.user_id)))
      const [{ data: profiles, error: profileError }, { data: likes, error: likeError }, { data: saved, error: savedError }] = await Promise.all([
        client.from('profiles').select('id,username,display_name,avatar_url').in('id', authorIds),
        client.from('likes').select('post_id').eq('user_id', user.id).in('post_id', ids),
        client.from('saved_posts').select('post_id').eq('user_id', user.id).in('post_id', ids),
      ])
      throwIfError(profileError)
      throwIfError(likeError)
      throwIfError(savedError)
      const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
      const liked = new Set((likes ?? []).map((row) => row.post_id))
      const savedIds = new Set((saved ?? []).map((row) => row.post_id))
      return rows.map((post) => ({
        ...post,
        author: profileMap.get(post.user_id) ?? null,
        likedByMe: liked.has(post.id),
        savedByMe: savedIds.has(post.id),
      }))
    },
  })

  if (following.isLoading) return <LoadingState label="Loading followed profiles..." />
  if (following.isError) return <ErrorState message="Could not load your following list." onRetry={() => void following.refetch()} />

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
        <h2 className="text-2xl font-semibold text-white">Following</h2>
        <p className="mt-1 text-sm text-slate-400">Posts from people you follow.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {(following.data ?? []).map((profile) => (
            <Link key={profile.id} to={`/community/u/${profile.username}`} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <Avatar src={profile.avatar_url} name={profile.display_name} size={28} />
              <span className="text-sm text-slate-200">@{profile.username}</span>
            </Link>
          ))}
        </div>
      </section>
      {feed.isLoading ? <LoadingState label="Loading posts..." /> : feed.isError ? <ErrorState message="Could not load following posts." onRetry={() => void feed.refetch()} /> : !feed.data?.length ? <EmptyState title="Nothing in your following feed yet" description="Follow profiles to see their posts here." /> : <div className="space-y-5">{feed.data.map((post) => <PostCard key={post.id} post={post} />)}</div>}
    </div>
  )
}
