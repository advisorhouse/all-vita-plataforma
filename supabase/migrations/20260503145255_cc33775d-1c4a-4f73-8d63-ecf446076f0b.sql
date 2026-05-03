-- Create ai_predictions table
CREATE TABLE public.ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    prediction_type TEXT NOT NULL,
    data JSONB NOT NULL,
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

-- Policies (following project pattern)
CREATE POLICY "Super admins manage all predictions"
    ON public.ai_predictions FOR ALL
    USING (is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view predictions"
    ON public.ai_predictions FOR SELECT
    USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));

CREATE POLICY "Tenant managers view predictions"
    ON public.ai_predictions FOR SELECT
    USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

CREATE INDEX idx_ai_predictions_tenant_id ON public.ai_predictions(tenant_id);
CREATE INDEX idx_ai_predictions_type ON public.ai_predictions(prediction_type);
