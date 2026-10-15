import type { Report, ReportTargetType } from '../../integrations/supabase/database.types'
import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'

export const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'harmful', label: 'Harmful or abusive content' },
  { value: 'other', label: 'Other' },
] as const

export const submitReport = async (input: {
  targetType: ReportTargetType
  targetId: string
  reason: string
  details?: string
}): Promise<Report> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('reports')
    .insert({
      target_type: input.targetType,
      target_id: input.targetId,
      reason: input.reason,
      details: input.details?.trim() || null,
    })
    .select('*')
    .single()
  throwIfError(error)
  if (!data) {
    throw new Error('Report could not be submitted.')
  }
  return data
}

export const getMyReports = async (): Promise<Report[]> => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
  throwIfError(error)
  return data ?? []
}
