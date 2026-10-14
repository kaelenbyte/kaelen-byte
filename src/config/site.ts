export type SocialLinkDefinition = {
  label: string
  url: string
  enabled: boolean
}

export const siteConfig = {
  brandName: 'Kaelen Byte',
  tagline: 'Explore. Create. Innovate.',
  shortIntro:
    'Welcome to Kaelen Byte — a digital space for creativity, technology, ideas, and new possibilities.',
  description:
    'Explore the official Kaelen Byte website for updates, original content, projects, and social media links.',
  productionDomain: 'https://your-domain.example',
  themeColor: '#050816',
  socialLinks: {
    tiktok: {
      label: 'TikTok',
      url: 'https://www.tiktok.com/@jaydendarius.me',
      enabled: true,
    },
    facebook: { label: 'Facebook', url: '', enabled: false },
    instagram: { label: 'Instagram', url: '', enabled: false },
    youtube: { label: 'YouTube', url: '', enabled: false },
    x: { label: 'X', url: '', enabled: false },
    linkedin: { label: 'LinkedIn', url: '', enabled: false },
  } as Record<string, SocialLinkDefinition>,
  contact: {
    email: '',
    phone: '',
    formEnabled: false,
  },
  seo: {
    defaultTitle: 'Kaelen Byte | Official Website',
    defaultDescription:
      'Explore the official Kaelen Byte website for updates, original content, projects, and social media links.',
  },
  navItems: [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/content', label: 'Content' },
    { to: '/social', label: 'Social' },
    { to: '/contact', label: 'Contact' },
  ],
} as const

export const configuredSocialLinks = Object.values(siteConfig.socialLinks).filter(
  (link) => link.enabled && link.url.trim().length > 0,
)
