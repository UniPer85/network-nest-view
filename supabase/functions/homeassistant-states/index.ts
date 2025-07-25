import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Check if user has performed a network scan, otherwise use demo data
const getNetworkData = async (userId: string, supabaseClient: any) => {
  const now = new Date()
  const baseUptime = 168 // 7 days in hours
  const randomVariation = Math.random() * 0.1 - 0.05 // ±5% variation
  
  // Try to get scanned devices first (we'll implement device storage later)
  // For now, check if we have non-demo monitoring data
  const { data: realDevices } = await supabaseClient
    .from('monitoring_history')
    .select('item_id, item_name')
    .eq('user_id', userId)
    .not('item_id', 'in', `(device_1,device_2,device_3,device_4,device_5,device_6,device_7,device_8)`)
    .limit(10)
  
  let devices = []
  
  if (realDevices && realDevices.length > 0) {
    // Use real scanned devices
    const deviceTypes = ['Computer', 'Mobile', 'Smart TV', 'Gaming', 'Tablet', 'IoT Device', 'Router', 'Smart Speaker']
    devices = realDevices.map((device, i) => ({
      id: device.item_id,
      name: device.item_name,
      type: deviceTypes[i % deviceTypes.length],
      ip: `192.168.1.${100 + i}`,
      status: Math.random() > 0.2 ? 'online' : 'offline',
      bandwidth: `${Math.round((Math.random() * 50 + 10) * 100) / 100} MB/s`
    }))
  } else {
    // Fall back to demo data
    const deviceNames = [
      'Living Room TV', 'John\'s iPhone', 'Sarah\'s Laptop', 'Gaming Console',
      'Smart Thermostat', 'Kitchen Tablet', 'Security Camera', 'Home Router'
    ]
    const deviceTypes = ['Computer', 'Mobile', 'Smart TV', 'Gaming', 'Tablet', 'IoT Device', 'Router', 'Smart Speaker']
    
    devices = Array.from({ length: 8 }, (_, i) => ({
      id: `device_${i + 1}`,
      name: deviceNames[i] || `Device ${i + 1}`,
      type: deviceTypes[i % deviceTypes.length],
      ip: `192.168.1.${100 + i}`,
      status: Math.random() > 0.2 ? 'online' : 'offline',
      bandwidth: `${Math.round((Math.random() * 50 + 10) * 100) / 100} MB/s`
    }))
  }
  
  return {
    bandwidth: Math.round((100 + (Math.random() * 50)) * 100) / 100,
    connected_devices: devices.filter(d => d.status === 'online').length,
    devices: devices,
    network_status: Math.random() > 0.1 ? "online" : "offline",
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
    // Use service role key for API key validation to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
    console.log('Validating API key:', apiKey?.substring(0, 10) + '...')
    
    const { data: config, error: configError } = await supabaseClient
      .from('homeassistant_config')
      .select('user_id, enabled')
      .eq('api_key', apiKey)
      .eq('enabled', true)
      .maybeSingle()

    console.log('Config query result:', { config, configError })

    if (configError) {
      console.error('Config query error:', configError)
      return new Response(
        JSON.stringify({ error: 'Database error', details: configError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!config) {
      console.log('No config found for API key')
      return new Response(
        JSON.stringify({ error: 'Invalid API key. Please check your API key and try again.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('API key validated successfully for user:', config.user_id)

    // Get current network data (real or demo)
    const networkData = await getNetworkData(config.user_id, supabaseClient)
    
    // Return data format for Home Assistant with individual device info
    const response = {
      bandwidth: networkData.bandwidth,
      bandwidth_down: networkData.bandwidth * 0.8, // Simulate download speed
      bandwidth_up: networkData.bandwidth * 0.2,   // Simulate upload speed
      connected_devices: networkData.connected_devices,
      devices: networkData.devices,
      network_status: networkData.network_status,
      uptime: networkData.uptime,
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