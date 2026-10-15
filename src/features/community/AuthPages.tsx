import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { useAuth } from '../auth/AuthProvider'
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  onboardingSchema,
  type SignInInput,
  type SignUpInput,
  type ResetPasswordInput,
  type UpdatePasswordInput,
  type OnboardingInput,
} from '../auth/schemas'
import { zodResolver } from '../../lib/rhfZodResolver'
import { toUserMessage } from '../../lib/errors'
import { ConfigNotice, FieldError, inputClass, labelClass, primaryButtonClass } from './ui'

function AuthCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  )
}

export function LoginPage() {
  const { signIn, isConfigured, configError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const from = (location.state as { from?: string } | null)?.from ?? '/community'
  const { register, handleSubmit, formState: { errors } } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  if (!isConfigured) return <ConfigNotice message={configError ?? undefined} />

  const onSubmit = async (values: SignInInput) => {
    setError('')
    setBusy(true)
    try {
      await signIn(values.email, values.password)
      navigate(from, { replace: true })
    } catch (cause) {
      setError(toUserMessage(cause, 'Sign in failed. Check your details and try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard eyebrow="Welcome back" title="Sign in to your account">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <label className="block">
          <span className={labelClass}>Email</span>
          <input type="email" autoComplete="email" className={inputClass} {...register('email')} />
          <FieldError message={errors.email?.message} />
        </label>
        <label className="block">
          <span className={labelClass}>Password</span>
          <input type="password" autoComplete="current-password" className={inputClass} {...register('password')} />
          <FieldError message={errors.password?.message} />
        </label>
        {error && <FieldError message={error} />}
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className={primaryButtonClass}>{busy ? 'Signing in...' : 'Sign in'}</button>
          <Link to="/community/reset-password" className="text-sm text-sky-200 hover:text-white">Forgot password?</Link>
        </div>
        <p className="text-sm text-slate-400">New here? <Link to="/community/signup" className="text-sky-200 hover:text-white">Create an account</Link></p>
      </form>
    </AuthCard>
  )
}

export function SignupPage() {
  const { signUp, isConfigured, configError } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(false)
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  })

  if (!isConfigured) return <ConfigNotice message={configError ?? undefined} />

  const onSubmit = async (values: SignUpInput) => {
    setError('')
    setBusy(true)
    try {
      const result = await signUp(values.email, values.password, values.username, values.displayName)
      if (result.needsEmailConfirmation) {
        setConfirmation(true)
      } else {
        navigate('/community', { replace: true })
      }
    } catch (cause) {
      setError(toUserMessage(cause, 'We could not create your account. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  if (confirmation) {
    return (
      <AuthCard eyebrow="Check your email" title="Confirm your account">
        <p className="mt-4 text-slate-300">We sent a confirmation link to the address you entered. Open it to finish creating your account.</p>
        <Link to="/community/login" className={`${primaryButtonClass} mt-6`}>Return to sign in</Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard eyebrow="Join" title="Create your community account">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <label className="block"><span className={labelClass}>Display name</span><input autoComplete="name" className={inputClass} {...register('displayName')} /><FieldError message={errors.displayName?.message} /></label>
        <label className="block"><span className={labelClass}>Username</span><input autoComplete="username" className={inputClass} {...register('username')} /><FieldError message={errors.username?.message} /></label>
        <label className="block"><span className={labelClass}>Email</span><input type="email" autoComplete="email" className={inputClass} {...register('email')} /><FieldError message={errors.email?.message} /></label>
        <label className="block"><span className={labelClass}>Password</span><input type="password" autoComplete="new-password" className={inputClass} {...register('password')} /><FieldError message={errors.password?.message} /></label>
        <label className="block"><span className={labelClass}>Confirm password</span><input type="password" autoComplete="new-password" className={inputClass} {...register('confirmPassword')} /><FieldError message={errors.confirmPassword?.message} /></label>
        {error && <FieldError message={error} />}
        <button type="submit" disabled={busy} className={primaryButtonClass}>{busy ? 'Creating account...' : 'Create account'}</button>
        <p className="text-sm text-slate-400">Already a member? <Link to="/community/login" className="text-sky-200 hover:text-white">Sign in</Link></p>
      </form>
    </AuthCard>
  )
}

export function ResetPasswordPage() {
  const { resetPassword, updatePassword, isConfigured, configError } = useAuth()
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [busy, setBusy] = useState(false)
  const recoveryMode = typeof window !== 'undefined' && /type=recovery/.test(window.location.hash)
  const emailForm = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })
  const passwordForm = useForm<UpdatePasswordInput>({ resolver: zodResolver(updatePasswordSchema) })

  if (!isConfigured) return <ConfigNotice message={configError ?? undefined} />

  const onRequest = async (values: ResetPasswordInput) => {
    setError(''); setBusy(true)
    try { await resetPassword(values.email); setSent(true) }
    catch (cause) { setError(toUserMessage(cause, 'The recovery email could not be sent.')) }
    finally { setBusy(false) }
  }

  const onUpdate = async (values: UpdatePasswordInput) => {
    setError(''); setBusy(true)
    try { await updatePassword(values.password); setUpdated(true) }
    catch (cause) { setError(toUserMessage(cause, 'The password could not be updated.')) }
    finally { setBusy(false) }
  }

  if (updated) {
    return <AuthCard eyebrow="Password updated" title="You are all set"><p className="mt-4 text-slate-300">Your password was changed successfully.</p><Link className={`${primaryButtonClass} mt-6`} to="/community/login">Sign in</Link></AuthCard>
  }

  if (recoveryMode) {
    return (
      <AuthCard eyebrow="Recovery" title="Choose a new password">
        <form onSubmit={passwordForm.handleSubmit(onUpdate)} className="mt-6 space-y-4">
          <label className="block"><span className={labelClass}>New password</span><input type="password" autoComplete="new-password" className={inputClass} {...passwordForm.register('password')} /><FieldError message={passwordForm.formState.errors.password?.message} /></label>
          <label className="block"><span className={labelClass}>Confirm new password</span><input type="password" autoComplete="new-password" className={inputClass} {...passwordForm.register('confirmPassword')} /><FieldError message={passwordForm.formState.errors.confirmPassword?.message} /></label>
          {error && <FieldError message={error} />}
          <button type="submit" disabled={busy} className={primaryButtonClass}>{busy ? 'Updating...' : 'Update password'}</button>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard eyebrow="Recovery" title="Reset your password">
      {sent ? <p role="status" className="mt-4 text-slate-300">If an account matches that email, a recovery link has been sent.</p> : (
        <form onSubmit={emailForm.handleSubmit(onRequest)} className="mt-6 space-y-4">
          <p className="text-sm text-slate-300">Enter your email and we will send a secure recovery link.</p>
          <label className="block"><span className={labelClass}>Email</span><input type="email" autoComplete="email" className={inputClass} {...emailForm.register('email')} /><FieldError message={emailForm.formState.errors.email?.message} /></label>
          {error && <FieldError message={error} />}
          <button type="submit" disabled={busy} className={primaryButtonClass}>{busy ? 'Sending...' : 'Send recovery email'}</button>
        </form>
      )}
      <Link to="/community/login" className="mt-5 inline-block text-sm text-sky-200 hover:text-white">Back to sign in</Link>
    </AuthCard>
  )
}

export function OnboardingPage() {
  const { user, ensureProfile } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: String(user?.user_metadata.username ?? ''),
      displayName: String(user?.user_metadata.display_name ?? ''),
    },
  })

  const onSubmit = async (values: OnboardingInput) => {
    setError(''); setBusy(true)
    try { await ensureProfile(values.displayName, values.username); navigate('/community', { replace: true }) }
    catch (cause) { setError(toUserMessage(cause, 'Your profile could not be set up.')) }
    finally { setBusy(false) }
  }

  return (
    <AuthCard eyebrow="One last step" title="Set up your profile">
      <p className="mt-3 text-sm text-slate-300">Your account is ready. Choose a public username and display name to continue.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <label className="block"><span className={labelClass}>Display name</span><input autoComplete="name" className={inputClass} {...register('displayName')} /><FieldError message={errors.displayName?.message} /></label>
        <label className="block"><span className={labelClass}>Username</span><input autoComplete="username" className={inputClass} {...register('username')} /><FieldError message={errors.username?.message} /></label>
        {error && <FieldError message={error} />}
        <button type="submit" disabled={busy} className={primaryButtonClass}>{busy ? 'Saving...' : 'Continue'}</button>
      </form>
    </AuthCard>
  )
}
