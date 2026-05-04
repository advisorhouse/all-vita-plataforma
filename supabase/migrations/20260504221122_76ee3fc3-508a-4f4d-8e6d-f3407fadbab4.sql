
-- 1. Criar Recompensa de Teste
INSERT INTO public.rewards_catalog (tenant_id, name, description, cost_in_coins, stock, active)
VALUES (
  '6a1818ae-5225-4a38-8f95-6c254dec0580', 
  'iPhone 15 Pro Max (Teste)', 
  'Recompensa de teste para validação do fluxo de resgate.', 
  5000, 
  5, 
  true
) ON CONFLICT DO NOTHING;

-- 2. Garantir Carteira e Saldo para o Parceiro Tiago (5d79cfb3-d4ec-4199-ad50-34489e67d3d8)
INSERT INTO public.vitacoins_wallet (tenant_id, user_id, balance, total_earned)
VALUES ('6a1818ae-5225-4a38-8f95-6c254dec0580', '5d79cfb3-d4ec-4199-ad50-34489e67d3d8', 10000, 10000)
ON CONFLICT (tenant_id, user_id) 
DO UPDATE SET balance = public.vitacoins_wallet.balance + 10000;

-- 3. Registrar Transação de Crédito
INSERT INTO public.vitacoin_transactions (tenant_id, user_id, amount, type, source, description)
VALUES (
  '6a1818ae-5225-4a38-8f95-6c254dec0580', 
  '5d79cfb3-d4ec-4199-ad50-34489e67d3d8', 
  10000, 
  'credit', 
  'bonus', 
  'Bônus de ativação para teste de sistema'
);
