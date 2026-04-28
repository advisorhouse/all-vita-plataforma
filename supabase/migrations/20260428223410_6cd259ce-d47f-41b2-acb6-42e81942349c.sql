-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "System settings are viewable by everyone" 
ON public.system_settings FOR SELECT 
USING (true);

-- To allow updates, we need to check if the user is a super_admin in all_vita_staff
CREATE POLICY "Only super_admins can update system settings" 
ON public.system_settings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.all_vita_staff 
        WHERE user_id = auth.uid() 
        AND role = 'super_admin'
    )
);

-- Insert default values if they don't exist
INSERT INTO public.system_settings (key, value)
VALUES 
('platform_branding', '{
    "name": "All Vita",
    "url": "https://allvita.com.br",
    "email": "contato@allvita.com.br",
    "phone": "+55 11 99999-0000",
    "logo_url": "/logo-allvita.png",
    "isotipo_url": "/icon-allvita.png",
    "favicon_url": "/favicon.ico",
    "primary_color": "#1A1A1A",
    "secondary_color": "#6B8E23",
    "highlight_color": "#3B82F6",
    "typography": "inter",
    "footer_text": "Easymore Labs, uma empresa Advisor Legacy Ltda. Todos os direitos reservados."
}'::jsonb),
('security_settings', '{
    "require_2fa_super_admin": true,
    "require_2fa_tenant_admin": false,
    "allow_multiple_logins": true,
    "session_expiration_hours": 24,
    "login_attempts_before_lock": 5,
    "lockout_duration_minutes": 30,
    "password_strength": "strong"
}'::jsonb),
('tenant_defaults', '{
    "initial_commission_percent": 10,
    "recurring_commission_percent": 5,
    "default_partner_levels": 4,
    "vitacoin_multiplier": 1.0,
    "enable_gamification_by_default": true,
    "enable_vitacoins_by_default": true,
    "allow_custom_branding": true,
    "show_powered_by": false,
    "allow_custom_domain": true
}'::jsonb),
('domain_settings', '{
    "base_domain": "allvita.com.br",
    "tenant_subdomain_pattern": "{slug}.allvita.com.br",
    "auto_generate_subdomain": true,
    "validate_unique_slug": true,
    "auto_ssl": true,
    "reserved_slugs": ["admin", "api", "app", "auth", "www", "mail", "static", "cdn", "docs", "help", "support"]
}'::jsonb),
('advanced_settings', '{
    "debug_mode": false,
    "feature_multilevel_v2": true,
    "feature_bi_analytics_api": true,
    "feature_retention_engine": false,
    "feature_public_quiz": true,
    "feature_reward_catalog": true,
    "api_rate_limit": 60,
    "edge_function_timeout": 30,
    "custom_env_vars": {}
}'::jsonb)
ON CONFLICT (key) DO NOTHING;
