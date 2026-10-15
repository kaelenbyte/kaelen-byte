import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Flag, Send, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { usePostDetail } from '../posts/usePosts'
import { useComments, useCommentMutations } from '../comments/useComments'
import { commentSchema, type CommentInput } from '../auth/schemas'
import { zodResolver } from '../../lib/rhfZodResolver'
import { formatExactTime, formatRelativeTime } from '../../lib/format'
import { toUserMessage } from '../../lib/errors'
import { Avatar, EmptyState, ErrorState, FieldError, inputClass, LoadingState, primaryButtonClass } from './ui'
import { ReportDialog } from './ReportDialog'
import { PostCard } from './PostCard'

export function PostDetailPage() {
  const { postId } = useParams()
  const { user } = useAuth()
  const postQuery = usePostDetail(postId)
  const commentsQuery = useComments(postId)
  const mutations = useCommentMutations(postId ?? '')
  const [submitError, setSubmitError] = useState('')
  const [reportCommentId, setReportCommentId] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentInput>({ resolver: zodResolver(commentSchema) })

  if (postQuery.isLoading) return <LoadingState label="Loading post..." />
  if (postQuery.isError) return <ErrorState message="Could not load this post." onRetry={() => void postQuery.refetch()} />
  const post = postQuery.data
  if (!post) return <EmptyState title="Post unavailable" description="This post may have been deleted." />

  const onSubmit = async (values: CommentInput) => {
    setSubmitError('')
    try { await mutations.create.mutateAsync(values.content); reset() }
    catch (error) { setSubmitError(toUserMessage(error, 'Comment could not be added.')) }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PostCard post={post} />
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
        <h2 className="text-xl font-semibold text-white">Comments</h2>
        {user ? <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex gap-2"><label className="sr-only" htmlFor="new-comment">Write a comment</label><input id="new-comment" placeholder="Write a comment..." className={inputClass} {...register('content')} /><button type="submit" disabled={mutations.create.isPending} className={primaryButtonClass}><Send className="h-4 w-4" aria-hidden="true" />Reply</button></form> : <p className="mt-3 text-sm text-slate-400">Sign in to join the conversation.</p>}
        <FieldError message={errors.content?.message ?? submitError} />
        {commentsQuery.isLoading ? <LoadingState label="Loading comments..." /> : commentsQuery.isError ? <ErrorState message="Could not load comments." onRetry={() => void commentsQuery.refetch()} /> : !commentsQuery.data?.length ? <p className="mt-5 text-sm text-slate-400">No comments yet.</p> : (
          <div className="mt-5 space-y-3">{commentsQuery.data.map((comment) => <article key={comment.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><Avatar src={comment.author?.avatar_url} name={comment.author?.display_name ?? 'Unknown user'} size={32} /><div><p className="text-sm font-semibold text-white">{comment.author?.display_name ?? 'Unknown user'}</p><time dateTime={comment.created_at} title={formatExactTime(comment.created_at)} className="text-xs text-slate-500">{formatRelativeTime(comment.created_at)}</time></div>{user?.id === comment.user_id ? <button type="button" aria-label="Delete comment" className="ml-auto text-slate-400 hover:text-rose-300" onClick={() => { if (window.confirm('Delete this comment?')) mutations.remove.mutate(comment.id) }}><Trash2 className="h-4 w-4" /></button> : user && <button type="button" aria-label="Report comment" className="ml-auto text-slate-400 hover:text-amber-200" onClick={() => setReportCommentId(comment.id)}><Flag className="h-4 w-4" /></button>}</div><p className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{comment.content}</p></article>)}</div>
        )}
      </section>
      <ReportDialog open={Boolean(reportCommentId)} onClose={() => setReportCommentId(null)} targetType="comment" targetId={reportCommentId ?? ''} />
    </div>
  )
}
