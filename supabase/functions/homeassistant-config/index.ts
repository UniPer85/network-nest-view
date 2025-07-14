import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Get existing Home Assistant configuration
      const { data: config, error } = await supabaseClient
        .from('homeassistant_config')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return new Response(
        JSON.stringify(config || null),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      // Create new Home Assistant configuration
      const body = await req.json()
      
      // Generate new API key
      const { data: apiKey, error: rpcError } = await supabaseClient.rpc('generate_ha_api_key')
      
      if (rpcError) {
        throw rpcError
      }

      const { data: config, error } = await supabaseClient
        .from('homeassistant_config')
        .insert({
          user_id: user.id,
          api_key: apiKey,
          ha_instance_name: body.ha_instance_name,
          ha_instance_url: body.ha_instance_url,
          enabled: body.enabled
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify(config),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT') {
      // Update Home Assistant configuration
      const body = await req.json()
      
      const { data: config, error } = await supabaseClient
        .from('homeassistant_config')
        .update({
          ha_instance_name: body.ha_instance_name,
          ha_instance_url: body.ha_instance_url,
          enabled: body.enabled
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify(config),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'DELETE') {
      // Delete Home Assistant configuration
      const { error } = await supabaseClient
        .from('homeassistant_config')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Config error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})