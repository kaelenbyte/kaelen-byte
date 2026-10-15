import type { Follow } from '../../integrations/supabase/database.types'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'

export const followUser = async (followingId: string) => {
  const client = getSupabaseClient()
  const { error } = await client.from('follows').insert({ following_id: followingId })
  throwIfError(error)
}

export const unfollowUser = async (followingId: string, followerId: string) => {
  const client = getSupabaseClient()
  const { error } = await client
    .from('follows')
    .delete()
    .eq('following_id', followingId)
    .eq('follower_id', followerId)
  throwIfError(error)
}

export const getFollowers = async (followingId: string): Promise<Follow[]> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('follows')
    .select('*')
    .eq('following_id', followingId)
    .order('created_at', { ascending: false })
  throwIfError(error)
  return data ?? []
}

export const getFollowing = async (followerId: string): Promise<Follow[]> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .order('created_at', { ascending: false })
  throwIfError(error)
  return data ?? []
}

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle()
  throwIfError(error)
  return Boolean(data)
}
