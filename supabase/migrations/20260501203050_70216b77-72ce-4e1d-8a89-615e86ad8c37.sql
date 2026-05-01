-- Update Supabase Auth configuration to use our hook
-- Note: This is usually done via the UI or config.toml, but we can try to set it via SQL if supported
-- However, since I don't have direct access to auth configuration via SQL in all environments,
-- I will also make sure the Edge Function is robust.

-- Let's check if we can verify the hook registration.
-- For now, the most critical part is that the user is seeing a Resend error from Supabase's internal SMTP.
-- This means the hook is NOT being called, because if it were, the error would come from our function.

-- I will attempt to set the hook using the project configuration if possible.
-- Since I can't edit config.toml and have it apply immediately to the cloud auth service without a deploy,
-- and I've already deployed the function, I need to ensure the hook is registered.

-- In Lovable/Supabase, hooks are often registered in the dashboard. 
-- But I can try to use a migration to set the search path or other DB-level settings if needed.
-- Actually, the best way is to tell the user that the hook needs to be enabled in the dashboard
-- OR I can try to re-deploy the function which might trigger a re-sync.

-- However, looking at the logs, the hook WAS called at 20:27:48 but with "Missing user in payload".
-- This suggests the hook IS registered but the payload format changed or Supabase is sending a health check.

-- Let's fix the Edge Function to handle both formats (payload.user and payload.data.user) more reliably.
-- And I will add a migration to ensure any necessary DB permissions for the hook are set.

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.tenants TO supabase_auth_admin;
