import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { siteConfig } from '../config/site'
import { usePageMeta } from '../utils/seo'

export function NotFoundPage() {
  usePageMeta({
    title: 'Page not found',
    description: 'The requested Kaelen Byte page could not be found.',
    canonicalUrl: `${siteConfig.productionDomain}/404`,
  })

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/10 text-3xl font-black text-sky-200">
          404
        </div>
        <h1 className="mt-6 text-4xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-slate-300">The page you were looking for may have moved or may not exist yet.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to homepage
        </Link>
      </div>
    </section>
  )
}
