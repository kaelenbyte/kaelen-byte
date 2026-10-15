import type { PostDetails } from '../../integrations/supabase/database.types'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'

export const savePost = async (postId: string) => {
  const client = getSupabaseClient()
  const { error } = await client.from('saved_posts').insert({ post_id: postId })
  throwIfError(error)
}

export const unsavePost = async (postId: string, userId: string) => {
  const client = getSupabaseClient()
  const { error } = await client
    .from('saved_posts')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)
  throwIfError(error)
}

export const getSavedPosts = async (userId: string): Promise<PostDetails[]> => {
  const client = getSupabaseClient()
  const { data: saved, error: savedError } = await client
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  throwIfError(savedError)

  const postIds = (saved ?? []).map((row) => row.post_id)
  if (postIds.length === 0) {
    return []
  }

  const { data, error } = await client.from('post_details').select('*').in('id', postIds)
  throwIfError(error)

  const order = new Map(postIds.map((id, index) => [id, index]))
  return (data ?? []).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
}
