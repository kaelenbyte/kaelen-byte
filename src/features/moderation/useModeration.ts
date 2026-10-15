import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  checkIsModerator,
  deleteModeratedContent,
  listPendingReports,
  recordModerationAction,
  reviewReport,
} from './api'
import type { ReportStatus } from '../../integrations/supabase/database.types'

export const useIsModerator = (enabled: boolean) =>
  useQuery({
    queryKey: ['moderation', 'is-moderator'],
    enabled,
    queryFn: () => checkIsModerator(),
    staleTime: 60_000,
  })

export const usePendingReports = (enabled: boolean) =>
  useQuery({
    queryKey: ['moderation', 'pending-reports'],
    enabled,
    queryFn: () => listPendingReports(),
  })

export const useModerationActions = () => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['moderation'] })
    queryClient.invalidateQueries({ queryKey: ['feed'] })
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }

  const dismiss = useMutation({
    mutationFn: (reportId: string) => reviewReport(reportId, 'dismissed' as ReportStatus),
    onSuccess: invalidate,
  })

  const action = useMutation({
    mutationFn: async (input: {
      reportId: string
      targetType: 'post' | 'comment' | 'profile'
      targetId: string
      reason?: string
    }) => {
      if (input.targetType !== 'profile') {
        await deleteModeratedContent(input.targetType, input.targetId)
      }
      await recordModerationAction({
        targetType: input.targetType,
        targetId: input.targetId,
        action: 'removed',
        reason: input.reason,
      })
      await reviewReport(input.reportId, 'actioned' as ReportStatus)
    },
    onSuccess: invalidate,
  })

  return { dismiss, action }
}
