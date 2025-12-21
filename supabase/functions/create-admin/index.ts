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
    
    // Require a setup token for admin creation (security measure)
    const setupToken = Deno.env.get('ADMIN_SETUP_TOKEN')
    const authHeader = req.headers.get('authorization')
    
    // Check if called with valid authorization
    if (setupToken) {
      const providedToken = req.headers.get('x-setup-token')
      if (providedToken !== setupToken) {
        console.log('Invalid or missing setup token')
        return new Response(
          JSON.stringify({ error: 'Forbidden: Invalid setup token', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    } else {
      // If no setup token configured, require existing admin authorization
      if (!authHeader) {
        console.log('No authorization header provided')
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Admin authorization required', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }
      
      // Verify the caller is an existing admin
      const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } }
      })
      
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
      if (authError || !user) {
        console.log('Auth error:', authError?.message)
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Invalid credentials', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }
      
      // Check if user is admin
      const { data: adminRole, error: roleError } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()
      
      if (roleError || !adminRole) {
        console.log('User is not an admin')
        return new Response(
          JSON.stringify({ error: 'Forbidden: Admin access required', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get credentials from request body or use secure defaults
    const body = await req.json().catch(() => ({}))
    const email = body.email || 'admin@ruptax.local'
    const password = body.password
    
    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Validate password strength
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create admin user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: body.fullName || 'Admin User'
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
