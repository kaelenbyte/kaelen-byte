import { ArrowRight, NotebookText } from 'lucide-react'
import { Link } from 'react-router-dom'

import { siteConfig } from '../config/site'
import { articles } from '../data/content'
import { usePageMeta } from '../utils/seo'

export function ContentPage() {
  usePageMeta({
    title: 'Content',
    description: 'Explore Kaelen Byte content drafts, updates, and article ideas before publication details are finalized.',
    canonicalUrl: `${siteConfig.productionDomain}/content`,
  })

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Content</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Updates, ideas, and stories</h1>
        </div>
        <div className="hidden rounded-full border border-white/10 bg-slate-900/60 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300 sm:block">
          Draft-ready section
        </div>
      </div>

      {articles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <article key={article.slug} className="group flex h-full flex-col rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
              <div className="mb-4 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-sky-300">
                <span>{article.category}</span>
                <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-1 text-[10px] text-sky-100">
                  {article.status}
                </span>
              </div>

              <h2 className="text-2xl font-semibold text-white">{article.title}</h2>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-400">
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readingTime}</span>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">{article.excerpt}</p>

              <Link
                to={`/content/${article.slug}`}
                className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-sky-300 transition group-hover:text-sky-200"
              >
                Read article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/60 p-10 text-center">
          <NotebookText className="mx-auto h-10 w-10 text-sky-300" />
          <h2 className="mt-5 text-2xl font-semibold text-white">No articles published yet</h2>
          <p className="mt-3 text-slate-300">This content section is ready for future updates and article publishing when owner content is ready.</p>
        </div>
      )}
    </section>
  )
}
