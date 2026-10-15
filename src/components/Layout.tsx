import { ArrowRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { configuredSocialLinks, siteConfig } from '../config/site'
import { SocialIconLink } from './SocialIconLink'

const copyrightYear = new Date().getFullYear()

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
    <div className="relative isolate min-h-screen bg-[#17211d] text-slate-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/site-background.jpg"
          alt=""
          className="h-full w-full object-cover opacity-[0.22]"
        />
      </div>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#17211d]">
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
              Say hello
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
          <div className="border-t border-white/10 bg-[#17211d] md:hidden">
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

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-white/10 bg-[#17211d]">
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
              Follow along
            </h2>
            {configuredSocialLinks.length > 0 ? (
              <ul className="flex flex-wrap gap-3">
                {configuredSocialLinks.map((link) => (
                  <li key={link.label}>
                    <SocialIconLink link={link} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No links yet.</p>
            )}
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p>© {copyrightYear} Kaelen Byte. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
