-- Add columns to commission_rules if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commission_rules' AND column_name = 'name') THEN
        ALTER TABLE public.commission_rules ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commission_rules' AND column_name = 'min_months') THEN
        ALTER TABLE public.commission_rules ADD COLUMN min_months INTEGER DEFAULT 0;
    END IF;
END $$;

-- Fix commissions table columns
DO $$ 
BEGIN 
    -- Ensure paid_status exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commissions' AND column_name = 'paid_status') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commissions' AND column_name = 'status') THEN
            ALTER TABLE public.commissions RENAME COLUMN status TO paid_status;
        ELSE
            ALTER TABLE public.commissions ADD COLUMN paid_status TEXT DEFAULT 'pending';
        END IF;
    END IF;
    
    -- Ensure paid_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commissions' AND column_name = 'paid_at') THEN
        ALTER TABLE public.commissions ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Ensure payment_proof_url exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commissions' AND column_name = 'payment_proof_url') THEN
        ALTER TABLE public.commissions ADD COLUMN payment_proof_url TEXT;
    END IF;
END $$;