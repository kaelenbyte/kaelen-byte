import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'

export const likePost = async (postId: string) => {
  const client = getSupabaseClient()
  const { error } = await client.from('likes').insert({ post_id: postId })
  throwIfError(error)
}

export const unlikePost = async (postId: string, userId: string) => {
  const client = getSupabaseClient()
  const { error } = await client.from('likes').delete().eq('post_id', postId).eq('user_id', userId)
  throwIfError(error)
}

export const getLikesForPostIds = async (postIds: string[], userId: string | null) => {
  if (postIds.length === 0) {
    return [] as Array<{ post_id: string; user_id: string }>
  }
  const client = getSupabaseClient()
  let query = client.from('likes').select('post_id,user_id').in('post_id', postIds)
  if (userId) {
    query = query.eq('user_id', userId)
  }
  const { data, error } = await query
  throwIfError(error)
  return data ?? []
}
