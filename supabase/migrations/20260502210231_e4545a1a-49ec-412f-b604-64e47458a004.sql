
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.tenant_protocol_landing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  hero_badge text DEFAULT 'Continuação do seu atendimento',
  hero_title text DEFAULT 'Seu médico já iniciou o cuidado com a sua saúde',
  hero_subtitle text DEFAULT 'Agora é hora de dar continuidade ao cuidado iniciado em consulta. Vamos identificar o protocolo mais adequado para você.',
  hero_cta_label text DEFAULT 'Iniciar minha avaliação',
  hero_meta text DEFAULT 'Menos de 2 minutos • Recomendado pelo seu médico',
  hero_image_url text,
  why_eyebrow text DEFAULT 'POR QUE VOCÊ ESTÁ VENDO ESTA PÁGINA',
  why_title text DEFAULT 'Seu atendimento não termina na consulta',
  why_paragraph_1 text DEFAULT 'Após o atendimento clínico, muitos pacientes são orientados a manter um cuidado contínuo para preservar os resultados ao longo do tempo.',
  why_paragraph_2 text DEFAULT 'Esta página foi desenvolvida justamente para facilitar esse próximo passo, conectando o cuidado da consulta com a proteção de longo prazo que você precisa.',
  reasons jsonb DEFAULT '[
    {"title":"Estresse contínuo","description":"A exposição diária a fatores externos gera danos cumulativos que não param após a consulta","icon":"Activity"},
    {"title":"Proteção progressiva","description":"Os benefícios de um protocolo bem estruturado se constroem com consistência ao longo dos meses","icon":"Sparkles"},
    {"title":"Cuidado completo","description":"Sem uma abordagem contínua, o cuidado iniciado na consulta pode ficar incompleto","icon":"ShieldCheck"}
  ]'::jsonb,
  logic_eyebrow text DEFAULT 'A LÓGICA POR TRÁS DO PROTOCOLO',
  logic_title text DEFAULT 'Proteção estruturada para resultados de longo prazo',
  logic_description text DEFAULT 'O protocolo foi estruturado para atuar de forma progressiva, apoiando sua saúde ao longo do tempo. Seus benefícios estão diretamente ligados à consistência do uso.',
  logic_benefits jsonb DEFAULT '["Proteção contínua da saúde","Suporte à integridade do organismo","Redução dos efeitos do estresse oxidativo","Evolução progressiva ao longo dos meses"]'::jsonb,
  cta_title text DEFAULT 'Identifique o nível ideal de proteção para o seu caso',
  cta_description text DEFAULT 'Responda algumas perguntas rápidas sobre seu perfil e descubra o plano mais adequado para dar continuidade ao cuidado iniciado na sua consulta.',
  cta_button_label text DEFAULT 'Iniciar minha avaliação',
  cta_meta text DEFAULT 'Menos de 2 minutos • Resultado personalizado',
  trust_badges jsonb DEFAULT '["Dados criptografados","Recomendado por profissionais","Resultado individualizado"]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_protocol_landing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active protocol landings"
  ON public.tenant_protocol_landing FOR SELECT
  USING (active = true);

CREATE POLICY "Tenant admins manage own protocol landing"
  ON public.tenant_protocol_landing FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'admin'::app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), tenant_id, 'admin'::app_role) OR public.is_super_admin(auth.uid()));

CREATE TRIGGER trg_tenant_protocol_landing_updated
  BEFORE UPDATE ON public.tenant_protocol_landing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
