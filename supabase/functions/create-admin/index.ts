import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create admin user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@ruptax.local',
      password: '21452145',
      email_confirm: true,
      user_metadata: {
        full_name: 'Roopsiangbhai Jamod'
      }
    })

    if (createError) {
      // If user already exists, try to get them
      if (createError.message.includes('already') || createError.message.includes('exists')) {
        return new Response(
          JSON.stringify({ message: 'Admin user already exists', success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw createError
    }

    // Add admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ 
        user_id: userData.user.id, 
        role: 'admin' 
      }, { 
        onConflict: 'user_id,role' 
      })

    if (roleError) {
      console.error('Role error:', roleError)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created successfully',
        success: true,
        userId: userData.user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})