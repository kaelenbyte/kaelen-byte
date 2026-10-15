import { Compass, NotebookPen, ShieldCheck } from 'lucide-react'

import { StructuredData } from '../components/StructuredData'
import { siteConfig } from '../config/site'
import { usePageMeta } from '../utils/seo'

const values = [
  { title: 'Curiosity', description: 'Explore how things work and what can be made with them.', icon: NotebookPen },
  { title: 'Creative practice', description: 'Test ideas, learn from the process, and keep making.', icon: Compass },
  { title: 'Intentional technology', description: 'Choose tools for what they help accomplish, not just because they are new.', icon: ShieldCheck },
]

export function AboutPage() {
  usePageMeta({
    title: 'About',
    description: 'Learn about Kaelen Byte and its focus on creativity, technology, and digital work.',
    canonicalUrl: `${siteConfig.productionDomain}/about`,
  })

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${siteConfig.brandName} About`,
    description: 'A creative and technology-focused digital brand built around exploring ideas and making things.',
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
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">About Kaelen Byte</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-3">
            <div className="overflow-hidden rounded-[1.5rem] border border-sky-400/20 bg-slate-950/80">
              <img
                src="/images/kaelen-portrait.png"
                alt="Portrait of Kaelen Byte"
                className="h-[420px] w-full object-cover object-top"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">The vision</p>
              <p className="mt-4 text-lg leading-8 text-slate-200">
                Kaelen Byte is a space for curiosity and making. The idea is simple: keep learning, keep building, and share the work as it evolves.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">What to expect</p>
              <p className="mt-4 text-base leading-8 text-slate-300">
                This is where the work, ideas, and updates live together in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/45">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Values</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Principles</h2>
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

    </>
  )
}
