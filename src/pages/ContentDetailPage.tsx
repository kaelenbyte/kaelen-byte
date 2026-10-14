import { ArrowLeft, NotebookText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { articles } from '../data/content'
import { usePageMeta } from '../utils/seo'

export function ContentDetailPage() {
  const { slug } = useParams()
  const article = articles.find((entry) => entry.slug === slug)

  usePageMeta({
    title: article ? article.title : 'Content',
    description: article ? article.excerpt : 'Kaelen Byte content details.',
  })

  if (!article) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/60 p-10 text-center">
          <NotebookText className="mx-auto h-10 w-10 text-sky-300" />
          <h1 className="mt-5 text-3xl font-semibold text-white">Article not found</h1>
          <p className="mt-3 text-slate-300">This article may not exist yet or may still be waiting for publication details.</p>
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
        <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-sky-300">
          <span>{article.category}</span>
          <span>•</span>
          <span>{article.status}</span>
        </div>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">{article.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readingTime}</span>
        </div>

        <div className="mt-8 space-y-6 text-base leading-8 text-slate-300">
          {article.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
