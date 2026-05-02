INSERT INTO public.tenant_protocol_landing (
  tenant_id, 
  active, 
  hero_image_url, 
  hero_badge, 
  hero_title, 
  hero_subtitle, 
  why_paragraph_1, 
  why_paragraph_2, 
  logic_description, 
  cta_description
) VALUES (
  '6a1818ae-5225-4a38-8f95-6c254dec0580', 
  true, 
  'https://images.unsplash.com/photo-1576091160550-2173bdb999ef?auto=format&fit=crop&q=80&w=2070',
  'Continuação do seu atendimento',
  'Seu médico já iniciou o cuidado com a sua saúde',
  'Agora é hora de dar continuidade ao cuidado iniciado em consulta. Vamos identificar o protocolo mais adequado para você.',
  'Após o atendimento clínico, muitos pacientes são orientados a manter um cuidado contínuo para preservar os resultados ao longo do tempo.',
  'Esta página foi desenvolvida justamente para facilitar esse próximo passo, conectando o cuidado da consulta com a proteção de longo prazo que você precisa.',
  'O protocolo foi estruturado para atuar de forma progressiva, apoiando sua saúde ao longo do tempo. Seus benefícios estão diretamente ligados à consistência do uso.',
  'Responda algumas perguntas rápidas sobre seu perfil e descubra o plano mais adequado para dar continuidade ao cuidado iniciado na sua consulta.'
) ON CONFLICT (tenant_id) DO UPDATE SET 
  hero_image_url = EXCLUDED.hero_image_url,
  active = true;