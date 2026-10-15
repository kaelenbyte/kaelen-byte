import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Flag } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { useProfileByUsername, useProfileStats } from '../profiles/useProfile'
import { useUserPosts } from '../posts/usePosts'
import { useIsFollowing, useToggleFollow } from '../follows/useFollows'
import { PostCard } from './PostCard'
import { Avatar, EmptyState, ErrorState, LoadingState, primaryButtonClass } from './ui'
import { formatExactTime } from '../../lib/format'
import { ReportDialog } from './ReportDialog'

export function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const profileQuery = useProfileByUsername(username)
  const profile = profileQuery.data
  const statsQuery = useProfileStats(profile?.id)
  const postsQuery = useUserPosts(profile?.id)
  const followingQuery = useIsFollowing(profile?.id)
  const toggleFollow = useToggleFollow()
  const [reportOpen, setReportOpen] = useState(false)

  if (profileQuery.isLoading) return <LoadingState label="Loading profile..." />
  if (profileQuery.isError) return <ErrorState message="Could not load this profile." onRetry={() => void profileQuery.refetch()} />
  if (!profile) return <EmptyState title="Profile not found" description="This profile may have been removed or the username may be incorrect." />

  const ownsProfile = user?.id === profile.id
  const stats = statsQuery.data

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
        <div className="h-36 bg-gradient-to-r from-sky-700/50 via-indigo-700/30 to-slate-900" />
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar src={profile.avatar_url} name={profile.display_name} size={76} className="-mt-12 border-4 border-slate-950" />
              <div><h2 className="text-2xl font-semibold text-white">{profile.display_name}</h2><p className="text-sm text-slate-400">@{profile.username}</p></div>
            </div>
            {ownsProfile ? <Link to="/community/settings" className={primaryButtonClass}>Edit profile</Link> : user && (
              <div className="flex gap-2">
                <button type="button" disabled={toggleFollow.isPending} className={primaryButtonClass}
                  onClick={() => toggleFollow.mutate({ followingId: profile.id, currentlyFollowing: Boolean(followingQuery.data) })}>
                  {followingQuery.data ? 'Following' : 'Follow'}
                </button>
                <button type="button" onClick={() => setReportOpen(true)} aria-label="Report profile" className="rounded-full border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/5"><Flag className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          {profile.bio && <p className="mt-5 max-w-2xl whitespace-pre-wrap text-slate-300">{profile.bio}</p>}
          <p className="mt-3 text-xs text-slate-500">Joined <time dateTime={profile.created_at} title={formatExactTime(profile.created_at)}>{new Date(profile.created_at).toLocaleDateString()}</time></p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-300">
            <span><strong className="text-white">{stats?.post_count ?? '—'}</strong> posts</span>
            <span><strong className="text-white">{stats?.follower_count ?? '—'}</strong> followers</span>
            <span><strong className="text-white">{stats?.following_count ?? '—'}</strong> following</span>
          </div>
        </div>
      </section>
      {postsQuery.isLoading ? <LoadingState label="Loading posts..." /> : postsQuery.isError ? <ErrorState message="Could not load this profile's posts." onRetry={() => void postsQuery.refetch()} /> : !postsQuery.data?.length ? <EmptyState title="No posts yet" description="This profile has not shared anything yet." /> : (
        <div className="space-y-5">{postsQuery.data.map((post) => <PostCard key={post.id} post={post} />)}</div>
      )}
      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="profile" targetId={profile.id} />
    </div>
  )
}
