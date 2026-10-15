import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'

import type { ReportTargetType } from '../../integrations/supabase/database.types'
import { useSubmitReport } from '../reports/useReports'
import { REPORT_REASONS } from '../reports/api'
import { toUserMessage } from '../../lib/errors'
import { FieldError, primaryButtonClass, secondaryButtonClass } from './ui'

type ReportDialogProps = {
  open: boolean
  onClose: () => void
  targetType: ReportTargetType
  targetId: string
}

export function ReportDialog({ open, onClose, targetType, targetId }: ReportDialogProps) {
  const titleId = useId()
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].value)
  const [details, setDetails] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const submit = useSubmitReport()

  useEffect(() => {
    if (open) {
      setError('')
      setDetails('')
      setDone(false)
      setReason(REPORT_REASONS[0].value)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      await submit.mutateAsync({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      })
      setDone(true)
    } catch (submitError) {
      setError(toUserMessage(submitError, 'We could not submit your report. Please try again.'))
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold text-white">
            Report content
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report dialog"
            className="rounded-full p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div className="mt-4" role="status">
            <p className="text-slate-200">
              Thanks. Your report has been submitted and will be reviewed by a moderator. Your identity is not shown to others.
            </p>
            <button type="button" onClick={onClose} className={`${primaryButtonClass} mt-5`}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Reason</span>
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              >
                {REPORT_REASONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Details <span className="text-slate-500">(optional)</span>
              </span>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              />
            </label>

            <FieldError message={error} />

            <div className="flex gap-3">
              <button type="submit" disabled={submit.isPending} className={primaryButtonClass}>
                {submit.isPending ? 'Submitting...' : 'Submit report'}
              </button>
              <button type="button" onClick={onClose} className={secondaryButtonClass}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
