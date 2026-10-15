export class AppError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

type PostgrestLikeError = {
  code?: string
  message?: string
  details?: string | null
  hint?: string | null
}

const RATE_LIMIT_CODES = new Set(['check_violation', 'P0001'])

/**
 * Maps a Postgres/PostgREST error into a message that is safe to show a user.
 * We intentionally avoid leaking raw database details or stack traces.
 */
export const toUserMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (!error) {
    return fallback
  }

  const candidate = error as PostgrestLikeError & { cause?: PostgrestLikeError }
  const inner = candidate.cause ?? candidate
  const message = typeof inner.message === 'string' ? inner.message : ''

  if (/rate limit/i.test(message)) {
    return 'You are posting too quickly. Please wait a moment and try again.'
  }
  if (inner.code === '23505' || /duplicate key|already exists|already taken/i.test(message)) {
    return 'That value is already in use. Try a different one.'
  }
  if (inner.code === '23503' || /foreign key/i.test(message)) {
    return 'The related record no longer exists.'
  }
  if (inner.code === '42501' || /row-level security|permission denied/i.test(message)) {
    return 'You do not have permission to perform this action.'
  }
  if (RATE_LIMIT_CODES.has(inner.code ?? '')) {
    return message || 'That action is not allowed right now.'
  }
  if (/jwt|session|token|refresh/i.test(message)) {
    return 'Your session has expired. Please sign in again.'
  }
  if (/failed to fetch|network|load failed/i.test(message)) {
    return 'Network error. Check your connection and try again.'
  }

  const isSafe = message.length > 0 && message.length < 200 && !/[{}[\]]/.test(message)
  return isSafe ? message : fallback
}

export const throwIfError = (error: unknown) => {
  if (error) {
    throw error
  }
}
