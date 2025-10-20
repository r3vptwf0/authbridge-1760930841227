import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'r3vptwf0',
    password: '123456',
    email_confirm: true
  })

  if (error) {
    console.error('Error creating user:', error)
    return
  }

  console.log('User created successfully:', data)
}

createUser()
