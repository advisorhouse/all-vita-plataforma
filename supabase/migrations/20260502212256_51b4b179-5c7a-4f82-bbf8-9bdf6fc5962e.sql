ALTER TABLE public.tenant_protocol_landing
  ADD COLUMN IF NOT EXISTS quiz_lastvisit_title text DEFAULT 'Faz quanto tempo que você foi ao oftalmologista pela última vez?',
  ADD COLUMN IF NOT EXISTS quiz_lastvisit_subtitle text DEFAULT 'Sem julgamento — o importante é começar a cuidar a partir de agora.',
  ADD COLUMN IF NOT EXISTS quiz_lastvisit_options jsonb DEFAULT '[
    {"icon":"Check","title":"Menos de 1 ano","description":"Ótimo, continue assim!"},
    {"icon":"Clock","title":"1 a 2 anos","description":"Talvez seja hora de agendar"},
    {"icon":"AlertTriangle","title":"Mais de 2 anos","description":"Vale a pena remarcar"},
    {"icon":"AlertTriangle","title":"Não lembro","description":"Acontece — mas vamos resolver"}
  ]'::jsonb;