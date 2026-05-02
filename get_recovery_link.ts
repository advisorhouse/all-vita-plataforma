import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const email = 'tecnologia@advisorhouse.com.br'
const { data, error } = await supabase.auth.admin.generateLink({
  type: 'recovery',
  email: email,
  options: {
    redirectTo: 'https://lumyss.allvita.com.br/auth/login'
  }
})

if (error) {
  console.error(error)
  process.exit(1)
}

console.log('LINK_START:' + data.properties.action_link + ':LINK_END')
