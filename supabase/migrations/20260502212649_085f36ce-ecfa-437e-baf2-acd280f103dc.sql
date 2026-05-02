ALTER TABLE public.tenant_protocol_landing
  ADD COLUMN IF NOT EXISTS quiz_supplements_title text DEFAULT 'Você já toma algum suplemento voltado para a saúde dos olhos?',
  ADD COLUMN IF NOT EXISTS quiz_supplements_subtitle text DEFAULT 'Alguns nutrientes ajudam a proteger a retina de forma ativa.',
  ADD COLUMN IF NOT EXISTS quiz_supplements_options jsonb DEFAULT '[
    {"icon":"Sparkles","title":"Sim, com astaxantina","description":"Excelente escolha"},
    {"icon":"Shield","title":"Sim, luteína ou zeaxantina","description":"Um bom começo"},
    {"icon":"Activity","title":"Outro suplemento","description":"Pode não ser suficiente"},
    {"icon":"AlertTriangle","title":"Não tomo nenhum","description":"Sem proteção ativa no momento"}
  ]'::jsonb;