import { Link } from 'react-router-dom'

import { useAuth } from '../auth/AuthProvider'
import { useFeed } from '../feed/useFeed'
import { PostCard } from './PostCard'
import { PostComposer } from './PostComposer'
import {
  ConfigNotice,
  EmptyState,
  ErrorState,
  LoadingState,
  primaryButtonClass,
} from './ui'

export function FeedPage() {
  const { user, isConfigured, configError } = useAuth()
  const {
    feed,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed()

  if (!isConfigured) {
    return <ConfigNotice message={configError ?? undefined} />
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5">
        {user ? (
          <PostComposer />
        ) : (
          <div className="rounded-3xl border border-dashed border-sky-400/40 bg-sky-500/10 p-8 text-center">
            <h2 className="text-2xl font-semibold text-white">Sign in to post</h2>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/community/login" className={primaryButtonClass}>
                Sign in
              </Link>
              <Link
                to="/community/signup"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-sky-300/50"
              >
                Create account
              </Link>
            </div>
          </div>
        )}

        {isLoading ? (
          <LoadingState label="Loading the feed..." />
        ) : isError ? (
          <ErrorState
            message="We could not load the feed."
            onRetry={() => {
              void refetch()
            }}
          />
        ) : feed.length === 0 ? (
          <EmptyState title="No posts yet" description="Posts will show here when people share them." />
        ) : (
          <div className="space-y-5">
            {feed.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                void fetchNextPage()
              }}
              disabled={isFetchingNextPage}
              className={primaryButtonClass}
            >
              {isFetchingNextPage ? 'Loading more...' : 'Load more posts'}
            </button>
          </div>
        )}
    </main>
  )
}
