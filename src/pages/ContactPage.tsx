import { CheckCircle2, Mail, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

import { siteConfig } from '../config/site'
import { usePageMeta } from '../utils/seo'

const initialForm = {
  name: '',
  email: '',
  message: '',
}

export function ContactPage() {
  usePageMeta({
    title: 'Contact',
    description: 'Email Kaelen Byte with a question or collaboration idea.',
    canonicalUrl: `${siteConfig.productionDomain}/contact`,
  })

  const hasEmail = typeof siteConfig.contact.email === 'string' && siteConfig.contact.email.trim().length > 0
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!form.name.trim()) nextErrors.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.'
    }
    if (form.message.trim().length < 10) {
      nextErrors.message = 'Please add a short message with at least 10 characters.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) return

    if (!hasEmail) {
      setErrors({ email: 'Email contact is temporarily unavailable. Please try again later.' })
      return
    }

    const subject = encodeURIComponent(`Kaelen Byte contact from ${form.name}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
    )

    window.location.href = `mailto:${siteConfig.contact.email}?subject=${subject}&body=${body}`
    setSubmitted(true)
    setForm(initialForm)
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Get in touch</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8">
          <div className="mb-4 flex items-center gap-3 text-sky-200">
            <Mail className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.2em]">Email</span>
          </div>

          {hasEmail ? (
            <>
              <p className="text-lg text-white">Questions, ideas, or a quick hello are always welcome.</p>
              <a href={`mailto:${siteConfig.contact.email}`} className="mt-4 inline-flex text-sky-300 hover:text-sky-200">
                {siteConfig.contact.email}
              </a>
            </>
          ) : (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
              <div className="mb-2 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                <span className="font-medium">Email contact is unavailable</span>
              </div>
                Please try again later or reach out through the social links.
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-sm leading-7 text-slate-300">
            This form opens your email app with the details filled in. Review the message and send it from your account; it is
            not submitted through this website.
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8">
          {submitted && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              Your email app should open with your message.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">Name</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400/60"
                placeholder="Your name"
              />
              {errors.name && <p id="name-error" className="mt-2 text-sm text-rose-300">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400/60"
                placeholder="name@example.com"
              />
              {errors.email && <p id="email-error" className="mt-2 text-sm text-rose-300">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-200">Message</label>
              <textarea
                id="message"
                name="message"
                required
                minLength={10}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'message-error' : undefined}
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                rows={6}
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400/60"
                placeholder="Tell us what you would like to discuss."
              />
              {errors.message && <p id="message-error" className="mt-2 text-sm text-rose-300">{errors.message}</p>}
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!hasEmail}
            >
              Open email app
              <Mail className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
