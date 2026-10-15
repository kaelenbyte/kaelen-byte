import { z } from 'zod'

const usernameRegex = /^[a-z0-9_]{3,30}$/i

export const signUpSchema = z
  .object({
    email: z.string().email('Enter a valid email.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(100, 'Password must be under 100 characters.'),
    confirmPassword: z.string(),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be between 3 and 30 characters.')
      .max(30, 'Username must be between 3 and 30 characters.')
      .regex(usernameRegex, 'Use lowercase letters, numbers, or underscore only.'),
    displayName: z
      .string()
      .trim()
      .min(1, 'Display name is required.')
      .max(60, 'Display name must be under 60 characters.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type SignUpInput = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
})

export type SignInInput = z.infer<typeof signInSchema>

export const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email.'),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(100, 'Password must be under 100 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

export const onboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be between 3 and 30 characters.')
    .max(30, 'Username must be between 3 and 30 characters.')
    .regex(usernameRegex, 'Use lowercase letters, numbers, or underscore only.')
    .transform((value) => value.toLowerCase()),
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required.')
    .max(60, 'Display name must be under 60 characters.'),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be between 3 and 30 characters.')
    .max(30, 'Username must be between 3 and 30 characters.')
    .regex(usernameRegex, 'Use lowercase letters, numbers, or underscore only.')
    .transform((value) => value.toLowerCase()),
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required.')
    .max(60, 'Display name must be under 60 characters.'),
  bio: z
    .string()
    .trim()
    .max(280, 'Bio must be under 280 characters.'),
  avatarUrl: z
    .string()
    .url('Avatar must be a valid URL.')
    .optional()
    .or(z.literal('')),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const postSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Your post needs a little more text.')
    .max(280, 'Posts must be under 280 characters.'),
  imageUrl: z
    .string()
    .url('Image must be a valid URL.')
    .optional()
    .or(z.literal('')),
})

export type PostInput = z.infer<typeof postSchema>

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Your comment cannot be empty.')
    .max(500, 'Comments must be under 500 characters.'),
})

export type CommentInput = z.infer<typeof commentSchema>

export const reportSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Please choose a reason.')
    .max(60, 'Reason must be under 60 characters.'),
  details: z
    .string()
    .trim()
    .max(500, 'Details must be under 500 characters.')
    .optional()
    .or(z.literal('')),
})

export type ReportInput = z.infer<typeof reportSchema>
