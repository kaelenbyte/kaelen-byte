// Supabase Edge Function: grant-role
//
// This is the ONLY supported way to grant or revoke the `moderator` role.
// It never trusts the browser: the caller's JWT is verified against the
// `user_roles` table, and the privileged write uses the service-role key,
// which exists only inside this server-side function's environment.
//
// Deploy with:
//   supabase functions deploy grant-role
// Secrets required (set with `supabase secrets set`):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (provided automatically by Supabase)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type RequestBody = {
  userId?: string
  role?: 'moderator' | 'admin'
  revoke?: boolean
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const authHeader = req.headers.get('Authorization')

    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'Server is not configured.' }, 500)
    }
    if (!authHeader) {
      return json({ error: 'Authentication required.' }, 401)
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await admin.auth.getUser(token)
    if (userError || !userData.user) {
      return json({ error: 'Invalid session.' }, 401)
    }

    const { data: adminRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!adminRow) {
      return json({ error: 'Administrator privileges required.' }, 403)
    }

    const body = (await req.json()) as RequestBody
    if (!body.userId || (body.role !== 'moderator' && body.role !== 'admin')) {
      return json({ error: 'A valid userId and role are required.' }, 400)
    }

    if (body.revoke) {
      const { error } = await admin
        .from('user_roles')
        .delete()
        .eq('user_id', body.userId)
        .eq('role', body.role)
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true, revoked: true })
    }

    const { error } = await admin
      .from('user_roles')
      .upsert({ user_id: body.userId, role: body.role }, { onConflict: 'user_id,role' })
    if (error) return json({ error: error.message }, 400)

    return json({ ok: true })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500)
  }
})

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
