export type SocialLinkDefinition = {
  label: string
  url: string
  enabled: boolean
}

const productionDomain = (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')

export const siteConfig = {
  brandName: 'Kaelen Byte',
  tagline: 'Create. Learn. Share.',
  shortIntro: 'A place for ideas, experiments, and the work that comes out of them.',
  description: 'A place for ideas, experiments, and the work that comes out of them.',
  productionDomain,
  themeColor: '#17211d',
  socialLinks: {
    tiktok: {
      label: 'TikTok',
      url: 'https://www.tiktok.com/@jaydendarius.me',
      enabled: true,
    },
    whatsapp: {
      label: 'WhatsApp',
      url: 'https://wa.me/254702155734',
      enabled: true,
    },
    facebook: { label: 'Facebook', url: '', enabled: false },
    instagram: { label: 'Instagram', url: '', enabled: false },
    youtube: { label: 'YouTube', url: '', enabled: false },
    x: { label: 'X', url: '', enabled: false },
    linkedin: { label: 'LinkedIn', url: '', enabled: false },
  } as Record<string, SocialLinkDefinition>,
  contact: {
    email: 'kaelenbyte.us@gmail.com',
    phone: '',
    formEnabled: false,
  },
  seo: {
    defaultTitle: 'Kaelen Byte | Official Website',
    defaultDescription: 'A place for ideas, experiments, and the work that comes out of them.',
  },
  navItems: [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/content', label: 'Content' },
    { to: '/social', label: 'Social' },
    { to: '/community', label: 'Community' },
    { to: '/contact', label: 'Contact' },
  ],
} as const

export const configuredSocialLinks = Object.values(siteConfig.socialLinks).filter(
  (link) => link.enabled && link.url.trim().length > 0,
)
