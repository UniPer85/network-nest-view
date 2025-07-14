import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  console.log('=== Function called ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Test response first
    if (req.method === 'POST') {
      console.log('=== POST request received ===')
      
      const body = await req.json()
      console.log('Body received:', JSON.stringify(body))
      
      // Simple test response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Test response working',
          received: body
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.log('No auth header found')
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    console.log('User authenticated:', !!user)
    console.log('Auth error:', authError)

    if (authError || !user) {
      console.log('Authentication failed')
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      console.log('Handling GET request')
      const { data: config, error } = await supabaseClient
        .from('homeassistant_config')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.log('GET error:', error)
        throw error
      }

      return new Response(
        JSON.stringify(config || null),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT') {
      console.log('Handling PUT request')
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
        console.error('PUT error:', error)
        throw error
      }

      return new Response(
        JSON.stringify(config),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'DELETE') {
      console.log('Handling DELETE request')
      const { error } = await supabaseClient
        .from('homeassistant_config')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('DELETE error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Method not allowed:', req.method)
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== Function error ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        type: error.constructor.name
      }),
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