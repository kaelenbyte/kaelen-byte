import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { AboutPage } from './pages/AboutPage'
import { CommunityPage } from './pages/CommunityPage'
import { ContactPage } from './pages/ContactPage'
import { ContentDetailPage } from './pages/ContentDetailPage'
import { ContentPage } from './pages/ContentPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { SocialPage } from './pages/SocialPage'

const StudioPage = lazy(() => import('./pages/StudioPage').then((module) => ({ default: module.StudioPage })))

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/content" element={<ContentPage />} />
        <Route path="/content/:slug" element={<ContentDetailPage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/community/*" element={<CommunityPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route
          path="/studio/*"
          element={
            <Suspense fallback={<p className="p-8 text-slate-200">Loading publishing studio...</p>}>
              <StudioPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App
