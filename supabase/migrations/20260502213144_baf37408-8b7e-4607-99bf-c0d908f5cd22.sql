ALTER TABLE public.tenant_protocol_landing
  ADD COLUMN IF NOT EXISTS quiz_uv_title text DEFAULT 'Com que frequência você sai no sol sem óculos escuros?',
  ADD COLUMN IF NOT EXISTS quiz_uv_subtitle text DEFAULT 'Os raios UV são um dos vilões silenciosos para a saúde da retina.',
  ADD COLUMN IF NOT EXISTS quiz_uv_options jsonb DEFAULT '[
    {"icon":"Glasses","title":"Raramente","description":"Sempre uso proteção"},
    {"icon":"Sun","title":"Às vezes","description":"Quando esqueço"},
    {"icon":"Sun","title":"Com frequência","description":"Na maioria das vezes"},
    {"icon":"AlertTriangle","title":"Quase sempre","description":"Sem proteção UV"}
  ]'::jsonb;