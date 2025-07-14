import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    // Return Home Assistant discovery information
    const discovery = {
      manufacturer: "NetworkNest",
      model: "Network Dashboard",
      name: "NetworkNest Hub",
      sw_version: "1.0.0",
      hw_version: "1.0",
      identifiers: [`networknest_${config.user_id}`],
      connections: [["mac", "network_dashboard"]],
      configuration_url: `${req.url.split('/supabase')[0]}`,
      devices: [
        {
          identifiers: [`networknest_router_${config.user_id}`],
          name: "Network Router",
          model: "Router Monitor",
          manufacturer: "NetworkNest",
          suggested_area: "Network Room"
        },
        {
          identifiers: [`networknest_switch_${config.user_id}`],
          name: "Network Switch", 
          model: "Switch Monitor",
          manufacturer: "NetworkNest",
          suggested_area: "Network Room"
        }
      ],
      entities: [
        {
          unique_id: `networknest_bandwidth_${config.user_id}`,
          name: "Network Bandwidth",
          device_class: "data_rate",
          unit_of_measurement: "Mbps",
          icon: "mdi:speedometer",
          device: {
            identifiers: [`networknest_router_${config.user_id}`]
          }
        },
        {
          unique_id: `networknest_connected_devices_${config.user_id}`,
          name: "Connected Devices",
          icon: "mdi:devices",
          device: {
            identifiers: [`networknest_router_${config.user_id}`]
          }
        },
        {
          unique_id: `networknest_network_status_${config.user_id}`,
          name: "Network Status",
          device_class: "connectivity",
          icon: "mdi:network",
          device: {
            identifiers: [`networknest_router_${config.user_id}`]
          }
        },
        {
          unique_id: `networknest_uptime_${config.user_id}`,
          name: "Network Uptime",
          device_class: "duration",
          unit_of_measurement: "h",
          icon: "mdi:clock-outline",
          device: {
            identifiers: [`networknest_router_${config.user_id}`]
          }
        }
      ]
    }

    return new Response(
      JSON.stringify(discovery),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Discovery error:', error)
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