import type { Report, ReportStatus } from '../../integrations/supabase/database.types'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'
import { deleteImage } from '../storage/uploadApi'

export const checkIsModerator = async (): Promise<boolean> => {
  const client = getSupabaseClient()
  const { data, error } = await client.rpc('is_moderator')
  throwIfError(error)
  return Boolean(data)
}

export const listPendingReports = async (): Promise<Report[]> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('reports')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  throwIfError(error)
  return data ?? []
}

export const reviewReport = async (reportId: string, status: ReportStatus) => {
  const client = getSupabaseClient()
  const { data: authData, error: authError } = await client.auth.getUser()
  throwIfError(authError)
  const { error } = await client
    .from('reports')
    .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: authData.user?.id ?? null })
    .eq('id', reportId)
  throwIfError(error)
}

export const deleteModeratedContent = async (
  targetType: 'post' | 'comment',
  targetId: string,
) => {
  const client = getSupabaseClient()
  if (targetType === 'post') {
    const { data: post, error: fetchError } = await client
      .from('posts')
      .select('image_url')
      .eq('id', targetId)
      .maybeSingle()
    throwIfError(fetchError)
    const { error } = await client.from('posts').delete().eq('id', targetId)
    throwIfError(error)
    await deleteImage('post-images', post?.image_url)
    return
  }
  const { error } = await client.from('comments').delete().eq('id', targetId)
  throwIfError(error)
}

export const recordModerationAction = async (input: {
  targetType: 'post' | 'comment' | 'profile'
  targetId: string
  action: string
  reason?: string
}) => {
  const client = getSupabaseClient()
  const { error } = await client.from('moderation_actions').insert({
    target_type: input.targetType,
    target_id: input.targetId,
    action: input.action,
    reason: input.reason ?? null,
  })
  throwIfError(error)
}
