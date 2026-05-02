UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "partner", "partner_level": 1, "source": "partner_onboarding", "tenant_id": "6a1818ae-5225-4a38-8f95-6c254dec0580", "tenant_slug": "lumyss"}'::jsonb
WHERE email = 'tecnologia@advisorhouse.com.br';