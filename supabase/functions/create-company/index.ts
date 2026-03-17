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

    // Client with the caller's JWT — used to verify identity
    const authHeader = req.headers.get('Authorization')!
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })

    // Verify the caller is authenticated
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Service-role client for admin operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { companyName } = await req.json()
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'companyName is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user already belongs to a company
    const { data: existing } = await adminClient
      .from('company_members')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ error: 'User already belongs to a company' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create the company
    const { data: company, error: companyError } = await adminClient
      .from('companies')
      .insert({ name: companyName.trim() })
      .select('id')
      .single()

    if (companyError) throw companyError

    // Add the user as admin
    const { error: memberError } = await adminClient
      .from('company_members')
      .insert({
        company_id: company.id,
        user_id: user.id,
        role: 'admin',
      })

    if (memberError) throw memberError

    // Seed default company settings
    const defaultSettings = [
      { company_id: company.id, key: 'warehouse_counts', value: { openCellSets: 0, closedCellSets: 0 } },
      { company_id: company.id, key: 'lifetime_usage', value: { openCell: 0, closedCell: 0 } },
      { company_id: company.id, key: 'costs', value: { openCell: 0, closedCell: 0, laborRate: 0 } },
      { company_id: company.id, key: 'yields', value: { openCell: 0, closedCell: 0, openCellStrokes: 0, closedCellStrokes: 0 } },
      { company_id: company.id, key: 'pricingMode', value: 'level_pricing' },
      { company_id: company.id, key: 'sqFtRates', value: { wall: 0, roof: 0 } },
    ]

    await adminClient.from('company_settings').insert(defaultSettings)

    return new Response(
      JSON.stringify({ success: true, companyId: company.id }),
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
