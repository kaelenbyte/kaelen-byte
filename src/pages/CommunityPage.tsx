import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AuthProvider, useAuth } from '../features/auth/AuthProvider'
import { RequireAuth } from '../features/auth/guards'
import { CommunityShell } from '../features/community/CommunityShell'
import { ComposePage } from '../features/community/ComposePage'
import { FeedPage } from '../features/community/FeedPage'
import { FollowingPage } from '../features/community/FollowingPage'
import { LoginPage, OnboardingPage, ResetPasswordPage, SignupPage } from '../features/community/AuthPages'
import { ModerationPage } from '../features/community/ModerationPage'
import { NotificationsPage } from '../features/community/NotificationsPage'
import { PostDetailPage } from '../features/community/PostDetailPage'
import { ProfilePage } from '../features/community/ProfilePage'
import { SavedPage } from '../features/community/SavedPage'
import { SettingsPage } from '../features/community/SettingsPage'
import { usePageMeta } from '../utils/seo'
import { siteConfig } from '../config/site'
import { LoadingState } from '../features/community/ui'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 15_000,
    },
  },
})

function ProfileOnboardingGate({ children }: { children: React.ReactNode }) {
  const { profileMissing, loading, initialized } = useAuth()
  const location = useLocation()
  if (loading || !initialized) return <LoadingState />
  if (profileMissing && location.pathname !== '/community/onboarding') {
    return <Navigate to="/community/onboarding" replace />
  }
  return <>{children}</>
}

function CommunityRoutes() {
  return (
    <CommunityShell>
      <ProfileOnboardingGate>
        <Routes>
          <Route index element={<FeedPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
          <Route path="compose" element={<RequireAuth><ComposePage /></RequireAuth>} />
          <Route path="post/:postId" element={<PostDetailPage />} />
          <Route path="u/:username" element={<ProfilePage />} />
          <Route path="settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="following" element={<RequireAuth><FollowingPage /></RequireAuth>} />
          <Route path="saved" element={<RequireAuth><SavedPage /></RequireAuth>} />
          <Route path="notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
          <Route path="moderation" element={<RequireAuth><ModerationPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/community" replace />} />
        </Routes>
      </ProfileOnboardingGate>
    </CommunityShell>
  )
}

export function CommunityPage() {
  usePageMeta({
    title: 'Community',
    description: 'A public community feed for Kaelen Byte.',
    canonicalUrl: `${siteConfig.productionDomain}/community`,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CommunityRoutes />
      </AuthProvider>
    </QueryClientProvider>
  )
}
