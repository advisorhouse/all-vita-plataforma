
-- Product categories (specialties)
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'package',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products table (multi-specialty)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  discount_percentage NUMERIC NOT NULL DEFAULT 25,
  discounted_price NUMERIC GENERATED ALWAYS AS (base_price * (1 - discount_percentage / 100)) STORED,
  subscription_months INTEGER NOT NULL DEFAULT 1,
  points_per_sale INTEGER NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partner-product hybrid binding (exclusive or shared)
CREATE TABLE public.partner_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  exclusive BOOLEAN NOT NULL DEFAULT false,
  custom_points_per_sale INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(partner_id, product_id)
);

-- RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_products ENABLE ROW LEVEL SECURITY;

-- product_categories: anyone can read, admins manage
CREATE POLICY "Anyone can view active categories" ON public.product_categories FOR SELECT USING (active = true);
CREATE POLICY "Admins manage categories" ON public.product_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- products: anyone can read active, admins manage
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- partner_products: partners see own, admins manage
CREATE POLICY "Partners view own bindings" ON public.partner_products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = partner_products.partner_id AND a.user_id = auth.uid())
);
CREATE POLICY "Admins manage partner products" ON public.partner_products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add product_id to quiz_submissions for multi-product support
ALTER TABLE public.quiz_submissions ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id);

-- Seed initial categories
INSERT INTO public.product_categories (name, slug, description, icon) VALUES
  ('Oftalmologia', 'oftalmologia', 'Produtos para saúde ocular e proteção visual', 'eye'),
  ('Dermatologia', 'dermatologia', 'Produtos para saúde e cuidado da pele', 'sparkles'),
  ('Nutrologia', 'nutrologia', 'Suplementos nutricionais e nutracêuticos', 'pill'),
  ('Ortopedia', 'ortopedia', 'Produtos para saúde articular e óssea', 'bone');

-- Seed Vision Lift products into Oftalmologia category
INSERT INTO public.products (category_id, name, description, short_description, base_price, subscription_months, points_per_sale)
SELECT pc.id, p.name, p.description, p.short_desc, p.price, p.months, p.points
FROM public.product_categories pc
CROSS JOIN (VALUES
  ('Vision Lift Original - 1 Mês', 'Suplemento ocular para proteção visual contínua', 'Tratamento mensal', 196.00, 1, 100),
  ('Vision Lift Original - 3 Meses', 'Kit trimestral de proteção visual', 'Tratamento trimestral', 396.00, 3, 350),
  ('Vision Lift Original - 5 Meses', 'Kit quinquenal de proteção visual', 'Tratamento de 5 meses', 528.00, 5, 650),
  ('Vision Lift Original - 10 Meses', 'Kit completo de proteção visual', 'Tratamento de 10 meses', 796.00, 10, 1500)
) AS p(name, description, short_desc, price, months, points)
WHERE pc.slug = 'oftalmologia';

-- Updated_at triggers
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
