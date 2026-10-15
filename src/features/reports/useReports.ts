import { useMutation } from '@tanstack/react-query'

import type { ReportTargetType } from '../../integrations/supabase/database.types'
import { submitReport } from './api'

export const useSubmitReport = () =>
  useMutation({
    mutationFn: (input: {
      targetType: ReportTargetType
      targetId: string
      reason: string
      details?: string
    }) => submitReport(input),
  })
