import { ArrowRight, FolderKanban, Globe, MessagesSquare, PencilRuler, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StructuredData } from '../components/StructuredData'
import { configuredSocialLinks, siteConfig } from '../config/site'
import { usePageMeta } from '../utils/seo'

const pillars = [
  {
    title: 'Creative direction',
    description: 'A digital presence shaped around ideas, experimentation, and meaningful expression.',
    icon: PencilRuler,
  },
  {
    title: 'Technology focus',
    description: 'A thoughtful approach to modern tools, digital systems, and online experiences.',
    icon: FolderKanban,
  },
  {
    title: 'Connected presence',
    description: 'A public profile designed to make content, updates, and social connections easy to discover.',
    icon: Globe,
  },
]

const featureCards = [
  {
    title: 'Editorial updates',
    text: 'Placeholder content blocks keep the publishing flow ready for real announcements, stories, and project highlights.',
  },
  {
    title: 'Project highlights',
    text: 'Curated categories make it easy to present work, interests, and themes without claiming completed work that has not been verified.',
  },
  {
    title: 'Brand presence',
    text: 'The digital identity stays clean, modern, and easy to extend as the brand evolves.',
  },
]

export function HomePage() {
  usePageMeta({
    title: 'Home',
    description: siteConfig.description,
    canonicalUrl: `${siteConfig.productionDomain}/`,
  })

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.brandName,
    alternateName: siteConfig.brandName,
    description: siteConfig.description,
    url: siteConfig.productionDomain,
    sameAs: configuredSocialLinks.map((link) => link.url),
  }

  return (
    <>
      <StructuredData data={structuredData} />

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              Official website
            </div>

            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {siteConfig.brandName}
            </h1>

            <p className="mt-4 text-lg font-medium text-sky-200">{siteConfig.tagline}</p>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              {siteConfig.shortIntro}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Explore the brand
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={siteConfig.socialLinks.tiktok.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300 hover:bg-sky-500/10"
              >
                View social profile
                <MessagesSquare className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-sky-500/20 via-slate-900 to-slate-900 blur-3xl" />
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_0_80px_rgba(14,165,233,0.1)]">
              <div className="rounded-[1.5rem] border border-sky-400/20 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_rgba(15,23,42,0.8))] p-6">
                <div className="mb-6 flex items-center justify-between text-slate-300">
                  <span className="text-xs font-medium uppercase tracking-[0.2em]">Brand identity</span>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300">
                    Ready to evolve
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-sky-400/60 bg-sky-500/10 text-2xl font-black tracking-[0.22em] text-sky-200">
                    KB
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-white">Kaelen Byte</div>
                    <div className="mt-1 text-sm text-slate-300">Modern digital storytelling</div>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Focus</div>
                    <div className="mt-2 text-lg font-semibold text-white">Ideas</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Style</div>
                    <div className="mt-2 text-lg font-semibold text-white">Technology</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Brand introduction</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              What Kaelen Byte represents
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
                <div className="mb-4 inline-flex rounded-xl border border-sky-400/40 bg-sky-500/10 p-3 text-sky-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Featured content</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Projects and interests</h2>
          </div>
          <Link to="/content" className="hidden text-sm font-medium text-sky-300 hover:text-sky-200 sm:inline-flex">
            View content →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <div className="mb-4 h-10 w-10 rounded-full border border-sky-400/40 bg-sky-500/10" />
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Social media</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Connections and updates</h2>
          </div>

          {configuredSocialLinks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {configuredSocialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-sky-400/40 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-white">{link.label}</span>
                    <ArrowRight className="h-4 w-4 text-sky-300 transition group-hover:translate-x-1" />
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{link.url}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-8 text-slate-300">
              No public social profiles are configured yet. Add the profile URLs in the site config before launch.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-sky-400/20 bg-sky-500/10 p-8 text-center sm:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-200">Contact</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Ready to connect?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-200">
            This site is prepared for real updates, profile links, and contact details when the owner is ready to share them.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Contact page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
