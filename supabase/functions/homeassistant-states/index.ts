import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Mock network data - in production, this would come from actual network monitoring
const generateNetworkData = (userId: string) => {
  const now = new Date()
  const baseUptime = 168 // 7 days in hours
  const randomVariation = Math.random() * 0.1 - 0.05 // ±5% variation
  
  return {
    bandwidth: Math.round((100 + (Math.random() * 50)) * 100) / 100, // 100-150 Mbps
    connected_devices: Math.floor(8 + Math.random() * 8), // 8-16 devices
    network_status: Math.random() > 0.1 ? "online" : "offline", // 90% uptime
    uptime: Math.round((baseUptime + (baseUptime * randomVariation)) * 100) / 100,
    last_updated: now.toISOString()
  }
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

    // Extract API key from headers
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate API key and get user
    const { data: config, error: configError } = await supabaseClient
      .from('homeassistant_config')
      .select('user_id, enabled')
      .eq('api_key', apiKey)
      .eq('enabled', true)
      .single()

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate current network data
    const networkData = generateNetworkData(config.user_id)
    
    // Return simplified data format for Home Assistant REST sensor
    const response = {
      bandwidth_down: networkData.bandwidth * 0.8, // Simulate download speed
      bandwidth_up: networkData.bandwidth * 0.2,   // Simulate upload speed
      connected_devices: networkData.connected_devices,
      status: networkData.network_status,
      uptime_hours: networkData.uptime,
      last_updated: networkData.last_updated
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('States error:', error)
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