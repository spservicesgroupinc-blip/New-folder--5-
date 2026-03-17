import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization')!
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Service-role client for admin operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Verify caller is an admin
    const { data: callerMember } = await adminClient
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!callerMember || callerMember.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only admins can invite crew members' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, role } = await req.json()

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const validRoles = ['crew', 'supervisor', 'technician', 'helper']
    const memberRole = validRoles.includes(role) ? role : 'crew'

    // Send invite email via Supabase Auth admin API
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email)

    if (inviteError) {
      // If user already exists, try to just add them to the company
      if (inviteError.message?.includes('already been registered')) {
        const { data: existingUsers } = await adminClient.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === email)

        if (!existingUser) {
          throw inviteError
        }

        // Check if already in this company
        const { data: existingMember } = await adminClient
          .from('company_members')
          .select('id')
          .eq('company_id', callerMember.company_id)
          .eq('user_id', existingUser.id)
          .limit(1)

        if (existingMember && existingMember.length > 0) {
          return new Response(JSON.stringify({ error: 'User is already a member of this company' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        // Add to company
        const { error: memberError } = await adminClient
          .from('company_members')
          .insert({
            company_id: callerMember.company_id,
            user_id: existingUser.id,
            role: memberRole,
            invited_by: user.id,
          })

        if (memberError) throw memberError

        return new Response(
          JSON.stringify({ success: true, message: 'Existing user added to company' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      throw inviteError
    }

    // Pre-create company_members row for the invited user
    if (inviteData.user) {
      const { error: memberError } = await adminClient
        .from('company_members')
        .insert({
          company_id: callerMember.company_id,
          user_id: inviteData.user.id,
          role: memberRole,
          invited_by: user.id,
        })

      if (memberError) throw memberError
    }

    return new Response(
      JSON.stringify({ success: true, message: `Invite sent to ${email}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
