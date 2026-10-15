import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '../auth/AuthProvider'
import { createPost, getPost, getPostDetails, getUserPosts, deletePost, updatePost } from './api'
import type { CreatePostInput, UpdatePostInput } from './api'
import { getProfileById } from '../profiles/api'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'
import type { FeedPost } from '../feed/useFeed'

export const usePostDetail = (postId: string | undefined) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['post', postId],
    enabled: Boolean(postId),
    queryFn: async (): Promise<FeedPost | null> => {
      if (!postId) {
        return null
      }
      const details = await getPostDetails(postId)
      if (!details) {
        return null
      }
      const author = await getProfileById(details.user_id)

      let likedByMe = false
      let savedByMe = false
      if (user) {
        const client = getSupabaseClient()
        const { data: like, error: likeError } = await client
          .from('likes')
          .select('post_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()
        throwIfError(likeError)
        likedByMe = Boolean(like)

        const { data: saved, error: savedError } = await client
          .from('saved_posts')
          .select('post_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()
        throwIfError(savedError)
        savedByMe = Boolean(saved)
      }

      return {
        ...details,
        author: author
          ? {
              id: author.id,
              username: author.username,
              display_name: author.display_name,
              avatar_url: author.avatar_url,
            }
          : null,
        likedByMe,
        savedByMe,
      }
    },
  })
}

export const useUserPosts = (userId: string | undefined) => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['posts', 'user', userId, user?.id],
    enabled: Boolean(userId),
    queryFn: async (): Promise<FeedPost[]> => {
      const posts = await getUserPosts(userId as string)
      if (posts.length === 0) return []

      const client = getSupabaseClient()
      const [{ data: author, error: authorError }, { data: likes, error: likesError }, { data: saved, error: savedError }] = await Promise.all([
        client.from('profiles').select('id,username,display_name,avatar_url').eq('id', userId as string).maybeSingle(),
        user
          ? client.from('likes').select('post_id').eq('user_id', user.id).in('post_id', posts.map((post) => post.id))
          : Promise.resolve({ data: [], error: null }),
        user
          ? client.from('saved_posts').select('post_id').eq('user_id', user.id).in('post_id', posts.map((post) => post.id))
          : Promise.resolve({ data: [], error: null }),
      ])
      throwIfError(authorError)
      throwIfError(likesError)
      throwIfError(savedError)
      const likedIds = new Set((likes ?? []).map((row) => row.post_id))
      const savedIds = new Set((saved ?? []).map((row) => row.post_id))
      return posts.map((post) => ({
        ...post,
        author: author ?? null,
        likedByMe: likedIds.has(post.id),
        savedByMe: savedIds.has(post.id),
      }))
    },
  })
}

export const usePostMutations = (postId?: string) => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] })
    queryClient.invalidateQueries({ queryKey: ['posts'] })
    if (postId) {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    }
  }

  const update = useMutation({
    mutationFn: (input: UpdatePostInput) => updatePost(postId as string, input),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: () => deletePost(postId as string),
    onSuccess: invalidate,
  })

  return { update, remove }
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export const useRawPost = (postId: string | undefined) =>
  useQuery({
    queryKey: ['post', 'raw', postId],
    enabled: Boolean(postId),
    queryFn: () => getPost(postId as string),
  })
