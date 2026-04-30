ALTER TABLE public.commissions 
RENAME COLUMN affiliate_id TO partner_id;

COMMENT ON COLUMN public.commissions.partner_id IS 'ID do parceiro que recebeu a comissão';
