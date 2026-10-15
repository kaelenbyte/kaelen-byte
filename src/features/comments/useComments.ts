import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'
import type { Comment, Profile } from '../../integrations/supabase/database.types'
import { addComment, deleteComment, getCommentsForPost, updateComment } from './api'

export type CommentWithAuthor = Comment & {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null
}

export const useComments = (postId: string | undefined) =>
  useQuery({
    queryKey: ['comments', postId],
    enabled: Boolean(postId),
    queryFn: async (): Promise<CommentWithAuthor[]> => {
      const comments = await getCommentsForPost(postId as string)
      const authorIds = Array.from(new Set(comments.map((comment) => comment.user_id)))
      if (authorIds.length === 0) {
        return []
      }
      const client = getSupabaseClient()
      const { data, error } = await client
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', authorIds)
      throwIfError(error)
      const map = new Map((data ?? []).map((author) => [author.id, author]))
      return comments.map((comment) => ({
        ...comment,
        author: map.get(comment.user_id) ?? null,
      }))
    },
  })

export const useCommentMutations = (postId: string) => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    queryClient.invalidateQueries({ queryKey: ['post', postId] })
    queryClient.invalidateQueries({ queryKey: ['feed'] })
  }

  const create = useMutation({
    mutationFn: (content: string) => addComment(postId, content),
    onSuccess: invalidate,
  })

  const edit = useMutation({
    mutationFn: (input: { id: string; content: string }) =>
      updateComment(input.id, input.content),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: invalidate,
  })

  return { create, edit, remove }
}
