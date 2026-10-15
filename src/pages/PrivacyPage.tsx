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
          <span className="text-sm font-medium uppercase tracking-[0.2em]">Privacy at a glance</span>
        </div>

        <p>
          This site keeps things simple: no accounts, no newsletter signup, and no tracking dashboard.
        </p>

        <p>
          The contact form opens your email app instead of storing your message here. Anything sent from there is handled by your email provider.
        </p>

        <p>
          The hosting provider may still keep standard request logs, like IP addresses and page visits, to keep the site running and secure.
        </p>
      </div>
    </section>
  )
}
