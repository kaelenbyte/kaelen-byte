import type { Notification } from '../../integrations/supabase/database.types'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'

export const getNotifications = async (limit = 50): Promise<Notification[]> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  throwIfError(error)
  return data ?? []
}

export const markNotificationRead = async (id: string) => {
  const client = getSupabaseClient()
  const { error } = await client
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
  throwIfError(error)
}

export const markAllNotificationsRead = async () => {
  const client = getSupabaseClient()
  const { error } = await client
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)
  throwIfError(error)
}
