import { getSupabaseClient } from '../../integrations/supabase/client'
import { throwIfError } from '../../lib/errors'
import {
  generateObjectName,
  validateImage,
  MAX_AVATAR_SIZE_BYTES,
  MAX_POST_IMAGE_SIZE_BYTES,
} from './upload'

export type Bucket = 'avatars' | 'post-images'

const maxBytesFor = (bucket: Bucket) =>
  bucket === 'avatars' ? MAX_AVATAR_SIZE_BYTES : MAX_POST_IMAGE_SIZE_BYTES

export class ImageValidationError extends Error {
  constructor(kind: 'type' | 'size', bucket: Bucket) {
    super(
      kind === 'type'
        ? 'Unsupported image format. Use PNG, JPEG, WEBP, or GIF.'
        : `Image is too large. Maximum size is ${Math.round(maxBytesFor(bucket) / 1024 / 1024)} MB.`,
    )
    this.name = 'ImageValidationError'
  }
}

/**
 * Validates the file locally (fast feedback) then uploads it into the caller's
 * own folder: {userId}/{uuid}.{ext}. The storage policy independently enforces
 * that the folder matches the authenticated user and that the bucket's MIME
 * and size limits are respected — the client check is not the security boundary.
 */
export const uploadImage = async (bucket: Bucket, file: File, userId: string): Promise<string> => {
  const validation = validateImage(file, maxBytesFor(bucket))
  if (validation) {
    throw new ImageValidationError(validation, bucket)
  }

  const client = getSupabaseClient()
  const objectName = `${userId}/${generateObjectName(file.name)}`
  const { error } = await client.storage.from(bucket).upload(objectName, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  throwIfError(error)

  const { data } = client.storage.from(bucket).getPublicUrl(objectName)
  return data.publicUrl
}

/**
 * Best-effort removal of a previously uploaded object. Given a public URL we
 * extract the object path within the bucket and delete it. Failures are logged
 * but never block the user-facing operation (e.g. deleting a post).
 */
export const deleteImage = async (bucket: Bucket, publicUrl: string | null | undefined) => {
  if (!publicUrl) {
    return
  }
  const marker = `/object/public/${bucket}/`
  const index = publicUrl.indexOf(marker)
  if (index === -1) {
    return
  }
  const objectPath = decodeURIComponent(publicUrl.slice(index + marker.length).split('?')[0])
  if (!objectPath) {
    return
  }
  try {
    const client = getSupabaseClient()
    const { error } = await client.storage.from(bucket).remove([objectPath])
    if (error) {
      console.warn('Failed to remove storage object', error.message)
    }
  } catch (error) {
    console.warn('Failed to remove storage object', error)
  }
}
