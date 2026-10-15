export const generateObjectName = (originalName: string): string => {
  const extensionMatch = originalName.split('.').pop()
  const extension = extensionMatch ? `.${extensionMatch}` : ''
  return `${uuid()}${extension}`
}

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024
export const MAX_POST_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export type ImageValidationError = 'type' | 'size' | null

export const validateImage = (
  file: File,
  maxBytes: number,
): ImageValidationError => {
  if (!ACCEPTED_IMAGE_TYPES.some((type) => file.type === type)) {
    return 'type'
  }
  if (file.size > maxBytes) {
    return 'size'
  }
  return null
}

export const uuid = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15)
}
