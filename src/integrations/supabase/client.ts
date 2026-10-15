import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './database.types'
import { describeConfigError, getSupabaseEnvStatus } from './env'

export type TypedSupabaseClient = SupabaseClient<Database>

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SupabaseConfigError'
  }
}

let cachedClient: TypedSupabaseClient | null = null

/**
 * Returns the shared, typed Supabase browser client or throws a descriptive
 * configuration error when required public environment variables are absent.
 * The client only ever uses the anonymous/publishable key.
 */
export const getSupabaseClient = (): TypedSupabaseClient => {
  if (cachedClient) {
    return cachedClient
  }

  const status = getSupabaseEnvStatus()
  if (!status.configured) {
    throw new SupabaseConfigError(
      `Supabase is not configured. ${describeConfigError(status)}. ` +
        'Copy .env.example to .env and add your project credentials.',
    )
  }

  cachedClient = createClient<Database>(status.config.url, status.config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'kaelen-community-auth',
    },
  })

  return cachedClient
}

/** Test-only override so specs can inject a mock client. */
export const __setSupabaseClientForTests = (client: TypedSupabaseClient | null) => {
  cachedClient = client
}
