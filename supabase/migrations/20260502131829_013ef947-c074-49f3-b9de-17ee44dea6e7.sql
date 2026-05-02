INSERT INTO public.partners (user_id, tenant_id, level, active, referral_code)
SELECT '5d79cfb3-d4ec-4199-ad50-34489e67d3d8', '6a1818ae-5225-4a38-8f95-6c254dec0580', '1', true, 'TIAGO_LUMYSS_1'
ON CONFLICT (user_id, tenant_id) DO UPDATE SET level = '1';