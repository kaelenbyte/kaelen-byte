import { ArrowRight, NotebookText } from 'lucide-react'
import { Link } from 'react-router-dom'

import { siteConfig } from '../config/site'
import { sanityImageUrl } from '../sanity/client'
import { usePublishedArticles } from '../sanity/useLiveQuery'
import { usePageMeta } from '../utils/seo'

export function ContentPage() {
  const { data: articles, status } = usePublishedArticles()

  usePageMeta({
    title: 'Content',
    description: 'Kaelen Byte articles and updates on creativity, technology, and digital ideas.',
    canonicalUrl: `${siteConfig.productionDomain}/content`,
  })

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Content</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Notes & updates</h1>
      </div>

      {status === 'loading' ? (
        <p role="status" className="py-12 text-center text-slate-300">Loading stories...</p>
      ) : status === 'error' ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center" role="status">
          <h2 className="text-2xl font-semibold text-white">Stories are temporarily unavailable</h2>
          <p className="mt-3 text-slate-300">Please try again shortly.</p>
        </div>
      ) : articles && articles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <article key={article._id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
              {article.coverImage && (
                <img
                  src={sanityImageUrl(article.coverImage, 1000)}
                  alt={article.coverImage.alt || article.title}
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300">{article.category}</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{article.title}</h2>
                <time className="mt-3 text-sm text-slate-400" dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString('en', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
                <p className="mt-5 text-sm leading-7 text-slate-300">{article.excerpt}</p>
                <Link
                  to={`/content/${article.slug}`}
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-sky-300 transition group-hover:text-sky-200"
                >
                  Read article
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-10 text-center">
          <NotebookText className="mx-auto h-10 w-10 text-sky-300" />
          <h2 className="mt-5 text-2xl font-semibold text-white">No articles yet</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">
            Published articles will appear here.
          </p>
          <Link
            to="/social"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-300 transition hover:text-sky-200"
          >
            Follow along
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  )
}
