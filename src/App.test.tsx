import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from './App'

describe('App', () => {
  it('renders the Kaelen Byte brand heading', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /^kaelen byte$/i, level: 1 }),
    ).toBeInTheDocument()
  })
})
