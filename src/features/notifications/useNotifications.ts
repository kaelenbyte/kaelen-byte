import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getNotifications, markAllNotificationsRead, markNotificationRead } from './api'

export const useNotifications = (enabled: boolean) =>
  useQuery({
    queryKey: ['notifications'],
    enabled,
    queryFn: () => getNotifications(),
  })

export const useNotificationMutations = () => {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] })

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: invalidate,
  })

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: invalidate,
  })

  return { markRead, markAllRead }
}
