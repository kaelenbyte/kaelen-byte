import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'

import { getSupabaseClient, SupabaseConfigError } from '../../integrations/supabase/client'
import type { Database } from '../../integrations/supabase/database.types'
import { toUserMessage } from '../../lib/errors'
import { isSupabaseConfigured } from '../../integrations/supabase/env'

type Profile = Database['public']['Tables']['profiles']['Row']

type AuthUser = User | null
type AuthSession = Session | null

type SignUpResult = {
  user: AuthUser
  session: AuthSession
  needsEmailConfirmation: boolean
}

type AuthContextValue = {
  user: AuthUser
  session: AuthSession
  profile: Profile | null
  loading: boolean
  initialized: boolean
  profileMissing: boolean
  isConfigured: boolean
  configError: string | null
  signUp: (
    email: string,
    password: string,
    username: string,
    displayName: string,
  ) => Promise<SignUpResult>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  refreshProfile: () => Promise<void>
  ensureProfile: (displayName: string, username: string) => Promise<Profile>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const getFallbackRedirect = () => {
  const base = (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')
  return `${base}/community/reset-password`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser>(null)
  const [session, setSession] = useState<AuthSession>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)

  const fetchProfile = async (userId: string | null): Promise<Profile | null> => {
    if (!userId) {
      return null
    }

    try {
      const client = getSupabaseClient()
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.warn('Failed to fetch profile', error)
        return null
      }

      return data
    } catch (error) {
      console.warn('Failed to fetch profile', error)
      return null
    }
  }

  const loadProfile = async (userId: string | null) => {
    const next = await fetchProfile(userId)
    setProfile(next)
    return next
  }

  const refreshProfile = async () => {
    await loadProfile(user?.id ?? null)
  }

  const ensureProfile = async (displayName: string, username: string): Promise<Profile> => {
    const client = getSupabaseClient()
    const userId = user?.id

    if (!userId) {
      throw new Error('You must be signed in to complete your profile.')
    }

    const normalizedUsername = username.trim().toLowerCase()
    const { error } = await client.from('profiles').upsert(
      {
        id: userId,
        username: normalizedUsername,
        display_name: displayName.trim(),
      },
      { onConflict: 'id' },
    )

    if (error) {
      throw error
    }

    const next = await fetchProfile(userId)
    if (!next) {
      throw new Error('Failed to load your profile after saving.')
    }
    setProfile(next)
    return next
  }

  useEffect(() => {
    const configured = isSupabaseConfigured()
    setIsConfigured(configured)
    if (!configured) {
      setLoading(false)
      setInitialized(true)
      setConfigError('Supabase environment variables are missing. See .env.example.')
      return
    }

    let isMounted = true
    setConfigError(null)

    const init = async () => {
      try {
        const client = getSupabaseClient()
        const { data } = await client.auth.getSession()
        if (!isMounted) {
          return
        }
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
        await loadProfile(data.session?.user?.id ?? null)
      } catch (error) {
        if (error instanceof SupabaseConfigError) {
          setConfigError(error.message)
        } else {
          console.warn('Failed to initialize auth', error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    init()

    const {
      data: { subscription },
    } = getSupabaseClient().auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) {
        return
      }
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      if (!nextSession) queryClient.clear()
      await loadProfile(nextSession?.user?.id ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const profileMissing = Boolean(initialized && isConfigured && user && !profile)

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      initialized,
      profileMissing,
      isConfigured,
      configError,
      signUp: async (email, password, username, displayName) => {
        if (!isConfigured) {
          throw new Error('Supabase is not configured.')
        }
        const client = getSupabaseClient()
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim().toLowerCase(),
              display_name: displayName.trim(),
            },
            emailRedirectTo: `${(import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')}/community`,
          },
        })
        if (error) {
          throw error
        }
        if (data.session) {
          setSession(data.session)
          setUser(data.user ?? null)
          await loadProfile(data.user?.id ?? null)
        } else {
          // An account awaiting email confirmation exists in Auth, but it is
          // not an authenticated browser session and must not pass route guards.
          setSession(null)
          setUser(null)
          setProfile(null)
        }
        return {
          user: data.user ?? null,
          session: data.session ?? null,
          needsEmailConfirmation: !data.session,
        }
      },
      signIn: async (email, password) => {
        if (!isConfigured) {
          throw new Error('Supabase is not configured.')
        }
        const client = getSupabaseClient()
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          throw error
        }
      },
      signOut: async () => {
        if (!isConfigured) {
          queryClient.clear()
          setUser(null)
          setSession(null)
          setProfile(null)
          return
        }
        const client = getSupabaseClient()
        const { error } = await client.auth.signOut()
        if (error) {
          throw error
        }
        queryClient.clear()
        setProfile(null)
      },
      resetPassword: async (email) => {
        if (!isConfigured) {
          throw new Error('Supabase is not configured.')
        }
        const client = getSupabaseClient()
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: getFallbackRedirect(),
        })
        if (error) {
          throw error
        }
      },
      updatePassword: async (password) => {
        if (!isConfigured) {
          throw new Error('Supabase is not configured.')
        }
        const client = getSupabaseClient()
        const { error } = await client.auth.updateUser({ password })
        if (error) {
          throw error
        }
      },
      refreshProfile,
      ensureProfile,
    }),
    [initialized, isConfigured, configError, loading, profile, profileMissing, session, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const getAuthErrorMessage = toUserMessage
