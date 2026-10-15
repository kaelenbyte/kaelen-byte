import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ImageIcon, Send, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { postSchema, type PostInput } from '../auth/schemas'
import { zodResolver } from '../../lib/rhfZodResolver'
import { useAuth } from '../auth/AuthProvider'
import { useCreatePost } from '../posts/usePosts'
import { deleteImage, uploadImage } from '../storage/uploadApi'
import { MAX_POST_IMAGE_SIZE_BYTES, validateImage } from '../storage/upload'
import { toUserMessage } from '../../lib/errors'
import { Avatar, FieldError, inputClass, primaryButtonClass } from './ui'

const MAX_LENGTH = 280

export function PostComposer({ onCreated, autoFocus = false }: { onCreated?: () => void; autoFocus?: boolean }) {
  const { user, profile } = useAuth()
  const createPost = useCreatePost()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [imageError, setImageError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: '', imageUrl: '' },
  })

  const content = watch('content') ?? ''

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setImageError('')
    if (!file) {
      setImageFile(null)
      setPreviewUrl('')
      return
    }
    const validation = validateImage(file, MAX_POST_IMAGE_SIZE_BYTES)
    if (validation === 'type') {
      setImageError('Unsupported format. Use PNG, JPEG, WEBP, or GIF.')
      return
    }
    if (validation === 'size') {
      setImageError('Image is too large. Maximum size is 5 MB.')
      return
    }
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    setPreviewUrl('')
    setImageError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (values: PostInput) => {
    setSubmitError('')
    setSuccessMessage('')
    if (!user) {
      setSubmitError('You must be signed in to post.')
      return
    }

    let imageUrl: string | undefined
    try {
      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage('post-images', imageFile, user.id)
      }
    } catch (error) {
      setUploading(false)
      setSubmitError(toUserMessage(error, 'The image could not be uploaded. Your post was not created.'))
      return
    }

    try {
      await createPost.mutateAsync({ content: values.content, imageUrl })
      setUploading(false)
      reset({ content: '', imageUrl: '' })
      clearImage()
      setSuccessMessage('Your post is live.')
      onCreated?.()
    } catch (error) {
      setUploading(false)
      await deleteImage('post-images', imageUrl)
      setSubmitError(toUserMessage(error, 'Your post could not be created.'))
    }
  }

  const busy = isSubmitting || uploading || createPost.isPending

  if (!user) {
    return null
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5" aria-label="Create a post">
      <div className="mb-3 flex items-center gap-3">
        <Avatar src={profile?.avatar_url} name={profile?.display_name ?? 'You'} />
        <div>
          <p className="font-semibold text-white">Share an update</p>
          <p className="text-xs text-slate-400">Posting as @{profile?.username ?? 'you'}</p>
        </div>
      </div>

      <label className="sr-only" htmlFor="post-content">
        Post content
      </label>
      <textarea
        id="post-content"
        autoFocus={autoFocus}
        rows={4}
        maxLength={MAX_LENGTH}
        placeholder="What are you thinking about today?"
        className={inputClass}
        {...register('content')}
      />
      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
        <FieldError message={errors.content?.message} />
        <span aria-live="polite">
          {content.length}/{MAX_LENGTH}
        </span>
      </div>

      {previewUrl && (
        <div className="relative mt-3">
          <img src={previewUrl} alt="Selected upload preview" className="max-h-72 w-full rounded-2xl border border-white/10 object-cover" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-3 py-1 text-xs text-rose-200 hover:text-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={fileInputRef}
          id="post-image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="sr-only"
        />
        <label
          htmlFor="post-image"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-300/50"
        >
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          Add image
        </label>

        <button type="submit" disabled={busy} className={`${primaryButtonClass} sm:ml-auto`}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {uploading ? 'Uploading...' : isSubmitting || createPost.isPending ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      <FieldError message={imageError} />
      <FieldError message={submitError} />
      {successMessage && (
        <p role="status" className="mt-3 text-sm text-emerald-300">
          {successMessage}
        </p>
      )}
    </form>
  )
}
