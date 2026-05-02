
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const adminClient = createClient(supabaseUrl, serviceKey);

const email = "tecnologia@advisorhouse.com.br";
const tenantId = "061e3893-6c8a-406a-a1b7-d1a1299971bc";

console.log(`Inviting ${email}...`);

const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
  data: {
    first_name: "Partner",
    last_name: "Lumyss",
    full_name: "Partner Lumyss",
    role: "partner",
    partner_level: 1,
    tenant_id: tenantId,
    tenant_slug: "lumyss", // adding slug to help branding detection
  },
  redirectTo: `https://lumyss.allvita.com.br/auth/set-password`
});

if (error) {
  console.error("Error:", error.message);
} else {
  console.log("Success! User invited:", data.user.id);
}
