import { useState } from 'react'
import {
  Bookmark,
  Check,
  Flag,
  Heart,
  ImageIcon,
  MessageCircle,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import type { FeedPost } from '../feed/useFeed'
import { useAuth } from '../auth/AuthProvider'
import { useToggleLike } from '../likes/useLikes'
import { useToggleSave } from '../saved/useSaved'
import { usePostMutations } from '../posts/usePosts'
import { deleteImage } from '../storage/uploadApi'
import { formatExactTime, formatRelativeTime } from '../../lib/format'
import { toUserMessage } from '../../lib/errors'
import { ReportDialog } from './ReportDialog'
import { Avatar, FieldError, inputClass, primaryButtonClass, secondaryButtonClass } from './ui'

export function PostCard({ post }: { post: FeedPost }) {
  const { user } = useAuth()
  const isAuthor = Boolean(user && post.user_id === user.id)
  const toggleLike = useToggleLike()
  const toggleSave = useToggleSave()
  const { update, remove } = usePostMutations(post.id)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(post.content)
  const [actionError, setActionError] = useState('')
  const [reportOpen, setReportOpen] = useState(false)

  const authorName = post.author?.display_name ?? 'Unknown user'
  const authorUsername = post.author?.username ?? 'unknown'

  const handleLike = async () => {
    if (!user) {
      setActionError('Sign in to like posts.')
      return
    }
    setActionError('')
    try {
      await toggleLike.mutateAsync({ id: post.id, likedByMe: post.likedByMe })
    } catch (error) {
      setActionError(toUserMessage(error))
    }
  }

  const handleSave = async () => {
    if (!user) {
      setActionError('Sign in to save posts.')
      return
    }
    try {
      await toggleSave.mutateAsync({ postId: post.id, saved: post.savedByMe })
    } catch (error) {
      setActionError(toUserMessage(error))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) {
      return
    }
    try {
      await remove.mutateAsync()
      await deleteImage('post-images', post.image_url)
    } catch (error) {
      setActionError(toUserMessage(error, 'The post could not be deleted.'))
    }
  }

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!draft.trim()) {
      setActionError('A post cannot be empty.')
      return
    }
    try {
      await update.mutateAsync({ content: draft, imageUrl: post.image_url })
      setEditing(false)
      setActionError('')
    } catch (error) {
      setActionError(toUserMessage(error, 'The post could not be updated.'))
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
      <div className="flex items-center justify-between gap-3 p-5">
        <Link to={`/community/u/${authorUsername}`} className="flex items-center gap-3">
          <Avatar src={post.author?.avatar_url} name={authorName} />
          <div>
            <p className="font-semibold text-white">{authorName}</p>
            <p className="text-xs text-slate-400">
              @{authorUsername} ·{' '}
              <time dateTime={post.created_at} title={formatExactTime(post.created_at)}>
                {formatRelativeTime(post.created_at)}
              </time>
            </p>
          </div>
        </Link>

        {isAuthor && !editing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft(post.content)
                setEditing(true)
              }}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Edit post"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={remove.isPending}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200 disabled:opacity-60"
              aria-label="Delete post"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              {remove.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-3">
            <label className="sr-only" htmlFor={`edit-${post.id}`}>
              Edit post content
            </label>
            <textarea
              id={`edit-${post.id}`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
              maxLength={280}
              className={inputClass}
            />
            <div className="flex items-center gap-3">
              <button type="submit" disabled={update.isPending} className={primaryButtonClass}>
                <Check className="h-4 w-4" aria-hidden="true" />
                {update.isPending ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className={secondaryButtonClass}>
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="whitespace-pre-wrap break-words text-base leading-7 text-slate-100">
              {post.content}
            </p>
            {post.image_url && (
              <img
                src={post.image_url}
                alt={`Image shared by ${authorName}`}
                loading="lazy"
                className="mt-4 max-h-96 w-full rounded-2xl border border-white/10 object-cover"
              />
            )}
          </>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleLike}
            disabled={toggleLike.isPending}
            aria-pressed={post.likedByMe}
            aria-label={post.likedByMe ? 'Unlike post' : 'Like post'}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition disabled:opacity-60 ${
              post.likedByMe ? 'bg-rose-500/15 text-rose-200' : 'bg-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            <Heart className={`h-4 w-4 ${post.likedByMe ? 'fill-current' : ''}`} aria-hidden="true" />
            {post.like_count}
          </button>

          <Link
            to={`/community/post/${post.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            aria-label={`View post, ${post.comment_count} comments`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {post.comment_count}
          </Link>

          {user && (
            <button
              type="button"
              onClick={handleSave}
              disabled={toggleSave.isPending}
              aria-pressed={post.savedByMe}
              aria-label={post.savedByMe ? 'Remove from saved' : 'Save post'}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition disabled:opacity-60 ${
                post.savedByMe ? 'bg-sky-500/15 text-sky-200' : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${post.savedByMe ? 'fill-current' : ''}`} aria-hidden="true" />
              {post.savedByMe ? 'Saved' : 'Save'}
            </button>
          )}

          {user && !isAuthor && (
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              aria-label="Report post"
            >
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />
              Report
            </button>
          )}
        </div>

        {post.image_url === null && post.content.length === 0 && (
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
            No media
          </p>
        )}

        <FieldError message={actionError} />
      </div>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetId={post.id}
      />
    </article>
  )
}
