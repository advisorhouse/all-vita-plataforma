ALTER TABLE public.tenant_protocol_landing
  ADD COLUMN IF NOT EXISTS quiz_age_title text DEFAULT 'Qual é a sua faixa etária?',
  ADD COLUMN IF NOT EXISTS quiz_age_subtitle text DEFAULT 'A proteção natural da retina muda com o tempo — e isso faz parte do processo.',
  ADD COLUMN IF NOT EXISTS quiz_age_options jsonb DEFAULT '[
    {"icon":"Zap","title":"18 a 30 anos","description":"Proteção natural ainda alta"},
    {"icon":"Activity","title":"31 a 45 anos","description":"Começa a reduzir gradualmente"},
    {"icon":"Heart","title":"46 a 60 anos","description":"Momento importante de cuidar"},
    {"icon":"ShieldCheck","title":"Acima de 60","description":"Proteção ativa é essencial"}
  ]'::jsonb;