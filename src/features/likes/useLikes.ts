import { useMutation, useQueryClient } from '@tanstack/react-query'

import { likePost, unlikePost } from './api'
import type { FeedPost } from '../feed/useFeed'
import { useAuth } from '../auth/AuthProvider'

export const useToggleLike = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (post: Pick<FeedPost, 'id' | 'likedByMe'>) => {
      if (!user) {
        throw new Error('You must be signed in to like posts.')
      }
      if (post.likedByMe) {
        await unlikePost(post.id, user.id)
      } else {
        await likePost(post.id)
      }
    },
    onSettled: (_data, _error, post) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['post', post.id] })
      queryClient.invalidateQueries({ queryKey: ['saved'] })
    },
  })
}
