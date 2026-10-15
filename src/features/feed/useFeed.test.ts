import { describe, expect, it } from 'vitest'

import { dedupeById } from './useFeed'

describe('feed reconciliation', () => {
  it('deduplicates records by stable ID while preserving newest-first order', () => {
    const result = dedupeById([
      { id: 'new', value: 1 },
      { id: 'old', value: 2 },
      { id: 'new', value: 3 },
    ])
    expect(result).toEqual([{ id: 'new', value: 1 }, { id: 'old', value: 2 }])
  })
})
