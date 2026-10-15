import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '../auth/AuthProvider'
import { getSavedPosts, savePost, unsavePost } from './api'

export const useSavedPosts = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['saved', user?.id],
    enabled: Boolean(user),
    queryFn: () => getSavedPosts(user?.id as string),
  })
}

export const useToggleSave = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (input: { postId: string; saved: boolean }) => {
      if (!user) {
        throw new Error('You must be signed in to save posts.')
      }
      if (input.saved) {
        await unsavePost(input.postId, user.id)
      } else {
        await savePost(input.postId)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['post'] })
    },
  })
}
