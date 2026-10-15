export type SupabaseConfig = {
  url: string
  publishableKey: string
}

type RawEnv = {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_PUBLISHABLE_KEY?: string
  VITE_SUPABASE_ANON_KEY?: string
}

const readRawEnv = (): RawEnv => {
  const metaEnv = (import.meta.env ?? {}) as RawEnv
  return {
    VITE_SUPABASE_URL: metaEnv.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_ANON_KEY: metaEnv.VITE_SUPABASE_ANON_KEY,
  }
}

const isFilled = (value: string | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0

const looksLikeUrl = (value: string) => /^https?:\/\/.+/i.test(value)

export type SupabaseEnvStatus =
  | { configured: true; config: SupabaseConfig }
  | { configured: false; missing: string[]; invalid: string[] }

/**
 * Validates the public Supabase configuration that ships to the browser.
 * Only the anonymous/publishable key may ever be present here. Service-role
 * keys and database passwords must never be exposed through VITE_ variables.
 */
export const getSupabaseEnvStatus = (raw: RawEnv = readRawEnv()): SupabaseEnvStatus => {
  const missing: string[] = []
  const invalid: string[] = []

  const url = raw.VITE_SUPABASE_URL?.trim() ?? ''
  const key = (raw.VITE_SUPABASE_PUBLISHABLE_KEY ?? raw.VITE_SUPABASE_ANON_KEY ?? '').trim()

  if (!url) {
    missing.push('VITE_SUPABASE_URL')
  } else if (!looksLikeUrl(url)) {
    invalid.push('VITE_SUPABASE_URL must be an absolute https URL')
  }

  if (!key) {
    missing.push('VITE_SUPABASE_PUBLISHABLE_KEY')
  }

  if (missing.length > 0 || invalid.length > 0) {
    return { configured: false, missing, invalid }
  }

  return { configured: true, config: { url, publishableKey: key } }
}

export const isSupabaseConfigured = () => getSupabaseEnvStatus().configured

export const describeConfigError = (status: Extract<SupabaseEnvStatus, { configured: false }>) => {
  const parts: string[] = []
  if (status.missing.length > 0) {
    parts.push(`Missing: ${status.missing.join(', ')}`)
  }
  if (status.invalid.length > 0) {
    parts.push(`Invalid: ${status.invalid.join('; ')}`)
  }
  return parts.join('. ')
}

export { isFilled }
