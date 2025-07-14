import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  console.log('=== FUNCTION CALLED ===')
  console.log('Method:', req.method)
  console.log('Headers:', Object.fromEntries(req.headers))
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request - returning CORS headers')
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method === 'POST') {
    console.log('POST request received')
    try {
      const body = await req.json()
      console.log('Body:', body)
      
      return new Response(
        JSON.stringify({ 
          message: 'Test POST successful',
          receivedData: body,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (error) {
      console.error('POST error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  }

  return new Response(
    JSON.stringify({ message: 'Method not implemented yet' }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
})