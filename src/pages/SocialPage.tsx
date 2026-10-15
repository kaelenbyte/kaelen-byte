import { SocialIconLink } from '../components/SocialIconLink'
import { configuredSocialLinks, siteConfig } from '../config/site'
import { usePageMeta } from '../utils/seo'

export function SocialPage() {
  usePageMeta({
    title: 'Social',
    description: 'Kaelen Byte links, profiles, and places to follow along.',
    canonicalUrl: `${siteConfig.productionDomain}/social`,
  })

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Social</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Find me online</h1>
      </div>

      {configuredSocialLinks.length > 0 ? (
        <nav aria-label="Social links">
          <ul className="flex flex-wrap gap-3">
            {configuredSocialLinks.map((link) => (
              <li key={link.label}>
                <SocialIconLink link={link} />
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-slate-300">
          <p>No links listed yet.</p>
        </div>
      )}
    </section>
  )
}
