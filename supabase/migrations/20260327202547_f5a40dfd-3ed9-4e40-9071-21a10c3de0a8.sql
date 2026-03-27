-- Add foreign keys only where they don't already exist
-- Using DO blocks to check existence first

DO $$
BEGIN
  -- orders
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_client_id_fkey') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_product_id_fkey') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_tenant_id_fkey') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- commissions
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_affiliate_id_fkey') THEN
    ALTER TABLE public.commissions ADD CONSTRAINT commissions_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_client_id_fkey') THEN
    ALTER TABLE public.commissions ADD CONSTRAINT commissions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_order_id_fkey') THEN
    ALTER TABLE public.commissions ADD CONSTRAINT commissions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_tenant_id_fkey') THEN
    ALTER TABLE public.commissions ADD CONSTRAINT commissions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- affiliate_links
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_links_partner_id_fkey') THEN
    ALTER TABLE public.affiliate_links ADD CONSTRAINT affiliate_links_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_links_tenant_id_fkey') THEN
    ALTER TABLE public.affiliate_links ADD CONSTRAINT affiliate_links_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- clicks
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clicks_link_id_fkey') THEN
    ALTER TABLE public.clicks ADD CONSTRAINT clicks_link_id_fkey FOREIGN KEY (link_id) REFERENCES public.affiliate_links(id) ON DELETE CASCADE;
  END IF;

  -- conversions
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversions_partner_id_fkey') THEN
    ALTER TABLE public.conversions ADD CONSTRAINT conversions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversions_link_id_fkey') THEN
    ALTER TABLE public.conversions ADD CONSTRAINT conversions_link_id_fkey FOREIGN KEY (link_id) REFERENCES public.affiliate_links(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversions_tenant_id_fkey') THEN
    ALTER TABLE public.conversions ADD CONSTRAINT conversions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- partners
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partners_tenant_id_fkey') THEN
    ALTER TABLE public.partners ADD CONSTRAINT partners_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partners_parent_partner_id_fkey') THEN
    ALTER TABLE public.partners ADD CONSTRAINT partners_parent_partner_id_fkey FOREIGN KEY (parent_partner_id) REFERENCES public.partners(id) ON DELETE SET NULL;
  END IF;

  -- clients
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_tenant_id_fkey') THEN
    ALTER TABLE public.clients ADD CONSTRAINT clients_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- subscriptions
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_client_id_fkey') THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_product_id_fkey') THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_tenant_id_fkey') THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- referrals
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_partner_id_fkey') THEN
    ALTER TABLE public.referrals ADD CONSTRAINT referrals_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_client_id_fkey') THEN
    ALTER TABLE public.referrals ADD CONSTRAINT referrals_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_source_link_id_fkey') THEN
    ALTER TABLE public.referrals ADD CONSTRAINT referrals_source_link_id_fkey FOREIGN KEY (source_link_id) REFERENCES public.affiliate_links(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_tenant_id_fkey') THEN
    ALTER TABLE public.referrals ADD CONSTRAINT referrals_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- mt_commissions
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mt_commissions_partner_id_fkey') THEN
    ALTER TABLE public.mt_commissions ADD CONSTRAINT mt_commissions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mt_commissions_tenant_id_fkey') THEN
    ALTER TABLE public.mt_commissions ADD CONSTRAINT mt_commissions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- products
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_tenant_id_fkey') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- notifications
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_tenant_id_fkey') THEN
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- content
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_tenant_id_fkey') THEN
    ALTER TABLE public.content ADD CONSTRAINT content_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- courses
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_tenant_id_fkey') THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- lessons
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lessons_course_id_fkey') THEN
    ALTER TABLE public.lessons ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;

  -- gamification
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gamification_tenant_id_fkey') THEN
    ALTER TABLE public.gamification ADD CONSTRAINT gamification_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- levels
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'levels_tenant_id_fkey') THEN
    ALTER TABLE public.levels ADD CONSTRAINT levels_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- rankings
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rankings_tenant_id_fkey') THEN
    ALTER TABLE public.rankings ADD CONSTRAINT rankings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- rewards
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rewards_tenant_id_fkey') THEN
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- rewards_catalog
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rewards_catalog_tenant_id_fkey') THEN
    ALTER TABLE public.rewards_catalog ADD CONSTRAINT rewards_catalog_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- redemption_requests
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'redemption_requests_tenant_id_fkey') THEN
    ALTER TABLE public.redemption_requests ADD CONSTRAINT redemption_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'redemption_catalog_fk') THEN
    ALTER TABLE public.redemption_requests ADD CONSTRAINT redemption_catalog_fk FOREIGN KEY (catalog_item_id) REFERENCES public.rewards_catalog(id) ON DELETE SET NULL;
  END IF;

  -- commission_rules
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commission_rules_tenant_id_fkey') THEN
    ALTER TABLE public.commission_rules ADD CONSTRAINT commission_rules_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- commission_to_coin_rules
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commission_to_coin_rules_tenant_id_fkey') THEN
    ALTER TABLE public.commission_to_coin_rules ADD CONSTRAINT commission_to_coin_rules_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- assets
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assets_tenant_id_fkey') THEN
    ALTER TABLE public.assets ADD CONSTRAINT assets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- integrations
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'integrations_tenant_id_fkey') THEN
    ALTER TABLE public.integrations ADD CONSTRAINT integrations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- payment_integrations
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_integrations_tenant_id_fkey') THEN
    ALTER TABLE public.payment_integrations ADD CONSTRAINT payment_integrations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- access_logs
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'access_logs_tenant_id_fkey') THEN
    ALTER TABLE public.access_logs ADD CONSTRAINT access_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
  END IF;

  -- audit_logs
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_tenant_id_fkey') THEN
    ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
  END IF;

  -- memberships
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memberships_tenant_id_fkey') THEN
    ALTER TABLE public.memberships ADD CONSTRAINT memberships_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- staff
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_tenant_id_fkey') THEN
    ALTER TABLE public.staff ADD CONSTRAINT staff_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- tenant_staff
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenant_staff_tenant_id_fkey') THEN
    ALTER TABLE public.tenant_staff ADD CONSTRAINT tenant_staff_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- tenant_addresses
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenant_addresses_tenant_id_fkey') THEN
    ALTER TABLE public.tenant_addresses ADD CONSTRAINT tenant_addresses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- tenant_owners
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenant_owners_tenant_id_fkey') THEN
    ALTER TABLE public.tenant_owners ADD CONSTRAINT tenant_owners_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- quiz_responses
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_responses_partner_id_fkey') THEN
    ALTER TABLE public.quiz_responses ADD CONSTRAINT quiz_responses_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_responses_submission_id_fkey') THEN
    ALTER TABLE public.quiz_responses ADD CONSTRAINT quiz_responses_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.quiz_submissions(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_responses_tenant_id_fkey') THEN
    ALTER TABLE public.quiz_responses ADD CONSTRAINT quiz_responses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
  END IF;

  -- quiz_submissions
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_submissions_tenant_id_fkey') THEN
    ALTER TABLE public.quiz_submissions ADD CONSTRAINT quiz_submissions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
  END IF;
END $$;