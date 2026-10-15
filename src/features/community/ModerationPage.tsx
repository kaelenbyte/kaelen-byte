import { useAuth } from '../auth/AuthProvider'
import { useIsModerator, useModerationActions, usePendingReports } from '../moderation/useModeration'
import { formatRelativeTime } from '../../lib/format'
import { EmptyState, ErrorState, LoadingState } from './ui'

export function ModerationPage() {
  const { user } = useAuth()
  const role = useIsModerator(Boolean(user))
  const reports = usePendingReports(Boolean(role.data))
  const actions = useModerationActions()
  if (role.isLoading) return <LoadingState label="Checking moderator access..." />
  if (role.isError) return <ErrorState message="Could not verify moderator permissions." onRetry={() => void role.refetch()} />
  if (!role.data) return <EmptyState title="Moderator access required" description="This area is limited to verified moderators." />
  if (reports.isLoading) return <LoadingState label="Loading reports..." />
  if (reports.isError) return <ErrorState message="Could not load reports." onRetry={() => void reports.refetch()} />
  return <section className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-950/70 p-6"><h2 className="text-2xl font-semibold text-white">Moderation queue</h2><p className="mt-2 text-sm text-slate-400">Reporter details are visible only to authorized moderators.</p><div className="mt-5 space-y-4">{!reports.data?.length ? <EmptyState title="No pending reports" description="The queue is clear." /> : reports.data.map((report) => <article key={report.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold text-white">{report.target_type} · {report.reason}</p><time className="text-xs text-slate-500">{formatRelativeTime(report.created_at)}</time></div>{report.details && <p className="mt-2 text-sm text-slate-300">{report.details}</p>}<p className="mt-2 text-xs text-slate-500">Target: {report.target_id}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={actions.dismiss.isPending} onClick={() => actions.dismiss.mutate(report.id)} className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Dismiss</button>{report.target_type !== 'profile' && <button type="button" disabled={actions.action.isPending} onClick={() => { if (window.confirm(`Remove this ${report.target_type}?`)) actions.action.mutate({ reportId: report.id, targetType: report.target_type, targetId: report.target_id, reason: report.reason }) }} className="rounded-full bg-rose-500/15 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/25">Remove content</button>}</div></article>)}</div></section>
}
