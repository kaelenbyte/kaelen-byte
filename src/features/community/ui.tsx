import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

export function Avatar({
  src,
  name,
  size = 44,
  className = '',
}: {
  src?: string | null
  name: string
  size?: number
  className?: string
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const style = { width: size, height: size }

  if (src) {
    return (
      <img
        src={src}
        alt={`${name} avatar`}
        width={size}
        height={size}
        loading="lazy"
        style={style}
        className={`shrink-0 rounded-full border border-white/10 object-cover ${className}`}
      />
    )
  }

  return (
    <span
      aria-label={`${name} avatar`}
      role="img"
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-sky-500/40 to-indigo-600/40 font-semibold text-white ${className}`}
    >
      {initial}
    </span>
  )
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-8 text-slate-300">
      <Spinner />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/60 p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div role="alert" className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-100">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/20"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ConfigNotice({ message }: { message?: string }) {
  return (
    <div role="alert" className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 text-amber-50">
      <h2 className="text-lg font-semibold">Community backend is not configured</h2>
      <p className="mt-2 text-sm text-amber-100/90">
        {message ??
          'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable accounts, posts, and live updates.'}
      </p>
      <p className="mt-2 text-sm text-amber-100/90">
        See <code className="rounded bg-black/30 px-1.5 py-0.5">.env.example</code> and the README for setup steps.
      </p>
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }
  return (
    <p className="mt-1.5 text-sm text-rose-300" role="alert">
      {message}
    </p>
  )
}

export const inputClass =
  'w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30'

export const labelClass = 'mb-2 block text-sm font-medium text-slate-200'

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60'

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-300/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60'
