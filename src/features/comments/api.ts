import type { Comment } from '../../integrations/supabase/database.types'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'

export const addComment = async (postId: string, content: string): Promise<Comment> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('comments')
    .insert({ post_id: postId, content: content.trim() })
    .select('*')
    .single()
  throwIfError(error)
  if (!data) {
    throw new Error('Comment could not be added.')
  }
  return data
}

export const updateComment = async (commentId: string, content: string): Promise<Comment> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('comments')
    .update({ content: content.trim() })
    .eq('id', commentId)
    .select('*')
    .single()
  throwIfError(error)
  if (!data) {
    throw new Error('Comment could not be updated.')
  }
  return data
}

export const deleteComment = async (commentId: string) => {
  const client = getSupabaseClient()
  const { error } = await client.from('comments').delete().eq('id', commentId)
  throwIfError(error)
}

export const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(100)
  throwIfError(error)
  return data ?? []
}
