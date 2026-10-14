import { ExternalLink, Link2, Sparkles } from 'lucide-react'

import { configuredSocialLinks, siteConfig } from '../config/site'
import { usePageMeta } from '../utils/seo'

export function SocialPage() {
  usePageMeta({
    title: 'Social',
    description: 'Official Kaelen Byte social links and profile connections.',
    canonicalUrl: `${siteConfig.productionDomain}/social`,
  })

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Social</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Official profiles</h1>
      </div>

      {configuredSocialLinks.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {configuredSocialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 transition hover:border-sky-400/40 hover:bg-slate-950"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/10 text-sky-200">
                  <Link2 className="h-5 w-5" />
                </div>
                <ExternalLink className="h-4 w-4 text-sky-300 transition group-hover:translate-x-0.5" />
              </div>
              <h2 className="text-xl font-semibold text-white">{link.label}</h2>
              <p className="mt-3 break-all text-sm text-slate-400">{link.url}</p>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/60 p-8 text-slate-300">
          <div className="mb-4 flex items-center gap-3 text-sky-200">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.2em]">Waiting for owner input</span>
          </div>
          <p>
            No public profile URLs have been configured yet. Add the approved social links in the site configuration before launch.
          </p>
        </div>
      )}
    </section>
  )
}
