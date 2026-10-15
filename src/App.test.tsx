import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from './App'

const routes = [
  { path: '/', heading: 'Kaelen Byte' },
  { path: '/about', heading: 'About Kaelen Byte' },
  { path: '/content', heading: 'Notes & updates' },
  { path: '/content/brand-direction-notes', heading: 'Article not found' },
  { path: '/social', heading: 'Find me online' },
  { path: '/community', heading: 'Community feed' },
  { path: '/contact', heading: 'Get in touch' },
  { path: '/privacy', heading: 'Privacy notice' },
  { path: '/missing-page', heading: 'Page not found' },
]

describe.each(routes)('route $path', ({ path, heading }) => {
  it(`renders the ${heading} heading`, () => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: heading, level: 1 })).toBeInTheDocument()
  })
})

it('shows social profiles as icon-only links', () => {
  render(
    <MemoryRouter initialEntries={['/social']}>
      <App />
    </MemoryRouter>,
  )

  const tiktokLinks = screen.getAllByRole('link', { name: 'TikTok' })
  const whatsappLinks = screen.getAllByRole('link', { name: 'WhatsApp' })

  expect(tiktokLinks).toHaveLength(2)
  expect(whatsappLinks).toHaveLength(2)
  tiktokLinks.forEach((link) => {
    expect(link).toHaveAttribute('href', 'https://www.tiktok.com/@jaydendarius.me')
  })
  whatsappLinks.forEach((link) => {
    expect(link).toHaveAttribute('href', 'https://wa.me/254702155734')
  })
  expect(screen.queryByText('TikTok')).not.toBeInTheDocument()
  expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
  expect(screen.queryByText('https://wa.me/254702155734')).not.toBeInTheDocument()
})

it('shows the content empty state without unpublished sample articles', () => {
  render(
    <MemoryRouter initialEntries={['/content']}>
      <App />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { name: 'No articles yet' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Follow along' })).toHaveAttribute('href', '/social')
  expect(screen.queryByText(/placeholder draft/i)).not.toBeInTheDocument()
  expect(screen.queryByText('Draft-ready section')).not.toBeInTheDocument()
})

it('describes the contact form as an email-app handoff', () => {
  render(
    <MemoryRouter initialEntries={['/contact']}>
      <App />
    </MemoryRouter>,
  )

  expect(screen.getByRole('button', { name: 'Open email app' })).toBeEnabled()
  expect(screen.getByText(/it is not submitted through this website/i)).toBeInTheDocument()
})
