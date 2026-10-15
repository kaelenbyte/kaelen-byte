import { describe, expect, it } from 'vitest'

import { commentSchema, postSchema, signUpSchema, profileSchema } from './schemas'

describe('community validation schemas', () => {
  it('normalizes usernames and accepts a valid signup', () => {
    const result = signUpSchema.safeParse({
      email: 'person@example.com',
      password: 'a-secure-password',
      confirmPassword: 'a-secure-password',
      username: 'New_Member',
      displayName: 'New Member',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords and invalid usernames', () => {
    expect(signUpSchema.safeParse({
      email: 'person@example.com', password: 'password123', confirmPassword: 'different',
      username: 'bad name', displayName: 'Person',
    }).success).toBe(false)
  })

  it('rejects empty or overlong post content and comments', () => {
    expect(postSchema.safeParse({ content: '   ' }).success).toBe(false)
    expect(postSchema.safeParse({ content: 'x'.repeat(281) }).success).toBe(false)
    expect(commentSchema.safeParse({ content: 'x'.repeat(501) }).success).toBe(false)
  })

  it('normalizes the saved profile username', () => {
    const result = profileSchema.safeParse({ username: 'Kaelen_Byte', displayName: 'Kaelen', bio: '', avatarUrl: '' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.username).toBe('kaelen_byte')
  })
})
