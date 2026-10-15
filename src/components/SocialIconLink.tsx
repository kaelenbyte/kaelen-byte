import { Link2, MessageCircle, Music2 } from 'lucide-react'

import type { SocialLinkDefinition } from '../config/site'

type SocialIconLinkProps = {
  link: SocialLinkDefinition
}

export function SocialIconLink({ link }: SocialIconLinkProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      aria-label={link.label}
      title={link.label}
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#1d2a24] text-slate-100 transition hover:border-sky-300 hover:bg-sky-500/15 hover:text-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
    >
      {link.label === 'TikTok' ? (
        <Music2 aria-hidden="true" className="h-5 w-5" />
      ) : link.label === 'WhatsApp' ? (
        <MessageCircle aria-hidden="true" className="h-5 w-5" />
      ) : (
        <Link2 aria-hidden="true" className="h-5 w-5" />
      )}
    </a>
  )
}