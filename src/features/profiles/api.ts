import { getSupabaseClient } from '../../integrations/supabase/client'
import type { Profile, ProfileStats } from '../../integrations/supabase/database.types'
import { throwIfError } from '../../lib/errors'

export const getProfileByUsername = async (username: string): Promise<Profile | null> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .ilike('username', username.trim())
    .maybeSingle()
  throwIfError(error)
  return data
}

export const getProfileById = async (id: string): Promise<Profile | null> => {
  const client = getSupabaseClient()
  const { data, error } = await client.from('profiles').select('*').eq('id', id).maybeSingle()
  throwIfError(error)
  return data
}

export const updateProfile = async (
  userId: string,
  patch: {
    display_name: string
    bio: string
    avatar_url?: string | null
    username: string
  },
): Promise<Profile> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('profiles')
    .update({
      display_name: patch.display_name,
      bio: patch.bio,
      avatar_url: patch.avatar_url ?? null,
      username: patch.username.toLowerCase(),
    })
    .eq('id', userId)
    .select('*')
    .single()
  throwIfError(error)
  if (!data) {
    throw new Error('Profile not found after update.')
  }
  return data
}

export const getProfileStats = async (id: string): Promise<ProfileStats | null> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('profile_stats')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  throwIfError(error)
  return data
}

export const searchProfiles = async (
  query: string,
  limit = 20,
): Promise<Array<Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'bio'>>> => {
  const client = getSupabaseClient()
  const q = query.trim()
  if (!q) {
    return []
  }
  const { data, error } = await client
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .ilike('username', `%${q}%`)
    .limit(limit)
  throwIfError(error)
  return data ?? []
}
