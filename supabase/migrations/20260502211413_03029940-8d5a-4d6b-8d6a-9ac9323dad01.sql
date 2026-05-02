ALTER TABLE public.tenant_protocol_landing
  ADD COLUMN IF NOT EXISTS quiz_symptoms_title TEXT NOT NULL DEFAULT 'Você tem sentido algum desses incômodos nos olhos?',
  ADD COLUMN IF NOT EXISTS quiz_symptoms_subtitle TEXT NOT NULL DEFAULT 'Marque todos que se aplicam ao seu dia a dia — mesmo que pareçam leves.',
  ADD COLUMN IF NOT EXISTS quiz_symptoms_options JSONB NOT NULL DEFAULT '[
    {"icon":"Droplet","title":"Olhos secos ou ardendo","description":"Sensação de areia ou ressecamento"},
    {"icon":"Eye","title":"Visão embaçada às vezes","description":"Dificuldade de foco em algum momento"},
    {"icon":"Brain","title":"Dor de cabeça frequente","description":"Principalmente após uso de telas"},
    {"icon":"Sun","title":"Incômodo com luz forte","description":"Sensibilidade ao sair para a claridade"}
  ]'::jsonb;