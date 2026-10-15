import { Studio } from 'sanity'
import { Link } from 'react-router-dom'

import { sanityClient } from '../sanity/client'
import { sanityConfig } from '../sanity/config'

export function StudioPage() {
  if (!sanityClient) {
    return (
      <section className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#17211d] px-4 py-12 text-slate-100">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-8 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Kaelen Byte Studio</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Connect your publishing account</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Add your Sanity project ID to the local environment and to your Vercel project settings to enable publishing.
          </p>
          <p className="mt-5 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm text-slate-200">
            VITE_SANITY_PROJECT_ID
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            The Studio uses Sanity sign-in. No API token belongs in this website's public environment variables.
          </p>
          <Link to="/" className="mt-7 inline-flex text-sm font-medium text-sky-300 hover:text-sky-200">
            Return to Kaelen Byte
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-white text-slate-950">
      <Studio config={sanityConfig} />
    </div>
  )
}