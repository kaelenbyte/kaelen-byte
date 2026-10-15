import { useState } from 'react'
import {
  Bell,
  Bookmark,
  Home,
  LogIn,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { useAuth } from '../auth/AuthProvider'
import { useRealtimeFeed } from '../realtime/useRealtime'
import { Avatar, secondaryButtonClass } from './ui'

const navItems = [
  { to: '/community', label: 'Feed', icon: Home, end: true },
  { to: '/community/following', label: 'Following', icon: Users, end: false },
  { to: '/community/saved', label: 'Saved', icon: Bookmark, end: false },
  { to: '/community/notifications', label: 'Notifications', icon: Bell, end: false },
] as const

function navLinkClass(isActive: boolean) {
  return `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
    isActive
      ? 'bg-sky-500/15 text-sky-100'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`
}

export function CommunityShell({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut, isConfigured } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('idle')
  const [signingOut, setSigningOut] = useState(false)

  useRealtimeFeed({ onStatusChange: setConnectionStatus })

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  const displayName = profile?.display_name ?? user?.email ?? 'Account'
  const username = profile?.username

  const showConnectionWarning =
    isConfigured && user && connectionStatus !== 'SUBSCRIBED' && connectionStatus !== 'idle'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">Community</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Community feed</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <>
                <Link to="/community/compose" className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New post
                </Link>
                <Link
                  to={username ? `/community/u/${username}` : '/community/settings'}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-300/50"
                >
                  <Avatar src={profile?.avatar_url} name={displayName} size={28} />
                  <span className="max-w-[10rem] truncate">{displayName}</span>
                </Link>
                <Link
                  to="/community/settings"
                  className={secondaryButtonClass}
                  aria-label="Account settings"
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Settings
                </Link>
                <button type="button" onClick={handleSignOut} disabled={signingOut} className={secondaryButtonClass}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link to="/community/login" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-300/50">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Sign in
                </Link>
                <Link to="/community/signup" className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                  Join
                </Link>
              </>
            )}

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close community menu' : 'Open community menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {showConnectionWarning && (
          <p role="status" className="mt-3 text-xs text-amber-200">
            Reconnecting to live updates...
          </p>
        )}

        <nav className="mt-4 hidden gap-2 lg:flex" aria-label="Community navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/community/moderation" className={({ isActive }) => navLinkClass(isActive)}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Moderation
          </NavLink>
        </nav>

        {menuOpen && (
          <nav className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-4 lg:hidden" aria-label="Community navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/community/moderation"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Moderation
            </NavLink>
          </nav>
        )}
      </header>

      {children}
    </div>
  )
}
