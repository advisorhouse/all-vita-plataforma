
ALTER TABLE public.tenant_protocol_landing
  ADD COLUMN IF NOT EXISTS result_title text DEFAULT 'Seu Nível de Proteção Macular',
  ADD COLUMN IF NOT EXISTS result_subtitle text DEFAULT 'Baseado nas suas respostas, calculamos seu score de proteção visual',
  ADD COLUMN IF NOT EXISTS result_levels jsonb DEFAULT '[
    {"max": 40, "label": "Nível de risco: Alto", "color": "#D9534F", "message": "Sua proteção atual está abaixo do recomendado. É essencial iniciar um protocolo estruturado para fortalecer a barreira de proteção da retina."},
    {"max": 70, "label": "Nível de risco: Moderado", "color": "#D97757", "message": "Você tem uma proteção parcial, mas existem lacunas importantes que merecem atenção. A exposição digital diária cria um desgaste cumulativo que sua proteção atual pode não cobrir totalmente.\n\nCom um protocolo baseado em astaxantina + luteína + zeaxantina, é possível fortalecer significativamente sua barreira de proteção macular."},
    {"max": 100, "label": "Nível de risco: Baixo", "color": "#5CB85C", "message": "Excelente! Sua proteção atual está em bom nível. Manter um protocolo de suporte ajuda a preservar a saúde da retina ao longo do tempo."}
  ]'::jsonb,
  ADD COLUMN IF NOT EXISTS result_product_eyebrow text DEFAULT 'PROTOCOLO RECOMENDADO',
  ADD COLUMN IF NOT EXISTS result_product_name text DEFAULT 'Retina Shield System™',
  ADD COLUMN IF NOT EXISTS result_product_powered_by text DEFAULT 'powered by CAROTENOID CORE™',
  ADD COLUMN IF NOT EXISTS result_cta_label text DEFAULT 'Conhecer o protocolo',
  ADD COLUMN IF NOT EXISTS result_cta_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS result_disclaimer text DEFAULT 'Este diagnóstico é uma ferramenta de triagem e não substitui uma consulta oftalmológica profissional. Recomendamos acompanhamento regular com um especialista.',
  ADD COLUMN IF NOT EXISTS score_weights jsonb DEFAULT '{
    "screenTime": [80, 60, 35, 15],
    "symptoms":   [70, 60, 60, 65],
    "ageRange":   [85, 70, 55, 40],
    "lastVisit":  [90, 65, 35, 25],
    "supplements":[90, 70, 45, 20],
    "uvExposure": [90, 65, 40, 20]
  }'::jsonb;
