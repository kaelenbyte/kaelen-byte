import { useEffect } from 'react'

import { siteConfig } from '../config/site'

type UsePageMetaOptions = {
  title?: string
  description?: string
  canonicalUrl?: string
}

export function usePageMeta({
  title,
  description,
  canonicalUrl,
}: UsePageMetaOptions = {}) {
  useEffect(() => {
    const pageTitle = title ? `${title} | ${siteConfig.brandName}` : siteConfig.seo.defaultTitle
    document.title = pageTitle

    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null

      if (!element) {
        element = document.createElement('meta')
        document.head.appendChild(element)
      }

      element.setAttribute(attribute, value)
      return element
    }

    const descriptionText = description || siteConfig.seo.defaultDescription
    setMeta('meta[name="description"]', 'content', descriptionText)
    setMeta('meta[property="og:title"]', 'content', pageTitle)
    setMeta('meta[property="og:description"]', 'content', descriptionText)
    setMeta('meta[property="og:type"]', 'content', 'website')
    setMeta('meta[property="og:site_name"]', 'content', siteConfig.brandName)
    setMeta('meta[property="og:url"]', 'content', canonicalUrl || siteConfig.productionDomain)
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image')
    setMeta('meta[name="theme-color"]', 'content', siteConfig.themeColor)

    const canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null

    if (canonicalUrl) {
      if (canonical) {
        canonical.href = canonicalUrl
      } else {
        const nextCanonical = document.createElement('link')
        nextCanonical.rel = 'canonical'
        nextCanonical.href = canonicalUrl
        document.head.appendChild(nextCanonical)
      }
    }
  }, [canonicalUrl, description, title])
}
