import { ArrowRight, Menu, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { configuredSocialLinks, siteConfig } from '../config/site'

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-400/60 bg-sky-500/10 text-sm font-black tracking-[0.18em] text-sky-300 shadow-[0_0_35px_rgba(56,189,248,0.25)]">
        KB
      </div>
      <div>
        <div className="text-base font-semibold tracking-[0.2em] text-slate-100 uppercase">
          {siteConfig.brandName}
        </div>
      </div>
    </div>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_35%)]" />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Go to homepage" className="flex items-center gap-3">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            {siteConfig.navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-sky-300' : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:border-sky-300 hover:bg-sky-500/20"
            >
              Connect
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-slate-950 md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4" aria-label="Mobile navigation">
              {siteConfig.navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive ? 'bg-sky-500/10 text-sky-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="relative">{children}</main>

      <footer className="border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <BrandMark />
            </div>
            <p className="max-w-md text-sm text-slate-400">
              {siteConfig.shortIntro}
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
              Explore
            </h2>
            <ul className="space-y-3 text-sm text-slate-400">
              {siteConfig.navItems.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
              Connect
            </h2>
            {configuredSocialLinks.length > 0 ? (
              <ul className="space-y-3 text-sm text-slate-400">
                {configuredSocialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 transition hover:text-white"
                    >
                      {link.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Social links are ready to be configured.</p>
            )}
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p>© 2026 Kaelen Byte. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sky-300">
              <Sparkles className="h-4 w-4" />
              <span>Editable brand copy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
