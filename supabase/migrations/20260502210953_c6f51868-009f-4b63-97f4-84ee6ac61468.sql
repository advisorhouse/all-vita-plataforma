-- Add configurable quiz intro screen (header + first question) to tenant_protocol_landing
ALTER TABLE public.tenant_protocol_landing
  ADD COLUMN IF NOT EXISTS quiz_header_title TEXT NOT NULL DEFAULT 'Dr. {doctor} recomendou esta avaliação',
  ADD COLUMN IF NOT EXISTS quiz_header_subtitle TEXT NOT NULL DEFAULT 'Complete este diagnóstico complementar para que seu protocolo de proteção seja personalizado ao seu perfil clínico',
  ADD COLUMN IF NOT EXISTS quiz_question_title TEXT NOT NULL DEFAULT 'Vamos começar pelo dia a dia — quanto tempo você passa olhando para telas?',
  ADD COLUMN IF NOT EXISTS quiz_question_subtitle TEXT NOT NULL DEFAULT 'Pode ser computador, celular, tablet ou TV. Soma tudo, sem culpa.',
  ADD COLUMN IF NOT EXISTS quiz_question_options JSONB NOT NULL DEFAULT '[
    {"icon":"Smartphone","title":"Menos de 4h","description":"Uso tranquilo"},
    {"icon":"Monitor","title":"4 a 8 horas","description":"Bastante comum hoje em dia"},
    {"icon":"Tv","title":"8 a 12 horas","description":"Rotina intensa"},
    {"icon":"AlertTriangle","title":"Mais de 12h","description":"Seus olhos merecem atenção extra"}
  ]'::jsonb,
  ADD COLUMN IF NOT EXISTS quiz_footer_badges JSONB NOT NULL DEFAULT '["Dados criptografados","LGPD compliant","Validado por oftalmologistas"]'::jsonb;