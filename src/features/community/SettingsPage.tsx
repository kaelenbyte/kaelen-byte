import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../auth/AuthProvider'
import { profileSchema, type ProfileInput } from '../auth/schemas'
import { zodResolver } from '../../lib/rhfZodResolver'
import { useUpdateProfile } from '../profiles/useProfile'
import { toUserMessage } from '../../lib/errors'
import { Avatar, FieldError, inputClass, labelClass, primaryButtonClass } from './ui'

export function SettingsPage() {
  const { user, profile } = useAuth()
  const mutation = useUpdateProfile()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (profile) reset({ username: profile.username, displayName: profile.display_name, bio: profile.bio, avatarUrl: profile.avatar_url ?? '' })
  }, [profile, reset])

  const onSubmit = async (values: ProfileInput) => {
    setError(''); setSaved(false)
    try {
      await mutation.mutateAsync({ displayName: values.displayName, username: values.username, bio: values.bio, avatarFile, avatarUrl: values.avatarUrl })
      setAvatarFile(null); setSaved(true)
    } catch (cause) { setError(toUserMessage(cause, 'Profile could not be saved.')) }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Settings</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">Profile settings</h2>
      <p className="mt-2 text-sm text-slate-400">Account: {user?.email}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div className="flex items-center gap-4"><Avatar src={profile?.avatar_url} name={profile?.display_name ?? 'You'} size={64} /><label className="block text-sm text-slate-300">Avatar image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="mt-2 block w-full text-xs text-slate-400" onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)} /><span className="mt-1 block text-xs text-slate-500">PNG, JPEG, WEBP, or GIF · maximum 2 MB</span></label></div>
        <label className="block"><span className={labelClass}>Display name</span><input className={inputClass} {...register('displayName')} /><FieldError message={errors.displayName?.message} /></label>
        <label className="block"><span className={labelClass}>Username</span><input className={inputClass} autoComplete="username" {...register('username')} /><FieldError message={errors.username?.message} /></label>
        <label className="block"><span className={labelClass}>Bio</span><textarea rows={4} maxLength={280} className={inputClass} {...register('bio')} /><FieldError message={errors.bio?.message} /></label>
        {error && <FieldError message={error} />}
        {saved && <p role="status" className="text-sm text-emerald-300">Profile saved.</p>}
        <button type="submit" disabled={mutation.isPending} className={primaryButtonClass}>{mutation.isPending ? 'Saving...' : 'Save profile'}</button>
      </form>
    </section>
  )
}
