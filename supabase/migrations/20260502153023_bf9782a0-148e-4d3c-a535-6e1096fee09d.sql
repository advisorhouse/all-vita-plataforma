
-- 1) Garantir índice único por tenant + referral_code
CREATE UNIQUE INDEX IF NOT EXISTS partners_tenant_referral_code_uniq
  ON public.partners (tenant_id, referral_code)
  WHERE referral_code IS NOT NULL;

-- 2) Função para gerar referral_code: SLUG-XXXXXX
CREATE OR REPLACE FUNCTION public.generate_partner_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slug text;
  v_suffix text;
  v_code text;
  v_attempts int := 0;
BEGIN
  IF NEW.referral_code IS NOT NULL AND length(NEW.referral_code) > 0 THEN
    RETURN NEW;
  END IF;

  SELECT upper(regexp_replace(coalesce(slug, 'PRT'), '[^a-zA-Z0-9]', '', 'g'))
    INTO v_slug
  FROM public.tenants
  WHERE id = NEW.tenant_id;

  IF v_slug IS NULL OR length(v_slug) = 0 THEN
    v_slug := 'PRT';
  END IF;

  v_slug := substr(v_slug, 1, 6);

  LOOP
    v_suffix := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    v_code := v_slug || '-' || v_suffix;

    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.partners
      WHERE tenant_id = NEW.tenant_id AND referral_code = v_code
    );

    v_attempts := v_attempts + 1;
    IF v_attempts > 10 THEN
      v_code := v_slug || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
      EXIT;
    END IF;
  END LOOP;

  NEW.referral_code := v_code;
  RETURN NEW;
END;
$$;

-- 3) Trigger BEFORE INSERT
DROP TRIGGER IF EXISTS trg_generate_partner_referral_code ON public.partners;
CREATE TRIGGER trg_generate_partner_referral_code
  BEFORE INSERT ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_partner_referral_code();

-- 4) Backfill de partners existentes sem código (ou com código vazio)
DO $$
DECLARE
  r RECORD;
  v_slug text;
  v_suffix text;
  v_code text;
  v_attempts int;
BEGIN
  FOR r IN
    SELECT p.id, p.tenant_id, t.slug
    FROM public.partners p
    LEFT JOIN public.tenants t ON t.id = p.tenant_id
    WHERE p.referral_code IS NULL OR length(p.referral_code) = 0
  LOOP
    v_slug := upper(regexp_replace(coalesce(r.slug, 'PRT'), '[^a-zA-Z0-9]', '', 'g'));
    IF v_slug IS NULL OR length(v_slug) = 0 THEN
      v_slug := 'PRT';
    END IF;
    v_slug := substr(v_slug, 1, 6);

    v_attempts := 0;
    LOOP
      v_suffix := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
      v_code := v_slug || '-' || v_suffix;
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.partners WHERE tenant_id = r.tenant_id AND referral_code = v_code
      );
      v_attempts := v_attempts + 1;
      IF v_attempts > 10 THEN
        v_code := v_slug || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
        EXIT;
      END IF;
    END LOOP;

    UPDATE public.partners SET referral_code = v_code WHERE id = r.id;
  END LOOP;
END $$;

-- 5) RPC pública resolve_referral — retorna info mínima para landing page
CREATE OR REPLACE FUNCTION public.resolve_referral(
  _code text,
  _tenant_id uuid DEFAULT NULL
)
RETURNS TABLE (
  partner_id uuid,
  tenant_id uuid,
  partner_name text,
  partner_avatar text,
  partner_level text,
  active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS partner_id,
    p.tenant_id,
    coalesce(
      nullif(trim(coalesce(pr.first_name, '') || ' ' || coalesce(pr.last_name, '')), ''),
      pr.email,
      'Parceiro'
    ) AS partner_name,
    pr.avatar_url AS partner_avatar,
    p.level AS partner_level,
    p.active
  FROM public.partners p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.referral_code = upper(_code)
    AND (_tenant_id IS NULL OR p.tenant_id = _tenant_id)
    AND p.active = true
  LIMIT 1;
$$;

-- Permitir chamada anônima (landing pública precisa)
GRANT EXECUTE ON FUNCTION public.resolve_referral(text, uuid) TO anon, authenticated;

-- 6) RPC attribute_sale — chamada pelo webhook após pedido criado
CREATE OR REPLACE FUNCTION public.attribute_sale(
  _order_id uuid,
  _referral_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_partner RECORD;
  v_client RECORD;
  v_referral_id uuid;
BEGIN
  -- Buscar pedido
  SELECT * INTO v_order FROM public.orders WHERE id = _order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'order_not_found');
  END IF;

  -- Buscar partner pelo código (precisa ser do mesmo tenant)
  SELECT * INTO v_partner
  FROM public.partners
  WHERE referral_code = upper(_referral_code)
    AND tenant_id = v_order.tenant_id
    AND active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'partner_not_found');
  END IF;

  -- Buscar cliente
  SELECT * INTO v_client FROM public.clients WHERE id = v_order.client_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'client_not_found');
  END IF;

  -- Anti-fraude: self-referral
  IF v_partner.user_id = v_client.user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'self_referral_blocked');
  END IF;

  -- Cria/atualiza referral (idempotente por client+partner)
  INSERT INTO public.referrals (client_id, partner_id, tenant_id, attribution_type, status)
  VALUES (v_client.id, v_partner.id, v_order.tenant_id, 'direct', 'attributed')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_referral_id;

  -- Cria conversion
  INSERT INTO public.conversions (partner_id, tenant_id, transaction_id, attributed_at, metadata)
  VALUES (
    v_partner.id,
    v_order.tenant_id,
    _order_id,
    now(),
    jsonb_build_object('referral_code', upper(_referral_code), 'order_amount', v_order.amount)
  );

  RETURN jsonb_build_object(
    'success', true,
    'partner_id', v_partner.id,
    'tenant_id', v_order.tenant_id,
    'order_id', _order_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.attribute_sale(uuid, text) TO authenticated;

-- 7) Índice auxiliar para lookup rápido de partner por user_id
CREATE INDEX IF NOT EXISTS partners_user_tenant_idx
  ON public.partners (user_id, tenant_id)
  WHERE active = true;
