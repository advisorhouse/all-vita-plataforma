CREATE TABLE public.quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  full_name text NOT NULL,
  cpf text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  age integer,
  sex text,
  health_conditions text[] DEFAULT '{}',
  other_conditions text,
  continuous_medications boolean DEFAULT false,
  medications_detail text,
  uses_eye_drops boolean DEFAULT false,
  eye_drops_detail text,
  had_eye_surgery boolean DEFAULT false,
  surgery_detail text,
  had_eye_trauma boolean DEFAULT false,
  consultation_reason text,
  other_reason text,
  consent_data_usage boolean DEFAULT false,
  consent_contact_whatsapp boolean DEFAULT false,
  consent_contact_email boolean DEFAULT false,
  consent_contact_sms boolean DEFAULT false,
  consent_contact_phone boolean DEFAULT false,
  consent_contact_social boolean DEFAULT false,
  doctor_code text NOT NULL
);

ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.quiz_submissions
  FOR INSERT TO anon WITH CHECK (true);