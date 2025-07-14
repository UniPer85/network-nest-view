import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  console.log('Function called with method:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Processing request...')
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
        .maybeSingle()

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify(config || null),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      console.log('Processing POST request')
      // Create new Home Assistant configuration
      const body = await req.json()
      console.log('Request body:', body)
      
      // Generate new API key
      console.log('Generating API key...')
      const { data: apiKey, error: rpcError } = await supabaseClient.rpc('generate_ha_api_key')
      console.log('API key generation result:', { apiKey, rpcError })
      
      if (rpcError) {
        console.error('RPC error:', rpcError)
        throw rpcError
      }

      console.log('Inserting config into database...')
      const { data: config, error } = await supabaseClient
        .from('homeassistant_config')
        .insert({
          user_id: user.id,
          api_key: apiKey,
          ha_instance_name: body.ha_instance_name,
          ha_instance_url: body.ha_instance_url || null,
          enabled: body.enabled ?? true
        })
        .select()
        .single()

      console.log('Database insert result:', { config, error })

      if (error) {
        console.error('Database error:', error)
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
          ha_instance_url: body.ha_instance_url || null,
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