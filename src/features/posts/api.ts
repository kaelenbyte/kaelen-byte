import type { Post, PostDetails } from '../../integrations/supabase/database.types'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'

export type CreatePostInput = {
  content: string
  imageUrl?: string | null
}

export type UpdatePostInput = {
  content: string
  imageUrl?: string | null
}

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('posts')
    .insert({
      content: input.content.trim(),
      image_url: input.imageUrl?.trim() || null,
    })
    .select('*')
    .single()
  throwIfError(error)
  if (!data) {
    throw new Error('Post could not be created.')
  }
  return data
}

export const updatePost = async (postId: string, input: UpdatePostInput): Promise<Post> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('posts')
    .update({
      content: input.content.trim(),
      image_url: input.imageUrl?.trim() || null,
    })
    .eq('id', postId)
    .select('*')
    .single()
  throwIfError(error)
  if (!data) {
    throw new Error('Post could not be updated.')
  }
  return data
}

export const deletePost = async (postId: string) => {
  const client = getSupabaseClient()
  const { error } = await client.from('posts').delete().eq('id', postId)
  throwIfError(error)
}

export const getPost = async (postId: string): Promise<Post | null> => {
  const client = getSupabaseClient()
  const { data, error } = await client.from('posts').select('*').eq('id', postId).maybeSingle()
  throwIfError(error)
  return data
}

export const getPostDetails = async (postId: string): Promise<PostDetails | null> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('post_details')
    .select('*')
    .eq('id', postId)
    .maybeSingle()
  throwIfError(error)
  return data
}

export const getUserPosts = async (userId: string, limit = 50): Promise<PostDetails[]> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('post_details')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)
  throwIfError(error)
  return data ?? []
}

export type Cursor = { createdAt: string; id: string } | null

export const getFeedPage = async (
  limit = 25,
  cursor: Cursor = null,
): Promise<{ items: PostDetails[]; nextCursor: Cursor }> => {
  const client = getSupabaseClient()
  let query = client
    .from('post_details')
    .select('*')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    )
  }

  const { data, error } = await query
  throwIfError(error)

  const items = data ?? []
  if (items.length < limit) {
    const last = items[items.length - 1]
    return {
      items,
      nextCursor: last ? { createdAt: last.created_at, id: last.id } : null,
    }
  }

  const last = items[items.length - 1]
  return {
    items,
    nextCursor: last ? { createdAt: last.created_at, id: last.id } : null,
  }
}
