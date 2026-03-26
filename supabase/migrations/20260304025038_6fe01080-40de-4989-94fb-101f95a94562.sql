
-- Table to store quiz pre-consultation submissions
CREATE TABLE public.quiz_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Patient identification
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER,
  sex TEXT,
  
  -- Health history
  health_conditions TEXT[] DEFAULT '{}',
  other_conditions TEXT,
  
  -- Medications
  continuous_medications BOOLEAN DEFAULT false,
  medications_detail TEXT,
  uses_eye_drops BOOLEAN DEFAULT false,
  eye_drops_detail TEXT,
  
  -- Ophthalmological history
  had_eye_surgery BOOLEAN DEFAULT false,
  surgery_detail TEXT,
  had_eye_trauma BOOLEAN DEFAULT false,
  
  -- Consultation reason
  consultation_reason TEXT,
  other_reason TEXT,
  
  -- LGPD Consent
  consent_data_usage BOOLEAN DEFAULT false,
  consent_contact_whatsapp BOOLEAN DEFAULT false,
  consent_contact_email BOOLEAN DEFAULT false,
  consent_contact_sms BOOLEAN DEFAULT false,
  consent_contact_phone BOOLEAN DEFAULT false,
  consent_contact_social BOOLEAN DEFAULT false,
  
  -- Attribution
  doctor_code TEXT NOT NULL,
  affiliate_id UUID REFERENCES public.affiliates(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'submitted',
  converted_to_client BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Public insert (no auth required - patients fill without login)
CREATE POLICY "Anyone can submit quiz"
ON public.quiz_submissions
FOR INSERT
WITH CHECK (true);

-- Admins manage all
CREATE POLICY "Admins manage quiz submissions"
ON public.quiz_submissions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Affiliates view their own patients' submissions
CREATE POLICY "Affiliates view linked submissions"
ON public.quiz_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = quiz_submissions.affiliate_id
    AND a.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_quiz_submissions_updated_at
BEFORE UPDATE ON public.quiz_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add doctor_code column to affiliates for direct quiz links
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS doctor_code TEXT UNIQUE;
