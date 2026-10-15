import { ArrowLeft, NotebookText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'

import type { Article } from '../data/content'
import { sanityImageUrl } from '../sanity/client'
import { usePublishedArticle } from '../sanity/useLiveQuery'
import { siteConfig } from '../config/site'
import { usePageMeta } from '../utils/seo'

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const source = value as Article['coverImage']
      const imageUrl = source ? sanityImageUrl(source, 1400) : undefined

      return imageUrl ? (
        <figure className="my-8">
          <img src={imageUrl} alt={source?.alt || ''} className="w-full rounded-xl object-cover" loading="lazy" />
        </figure>
      ) : null
    },
  },
}

export function ContentDetailPage() {
  const { slug } = useParams()
  const { data: article, status } = usePublishedArticle(slug)

  usePageMeta({
    title: article ? article.title : 'Content',
    description: article ? article.excerpt : 'Kaelen Byte content details.',
    canonicalUrl: article ? `${siteConfig.productionDomain}/content/${article.slug}` : undefined,
  })

  if (status === 'loading') {
    return <p role="status" className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-300">Loading article...</p>
  }

  if (!article) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/60 p-10 text-center">
          <NotebookText className="mx-auto h-10 w-10 text-sky-300" />
          <h1 className="mt-5 text-3xl font-semibold text-white">
            {status === 'error' ? 'Article unavailable' : 'Article not found'}
          </h1>
          <p className="mt-3 text-slate-300">
            {status === 'error'
              ? 'Please try again shortly.'
              : 'This article may have moved or is not published.'}
          </p>
          <Link to="/content" className="mt-6 inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200">
            <ArrowLeft className="h-4 w-4" />
            Back to content
          </Link>
        </div>
      </section>
    )
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link to="/content" className="inline-flex items-center gap-2 text-sm font-medium text-sky-300">
          <ArrowLeft className="h-4 w-4" />
          Back to content
        </Link>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 sm:p-10">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-sky-300">{article.category}</p>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">{article.title}</h1>
        <time className="mt-4 block text-sm text-slate-400" dateTime={article.publishedAt}>
          {new Date(article.publishedAt).toLocaleDateString('en', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        {article.coverImage && (
          <img
            src={sanityImageUrl(article.coverImage, 1400)}
            alt={article.coverImage.alt || article.title}
            className="mt-8 w-full rounded-xl object-cover"
          />
        )}

        <div className="prose prose-invert mt-8 max-w-none prose-headings:text-white prose-a:text-sky-300 prose-strong:text-white">
          <PortableText value={article.body} components={portableTextComponents} />
        </div>
      </div>
    </article>
  )
}
