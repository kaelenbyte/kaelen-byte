import { ArrowRight, FolderKanban, Globe, MessagesSquare, PencilRuler, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StructuredData } from '../components/StructuredData'
import { SocialIconLink } from '../components/SocialIconLink'
import { configuredSocialLinks, siteConfig } from '../config/site'
import { usePageMeta } from '../utils/seo'

const pillars = [
  {
    title: 'Design direction',
    description: 'Ideas shaped by curiosity, craft, and a clear point of view.',
    icon: PencilRuler,
  },
  {
    title: 'Digital work',
    description: 'Hands-on projects, tools, and thinking behind the work.',
    icon: FolderKanban,
  },
  {
    title: 'Online presence',
    description: 'Updates, links, and a simple place to stay connected.',
    icon: Globe,
  },
]

const featureCards = [
  {
    title: 'Writing & notes',
    text: 'Short posts, ideas, and updates as they happen.',
    image: '/images/digital-work.jpg',
    imageAlt: 'Close-up photograph of source code on a monitor',
    to: '/content',
  },
  {
    title: 'About the work',
    text: 'A clearer look at the thinking behind Kaelen Byte.',
    image: '/images/technology-detail.jpg',
    imageAlt: 'Close-up photograph of a computer circuit board',
    to: '/about',
  },
  {
    title: 'Stay connected',
    text: 'Find the latest links and reach out directly.',
    image: '/images/collaborative-technology.jpg',
    imageAlt: 'Overhead photograph of people working around laptops',
    to: '/social',
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
              Ideas in motion
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
                About the work
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300 hover:bg-sky-500/10"
              >
                Community feed
                <MessagesSquare className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#1d2a24] p-3">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#1d2a24]">
                <img
                  src="/images/kaelen-portrait.png"
                  alt="Portrait of Kaelen Byte"
                  className="h-[420px] w-full object-cover object-top sm:h-[520px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Overview</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              What Kaelen Byte is about
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
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Explore</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Find your way around</h2>
          </div>
          <Link to="/content" className="hidden text-sm font-medium text-sky-300 hover:text-sky-200 sm:inline-flex">
            View content →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
              <Link to={item.to} className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                <img src={item.image} alt={item.imageAlt} className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Social media</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Links and updates</h2>
          </div>

          {configuredSocialLinks.length > 0 ? (
            <nav aria-label="Social profiles">
              <ul className="flex flex-wrap gap-3">
                {configuredSocialLinks.map((link) => (
                  <li key={link.label}>
                    <SocialIconLink link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-8 text-slate-300">
              No social profiles are available.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-sky-400/20 bg-sky-500/10 p-8 text-center sm:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-200">Contact</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Ready to connect?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-200">
            Questions, collaborations, or just a hello? Get in touch by email.
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
