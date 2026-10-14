import { ShieldCheck } from 'lucide-react'

import { siteConfig } from '../config/site'
import { usePageMeta } from '../utils/seo'

export function PrivacyPage() {
  usePageMeta({
    title: 'Privacy',
    description: 'Privacy information for the Kaelen Byte website and site behavior.',
    canonicalUrl: `${siteConfig.productionDomain}/privacy`,
  })

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Privacy</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Privacy notice</h1>
      </div>

      <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 text-base leading-8 text-slate-300 sm:p-10">
        <div className="flex items-center gap-3 text-sky-200">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-[0.2em]">Current implementation</span>
        </div>

        <p>
          This website currently operates as a static front-end without a backend, login flow, database, user accounts, or analytics script.
          As implemented, it does not collect personal data through a custom form submission service.
        </p>

        <p>
          The site may still produce standard server access logs or browser-level request metadata as part of normal hosting operations. Those logs are not managed in the frontend code and are governed by the hosting provider.
        </p>

        <p>
          If a real contact form backend, tracking tool, newsletter sign-up, or other data-collection feature is added later, this page should be updated to describe the exact data collected, the purpose of collection, storage duration, and any third-party service involved.
        </p>

        <p>
          No sensitive information should be collected without a clear purpose. The project intentionally keeps data collection minimal until a real use case is approved.
        </p>
      </div>
    </section>
  )
}
