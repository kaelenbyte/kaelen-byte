import { describe, expect, it } from 'vitest'

import { getSupabaseEnvStatus } from './env'

describe('Supabase environment validation', () => {
  it('accepts a URL and publishable key', () => {
    expect(getSupabaseEnvStatus({
      VITE_SUPABASE_URL: 'https://sample.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
    })).toEqual({
      configured: true,
      config: { url: 'https://sample.supabase.co', publishableKey: 'sb_publishable_test' },
    })
  })

  it('reports missing and malformed configuration without throwing', () => {
    expect(getSupabaseEnvStatus({ VITE_SUPABASE_URL: 'not-a-url' })).toEqual({
      configured: false,
      missing: ['VITE_SUPABASE_PUBLISHABLE_KEY'],
      invalid: ['VITE_SUPABASE_URL must be an absolute https URL'],
    })
  })
})
