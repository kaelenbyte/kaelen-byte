import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '../auth/AuthProvider'
import { followUser, getFollowers, getFollowing, isFollowing, unfollowUser } from './api'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'
import type { Profile } from '../../integrations/supabase/database.types'

export const useIsFollowing = (followingId: string | undefined) => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['follows', 'is-following', user?.id, followingId],
    enabled: Boolean(user && followingId),
    queryFn: () => isFollowing(user?.id as string, followingId as string),
  })
}

export const useToggleFollow = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (input: { followingId: string; currentlyFollowing: boolean }) => {
      if (!user) {
        throw new Error('You must be signed in to follow people.')
      }
      if (input.followingId === user.id) {
        throw new Error('You cannot follow yourself.')
      }
      if (input.currentlyFollowing) {
        await unfollowUser(input.followingId, user.id)
      } else {
        await followUser(input.followingId)
      }
    },
    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({ queryKey: ['follows'] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['feed', 'following'] })
      queryClient.invalidateQueries({ queryKey: ['follows', 'is-following'] })
      void input
    },
  })
}

const hydrateFollows = async (
  rows: { follower_id: string; following_id: string }[],
  idField: 'follower_id' | 'following_id',
): Promise<Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'bio'>[]> => {
  const ids = Array.from(new Set(rows.map((row) => row[idField])))
  if (ids.length === 0) {
    return []
  }
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .in('id', ids)
  throwIfError(error)
  return data ?? []
}

export const useFollowers = (userId: string | undefined) =>
  useQuery({
    queryKey: ['follows', 'followers', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const rows = await getFollowers(userId as string)
      return hydrateFollows(rows, 'follower_id')
    },
  })

export const useFollowing = (userId: string | undefined) =>
  useQuery({
    queryKey: ['follows', 'following', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const rows = await getFollowing(userId as string)
      return hydrateFollows(rows, 'following_id')
    },
  })
