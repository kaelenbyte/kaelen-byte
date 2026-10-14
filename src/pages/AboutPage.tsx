import { Award, Compass, NotebookPen, ShieldCheck } from 'lucide-react'

import { StructuredData } from '../components/StructuredData'
import { siteConfig } from '../config/site'
import { usePageMeta } from '../utils/seo'

const values = [
  { title: 'Creative focus', description: 'Building a clear and meaningful digital identity rooted in ideas and originality.', icon: NotebookPen },
  { title: 'Technology-first thinking', description: 'Using modern tools and clean systems to present a polished online experience.', icon: Compass },
  { title: 'Trust and clarity', description: 'Keeping the brand honest, intentional, and easy to understand for visitors.', icon: ShieldCheck },
]

export function AboutPage() {
  usePageMeta({
    title: 'About',
    description: 'Learn about the Kaelen Byte brand identity, mission, values, and current placeholder profile details.',
    canonicalUrl: `${siteConfig.productionDomain}/about`,
  })

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${siteConfig.brandName} About`,
    description: 'Brand identity page for Kaelen Byte.',
    about: {
      '@type': 'Thing',
      name: siteConfig.brandName,
    },
  }

  return (
    <>
      <StructuredData data={structuredData} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">About</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Brand identity and mission</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
            <div className="flex h-52 items-center justify-center rounded-[1.5rem] border border-dashed border-sky-400/30 bg-slate-950/80">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-sky-400/60 bg-sky-500/10 text-3xl font-black tracking-[0.2em] text-sky-200">
                KB
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              Placeholder profile artwork. Replace with a real profile image when the owner provides one.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Mission</p>
              <p className="mt-4 text-lg leading-8 text-slate-200">
                Kaelen Byte is presented as a modern digital identity centered on creativity, technology, ideas, and possibility.
                The current copy is intentionally editable and should be refined with the owner’s actual vision before public launch.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Editable biography</p>
              <p className="mt-4 text-base leading-8 text-slate-300">
                This biography is a safe placeholder. It does not claim a personal story, location, education, employment history,
                or identity details that were not provided. Update this section when the owner is ready to share verified information.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/45">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Values</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Interests and principles</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {values.map(({ title, description, icon: Icon }) => (
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

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8">
          <div className="mb-4 flex items-center gap-3 text-sky-200">
            <Award className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.2em]">Identity note</span>
          </div>
          <p className="text-base leading-8 text-slate-300">
            This page intentionally avoids fabricating personal details, achievements, or official claims. It is intentionally designed to be extended with verified information from the owner when they are ready.
          </p>
        </div>
      </section>
    </>
  )
}
