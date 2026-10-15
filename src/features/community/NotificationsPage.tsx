import { Bell, Check } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { useNotificationMutations, useNotifications } from '../notifications/useNotifications'
import { formatRelativeTime } from '../../lib/format'
import { EmptyState, ErrorState, LoadingState } from './ui'

export function NotificationsPage() {
  const { user } = useAuth()
  const query = useNotifications(Boolean(user))
  const mutations = useNotificationMutations()
  if (query.isLoading) return <LoadingState label="Loading notifications..." />
  if (query.isError) return <ErrorState message="Could not load notifications." onRetry={() => void query.refetch()} />
  const notifications = query.data ?? []
  return <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-slate-950/70 p-6"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><Bell className="h-5 w-5 text-sky-300" /><h2 className="text-2xl font-semibold text-white">Notifications</h2></div>{notifications.some((item) => !item.read_at) && <button type="button" onClick={() => mutations.markAllRead.mutate()} className="text-sm text-sky-200 hover:text-white">Mark all read</button>}</div><div className="mt-5 space-y-3">{notifications.length === 0 ? <EmptyState title="No notifications yet" description="Likes, comments and follows will appear here." /> : notifications.map((item) => <article key={item.id} className={`flex items-start gap-3 rounded-2xl border p-4 ${item.read_at ? 'border-white/5 bg-white/[0.02]' : 'border-sky-400/20 bg-sky-500/5'}`}><div className="flex-1"><p className="text-sm text-slate-200">{item.message ?? notificationLabel(item.type)}</p><p className="mt-1 text-xs text-slate-500">{formatRelativeTime(item.created_at)}</p></div>{!item.read_at && <button type="button" aria-label="Mark notification as read" onClick={() => mutations.markRead.mutate(item.id)} className="rounded-full p-2 text-sky-200 hover:bg-white/5"><Check className="h-4 w-4" /></button>}</article>)}</div></section>
}

function notificationLabel(type: string) {
  if (type === 'like') return 'Someone liked your post.'
  if (type === 'comment') return 'Someone commented on your post.'
  if (type === 'follow') return 'Someone followed you.'
  return 'A moderator updated one of your posts.'
}
