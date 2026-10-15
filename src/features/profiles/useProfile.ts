import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '../auth/AuthProvider'
import {
  getProfileById,
  getProfileByUsername,
  getProfileStats,
  updateProfile,
  searchProfiles,
} from './api'
import { deleteImage, uploadImage } from '../storage/uploadApi'

export const useProfileByUsername = (username: string | undefined) =>
  useQuery({
    queryKey: ['profiles', 'username', username?.toLowerCase()],
    enabled: Boolean(username),
    queryFn: () => getProfileByUsername(username as string),
  })

export const useProfileStats = (userId: string | undefined) =>
  useQuery({
    queryKey: ['profiles', 'stats', userId],
    enabled: Boolean(userId),
    queryFn: () => getProfileStats(userId as string),
  })

export const useProfileById = (userId: string | undefined) =>
  useQuery({
    queryKey: ['profiles', 'id', userId],
    enabled: Boolean(userId),
    queryFn: () => getProfileById(userId as string),
  })

export const useSearchProfiles = (query: string) =>
  useQuery({
    queryKey: ['profiles', 'search', query],
    enabled: query.trim().length >= 2,
    queryFn: () => searchProfiles(query),
  })

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { user, profile, refreshProfile } = useAuth()

  return useMutation({
    mutationFn: async (input: {
      displayName: string
      bio: string
      username: string
      avatarFile?: File | null
      avatarUrl?: string
    }) => {
      if (!user) {
        throw new Error('You must be signed in to edit your profile.')
      }
      let avatarUrl = input.avatarUrl ?? ''
      let uploadedUrl: string | null = null
      if (input.avatarFile) {
        avatarUrl = await uploadImage('avatars', input.avatarFile, user.id)
        uploadedUrl = avatarUrl
      }
      try {
        const updated = await updateProfile(user.id, {
          display_name: input.displayName,
          bio: input.bio,
          username: input.username,
          avatar_url: avatarUrl || null,
        })
        if (uploadedUrl && profile?.avatar_url && profile.avatar_url !== uploadedUrl) {
          await deleteImage('avatars', profile.avatar_url)
        }
        return updated
      } catch (error) {
        if (uploadedUrl) await deleteImage('avatars', uploadedUrl)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      void refreshProfile()
    },
  })
}
