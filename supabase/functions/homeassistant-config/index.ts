import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

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
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.log('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted (first 20 chars):', token.substring(0, 20))
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    console.log('Auth result:', { user: user?.id, error: authError })

    if (authError || !user) {
      console.log('Authentication failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated successfully:', user.id)

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
      let body;
      try {
        body = await req.json();
        console.log('Request body:', body);
      } catch (bodyError) {
        console.error('Error parsing request body:', bodyError);
        return new Response(
          JSON.stringify({ error: 'Invalid request body', details: bodyError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate required fields
      if (!body.ha_instance_name) {
        console.error('Missing required field: ha_instance_name');
        return new Response(
          JSON.stringify({ error: 'Missing required field: ha_instance_name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Generate new API key
      console.log('Generating API key...');
      let apiKey;
      try {
        const { data, error: rpcError } = await supabaseClient.rpc('generate_ha_api_key');
        console.log('API key generation result:', { data, error: rpcError });
        
        if (rpcError) {
          console.error('RPC error:', rpcError);
          throw rpcError;
        }
        
        apiKey = data;
        console.log('Generated API key:', apiKey);
      } catch (rpcError) {
        console.error('Failed to generate API key:', rpcError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate API key', details: rpcError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert config into database
      console.log('Inserting config into database...');
      console.log('User ID:', user.id);
      console.log('Data to insert:', {
        user_id: user.id,
        api_key: apiKey,
        ha_instance_name: body.ha_instance_name,
        ha_instance_url: body.ha_instance_url || null,
        enabled: body.enabled ?? true
      });
      
      try {
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
          .single();

        console.log('Database insert result:', { config, error });

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        console.log('Successfully created config:', config);
        return new Response(
          JSON.stringify(config),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (dbError) {
        console.error('Database insertion failed:', dbError);
        return new Response(
          JSON.stringify({ error: 'Database insertion failed', details: dbError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        details: error.toString()
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