import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { getSupabaseClient } from '../../integrations/supabase/client'
import { isSupabaseConfigured } from '../../integrations/supabase/env'

type RealtimeSubscriptionOptions = {
  onStatusChange?: (status: string) => void
}

type RealtimeHandlers = Record<string, () => void>

/**
 * Subscribes once to the public community tables and invalidates the affected
 * React Query caches. Realtime is treated as an invalidation hint, never as the
 * source of truth: the authoritative data always comes from a fresh query, so
 * duplicate or out-of-order events can never duplicate feed rows or corrupt
 * counts. The channel is torn down on unmount and React StrictMode double-mount
 * is handled by the subscribe/unsubscribe pair.
 */
export function useRealtimeFeed(options: RealtimeSubscriptionOptions = {}) {
  const queryClient = useQueryClient()
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return
    }

    const handlers: RealtimeHandlers = {
      posts: () => {
        queryClient.invalidateQueries({ queryKey: ['feed'] })
        queryClient.invalidateQueries({ queryKey: ['posts'] })
        queryClient.invalidateQueries({ queryKey: ['post'] })
      },
      likes: () => {
        queryClient.invalidateQueries({ queryKey: ['feed'] })
        queryClient.invalidateQueries({ queryKey: ['post'] })
      },
      comments: () => {
        queryClient.invalidateQueries({ queryKey: ['feed'] })
        queryClient.invalidateQueries({ queryKey: ['comments'] })
        queryClient.invalidateQueries({ queryKey: ['post'] })
      },
      follows: () => {
        queryClient.invalidateQueries({ queryKey: ['follows'] })
        queryClient.invalidateQueries({ queryKey: ['profiles'] })
      },
      notifications: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      },
    }

    const client = getSupabaseClient()
    const channel = client.channel('community-realtime')

    for (const [table, handler] of Object.entries(handlers)) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, handler)
    }

    channel.subscribe((status) => {
      optionsRef.current.onStatusChange?.(status)
    })

    return () => {
      void client.removeChannel(channel)
    }
  }, [queryClient])
}
