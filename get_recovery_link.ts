import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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
  Deno.exit(1)
}

console.log(data.properties.action_link)
