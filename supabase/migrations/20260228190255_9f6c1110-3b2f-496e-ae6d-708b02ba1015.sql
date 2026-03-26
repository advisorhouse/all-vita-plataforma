
-- Function to increment affiliate client counters
CREATE OR REPLACE FUNCTION public.increment_affiliate_clients(aff_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.affiliates
  SET 
    total_clients = total_clients + 1,
    active_clients = active_clients + 1
  WHERE id = aff_id;
END;
$$;
