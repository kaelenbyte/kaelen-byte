import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

const readEnvFile = () => {
  const env = {}
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
  return env
}

const env = readEnvFile()
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env first.')
}
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(url).hostname)) {
  throw new Error('This smoke test is restricted to a local Supabase URL; it will not run against production.')
}

const clientA = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const clientB = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const runStartedAt = new Date(Date.now() - 1000).toISOString()
const statusEnv = execFileSync('npx', ['--yes', 'supabase', 'status', '-o', 'env'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'ignore'],
})
const localServiceKey = statusEnv.match(/^SERVICE_ROLE_KEY=(.*)$/m)?.[1]?.replace(/^['"]|['"]$/g, '')
if (!localServiceKey) throw new Error('Could not retrieve the local Supabase cleanup key.')
const localAdmin = createClient(url, localServiceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const checks = []
const assert = (condition, label, detail = '') => {
  if (!condition) throw new Error(`FAIL: ${label}${detail ? ` — ${detail}` : ''}`)
  checks.push(label)
  console.log(`PASS ${label}`)
}

let postId = null
let commentId = null
let channel = null
let followerId = null
let authorId = null
let followTargetId = null
let liked = false
let saved = false
let followed = false
let storageObject = null
let forgedStorageObject = null
let registeredUserId = null
let reportId = null
let moderationActionId = null
let moderatorGranted = false

try {
  const { data: profiles, error: profilesError } = await clientA
    .from('profiles')
    .select('id,username,display_name')
    .order('username')
  assert(!profilesError && (profiles?.length ?? 0) >= 3, 'Anonymous users can read public profiles', profilesError?.message)

  const { error: anonymousPostError } = await clientA.from('posts').insert({ content: 'anonymous smoke-test write' })
  assert(Boolean(anonymousPostError), 'Anonymous users cannot create posts')

  const { data: authA, error: authAError } = await clientA.auth.signInWithPassword({
    email: 'demo.kaelen@example.com',
    password: 'password123',
  })
  assert(!authAError && Boolean(authA.user), 'Seed account can authenticate', authAError?.message)
  authorId = authA.user.id

  const { data: authB, error: authBError } = await clientB.auth.signInWithPassword({
    email: 'demo.maya@example.com',
    password: 'password123',
  })
  assert(!authBError && Boolean(authB.user), 'Second seed account can authenticate', authBError?.message)
  followerId = authB.user.id

  const { data: modResult, error: modError } = await clientA.rpc('is_moderator')
  assert(!modError && modResult === false, 'Ordinary account is not a moderator', modError?.message)

  const { error: roleGrantError } = await clientA.from('user_roles').insert({ user_id: authorId, role: 'admin' })
  assert(Boolean(roleGrantError), 'Ordinary account cannot grant itself an admin role')

  const registrationClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const registrationClientDuplicate = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const registrationSuffix = randomUUID().replaceAll('-', '').slice(0, 10)
  const username = `smoke_${registrationSuffix}`
  const { data: registration, error: registrationError } = await registrationClient.auth.signUp({
    email: `smoke-${registrationSuffix}@example.test`,
    password: 'smoke-test-password-123',
    options: { data: { username, display_name: 'Smoke Test' } },
  })
  assert(!registrationError && Boolean(registration.user), 'Registration creates an Auth account', registrationError?.message)
  registeredUserId = registration.user.id
  const { data: initializedProfile, error: initializedProfileError } = await clientA
    .from('profiles')
    .select('username,display_name')
    .eq('id', registeredUserId)
    .single()
  assert(!initializedProfileError && initializedProfile?.username === username, 'Registration trigger initializes a public profile', initializedProfileError?.message)

  const { error: duplicateUsernameError } = await registrationClientDuplicate.auth.signUp({
    email: `duplicate-${registrationSuffix}@example.test`,
    password: 'smoke-test-password-123',
    options: { data: { username, display_name: 'Duplicate Smoke' } },
  })
  assert(Boolean(duplicateUsernameError), 'Database rejects a duplicate username during registration')

  let postEventReceived = false
  let postSubscribed = false
  channel = clientB
    .channel(`community-smoke-${randomUUID()}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (event) => {
      console.log(`Realtime event received: ${event.eventType} ${event.schema}.${event.table}`)
      if (event.new?.content?.startsWith('[smoke-test]')) postEventReceived = true
    })
    .subscribe((status) => {
      console.log(`Realtime state: ${status}`)
      if (status === 'SUBSCRIBED') postSubscribed = true
    })

  for (let i = 0; i < 40 && !postSubscribed; i += 1) await new Promise((resolve) => setTimeout(resolve, 250))
  assert(postSubscribed, 'Realtime subscription connects')
  // The local stack can acknowledge a channel before its CDC tenant finishes
  // initializing, especially immediately after `supabase start` or `db reset`.
  await new Promise((resolve) => setTimeout(resolve, 25_000))

  const { data: post, error: postError } = await clientA
    .from('posts')
    .insert({ content: `[smoke-test] temporary post ${randomUUID()}` })
    .select('*')
    .single()
  assert(!postError && Boolean(post), 'Authenticated account can create a post', postError?.message)
  postId = post.id

  for (let i = 0; i < 80 && !postEventReceived; i += 1) await new Promise((resolve) => setTimeout(resolve, 250))
  assert(postEventReceived, 'Realtime delivers a new post to another session')

  const { data: unauthorizedUpdate, error: unauthorizedUpdateError } = await clientB
    .from('posts')
    .update({ content: 'unauthorized mutation' })
    .eq('id', postId)
    .select('id')
  assert(!unauthorizedUpdateError && (unauthorizedUpdate?.length ?? 0) === 0, 'A different account cannot edit this post')

  const { data: unchangedPost, error: unchangedPostError } = await clientA
    .from('posts')
    .select('content')
    .eq('id', postId)
    .single()
  assert(!unchangedPostError && unchangedPost.content === post.content, 'Unauthorized edit leaves persisted content unchanged')

  const { error: forgedLikeError } = await clientB.from('likes').insert({ post_id: postId, user_id: authorId })
  assert(Boolean(forgedLikeError), 'A user cannot forge another account as a like owner')

  const { error: likeError } = await clientB.from('likes').insert({ post_id: postId })
  assert(!likeError, 'Authenticated account can like a post', likeError?.message)
  liked = true

  const { data: comment, error: commentError } = await clientB
    .from('comments')
    .insert({ post_id: postId, content: 'temporary smoke-test comment' })
    .select('id')
    .single()
  assert(!commentError && Boolean(comment), 'Authenticated account can comment on a post', commentError?.message)
  commentId = comment.id

  const { data: followTarget, error: followTargetError } = await clientA
    .from('profiles')
    .select('id')
    .eq('username', 'omar_demo')
    .single()
  assert(!followTargetError && Boolean(followTarget), 'Third seeded profile is available', followTargetError?.message)
  followTargetId = followTarget.id
  const { error: followError } = await clientB.from('follows').insert({ following_id: followTargetId })
  assert(!followError, 'Authenticated account can follow another profile', followError?.message)
  followed = true

  const { error: saveError } = await clientB.from('saved_posts').insert({ post_id: postId })
  assert(!saveError, 'Authenticated account can save a post', saveError?.message)
  saved = true

  const { data: counts, error: countsError } = await clientA
    .from('post_details')
    .select('like_count,comment_count')
    .eq('id', postId)
    .single()
  assert(!countsError && counts.like_count === 1 && counts.comment_count === 1, 'Persisted interaction counts are accurate', countsError?.message)

  storageObject = `${authorId}/smoke-${randomUUID()}.png`
  const testImage = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' })
  const { error: uploadError } = await clientA.storage.from('post-images').upload(storageObject, testImage, { contentType: 'image/png' })
  assert(!uploadError, 'User can upload an image into their own storage folder', uploadError?.message)

  forgedStorageObject = `${authorId}/forged-${randomUUID()}.png`
  const { error: forgedUploadError } = await clientB.storage.from('post-images').upload(forgedStorageObject, testImage, { contentType: 'image/png' })
  assert(Boolean(forgedUploadError), 'User cannot upload into another account’s storage folder')

  const { data: notifications, error: notificationsError } = await clientA
    .from('notifications')
    .select('recipient_id')
  assert(!notificationsError && (notifications ?? []).every((row) => row.recipient_id === authorId), 'Notifications are restricted to their recipient', notificationsError?.message)

  const { data: report, error: reportError } = await clientB
    .from('reports')
    .insert({ target_type: 'comment', target_id: commentId, reason: 'spam', details: 'Smoke-test report' })
    .select('id,status')
    .single()
  assert(!reportError && report?.status === 'pending', 'Account can submit a report for existing content', reportError?.message)
  reportId = report.id

  const { data: privateReports, error: privateReportsError } = await clientA
    .from('reports')
    .select('id')
  assert(!privateReportsError && (privateReports ?? []).length === 0, 'Reporter details are hidden from ordinary accounts')

  const { data: reporterReports, error: reporterReportsError } = await clientB
    .from('reports')
    .select('id,status')
    .eq('id', reportId)
  assert(!reporterReportsError && reporterReports?.length === 1, 'Reporters can read their own reports', reporterReportsError?.message)

  const { error: duplicateReportError } = await clientB
    .from('reports')
    .insert({ target_type: 'comment', target_id: commentId, reason: 'spam' })
  assert(Boolean(duplicateReportError), 'Duplicate pending reports are rejected')

  const { error: grantModeratorError } = await localAdmin.from('user_roles').insert({ user_id: authorId, role: 'moderator' })
  assert(!grantModeratorError, 'Trusted local administrator can grant moderator access', grantModeratorError?.message)
  moderatorGranted = true
  const { data: moderatorStatus, error: moderatorStatusError } = await clientA.rpc('is_moderator')
  assert(!moderatorStatusError && moderatorStatus === true, 'Database verifies the moderator role', moderatorStatusError?.message)

  const { data: removedComment, error: removalError } = await clientA
    .from('comments')
    .delete()
    .eq('id', commentId)
    .select('id')
  assert(!removalError && removedComment?.length === 1, 'Moderator can remove reported content', removalError?.message)

  const { data: reviewedReport, error: reviewError } = await clientA
    .from('reports')
    .update({ status: 'actioned', reviewed_at: new Date().toISOString(), reviewed_by: authorId })
    .eq('id', reportId)
    .select('status')
    .single()
  assert(!reviewError && reviewedReport?.status === 'actioned', 'Moderator can review a report', reviewError?.message)

  const { data: auditAction, error: auditError } = await clientA
    .from('moderation_actions')
    .insert({ target_type: 'comment', target_id: commentId, action: 'removed', reason: 'Smoke test' })
    .select('id')
    .single()
  assert(!auditError && Boolean(auditAction), 'Moderator action is recorded in the audit log', auditError?.message)
  moderationActionId = auditAction.id

  const { data: reporterReview, error: reporterReviewError } = await clientB
    .from('reports')
    .select('status')
    .eq('id', reportId)
    .single()
  assert(!reporterReviewError && reporterReview.status === 'actioned', 'Reporter sees the final status of their report', reporterReviewError?.message)

  const { data: reports, error: reportsError } = await clientA.from('reports').select('id')
  assert(!reportsError && (reports ?? []).every((row) => row.id === reportId), 'Moderator report access stays within the permitted queue', reportsError?.message)
} finally {
  if (channel) await clientB.removeChannel(channel)
  if (postId) {
    if (commentId) await clientB.from('comments').delete().eq('id', commentId)
    if (liked) await clientB.from('likes').delete().eq('post_id', postId)
    if (saved) await clientB.from('saved_posts').delete().eq('post_id', postId)
    if (followed && followTargetId) await clientB.from('follows').delete().eq('following_id', followTargetId)
    await clientA.from('posts').delete().eq('id', postId)
  }
  if (storageObject) await clientA.storage.from('post-images').remove([storageObject])
  if (forgedStorageObject) await clientA.storage.from('post-images').remove([forgedStorageObject])
  if (moderationActionId) await localAdmin.from('moderation_actions').delete().eq('id', moderationActionId)
  if (reportId) await localAdmin.from('reports').delete().eq('id', reportId)
  if (followerId || authorId) {
    let events = localAdmin.from('posting_events').select('id').gte('created_at', runStartedAt)
    const actors = [followerId, authorId].filter(Boolean)
    if (actors.length === 1) events = events.eq('user_id', actors[0])
    else events = events.in('user_id', actors)
    const { data: eventRows } = await events
    if (eventRows?.length) await localAdmin.from('posting_events').delete().in('id', eventRows.map((event) => event.id))
  }
  if (moderatorGranted && authorId) await localAdmin.from('user_roles').delete().eq('user_id', authorId).eq('role', 'moderator')
  if (registeredUserId) await localAdmin.auth.admin.deleteUser(registeredUserId)
  await clientA.auth.signOut()
  await clientB.auth.signOut()
}

console.log(`\n${checks.length} local Supabase checks passed.`)
