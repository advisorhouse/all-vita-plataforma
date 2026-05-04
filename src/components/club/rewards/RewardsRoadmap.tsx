import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Gift, Check, Lock, ChevronRight, Star,
  Percent, Stethoscope, Glasses, Truck, Heart, Sparkles,
  Loader2, ShoppingBag, X, Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost_vitacoins: number;
  type: string;
  stock: number;
  active: boolean;
  image_url?: string;
}

interface RewardsRoadmapProps {
  currentMonth: number;
  onRedeem?: (rewardId: string) => void;
}

const RewardsRoadmap: React.FC<RewardsRoadmapProps> = ({ currentMonth, onRedeem }) => {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);

  // Fetch Wallet Balance
  const { data: wallet } = useQuery({
    queryKey: ["vitacoins-wallet", currentTenant?.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vitacoins_wallet")
        .select("balance")
        .eq("tenant_id", currentTenant?.id)
        .eq("user_id", user?.id)
        .maybeSingle();
      if (error) throw error;
      return data || { balance: 0 };
    },
    enabled: !!currentTenant?.id && !!user?.id
  });

  // Fetch Rewards Catalog
  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["rewards-catalog", currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards_catalog")
        .select("*")
        .eq("tenant_id", currentTenant?.id)
        .eq("active", true)
        .order("cost_vitacoins", { ascending: true });
      if (error) throw error;
      return data as Reward[];
    },
    enabled: !!currentTenant?.id
  });

  const redeemMutation = useMutation({
    mutationFn: async (reward: Reward) => {
      if ((wallet?.balance || 0) < reward.cost_vitacoins) {
        throw new Error("Saldo insuficiente de Vitacoins.");
      }

      // 1. Create redemption request
      const { error: reqError } = await supabase.from("redemption_requests").insert({
        tenant_id: currentTenant?.id,
        user_id: user?.id,
        reward_id: reward.id,
        amount: reward.cost_vitacoins,
        status: "pending",
        metadata: { reward_name: reward.name }
      });

      if (reqError) throw reqError;

      // 2. Debit from wallet (via transaction)
      const { error: transError } = await supabase.from("vitacoin_transactions").insert({
        tenant_id: currentTenant?.id,
        user_id: user?.id,
        amount: reward.cost_vitacoins,
        type: "debit",
        source: "redemption",
        description: `Resgate de recompensa: ${reward.name}`
      });

      if (transError) throw transError;

      // 3. Update wallet balance
      const { error: walletError } = await supabase
        .from("vitacoins_wallet")
        .update({ balance: (wallet?.balance || 0) - reward.cost_vitacoins })
        .eq("tenant_id", currentTenant?.id)
        .eq("user_id", user?.id);
      
      if (walletError) throw walletError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vitacoins-wallet"] });
      toast.success("Solicitação de resgate enviada com sucesso!");
      setRedeemModalOpen(false);
      setSelectedReward(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao processar resgate.");
    }
  });

  const balance = wallet?.balance || 0;

  return (
    <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-accent/10 via-card to-accent/5">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15">
            <Gift className="h-7 w-7 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">Loja de Recompensas</h2>
            <p className="text-base text-muted-foreground mt-1">
              Troque seus <strong className="text-accent">Vitacoins</strong> por prêmios exclusivos.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2 border border-accent/20">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xl font-bold text-foreground">{balance.toLocaleString()}</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase">VC</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Prêmios Disponíveis</span>
            <span>{rewards.length} itens</span>
          </div>
          <Progress value={100} className="h-2 rounded-full bg-accent/10 [&>div]:bg-accent" />
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-2 flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : rewards.map((reward, i) => {
            const canAfford = balance >= reward.cost_vitacoins;
            const isOutOfStock = (reward.stock || 0) <= 0;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className={cn(
                    "relative rounded-2xl border p-5 transition-all h-full group",
                    canAfford && !isOutOfStock 
                      ? "border-accent/20 bg-card hover:border-accent/40 hover:shadow-md" 
                      : "border-border bg-muted/20 opacity-80"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="bg-accent/10 text-accent border-0 text-[10px] font-bold">
                      {reward.cost_vitacoins} VITACOINS
                    </Badge>
                    {isOutOfStock ? (
                      <Badge variant="destructive" className="text-[10px]">ESGOTADO</Badge>
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground">ESTOQUE: {reward.stock}</span>
                    )}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="shrink-0 flex items-center justify-center rounded-xl w-16 h-16 bg-accent/5 border border-accent/10">
                      {reward.image_url ? (
                        <img src={reward.image_url} alt={reward.name} className="h-12 w-12 object-contain" />
                      ) : (
                        <ShoppingBag className="h-7 w-7 text-accent/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold leading-tight text-foreground">{reward.name}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedReward(reward);
                      setRedeemModalOpen(true);
                    }}
                    disabled={!canAfford || isOutOfStock}
                    className={cn(
                      "w-full mt-4 rounded-xl h-11 text-sm font-bold transition-all",
                      canAfford && !isOutOfStock
                        ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {isOutOfStock ? "Indisponível" : !canAfford ? "Saldo Insuficiente" : "Resgatar agora"}
                    {!isOutOfStock && canAfford && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </motion.div>
            );
          })}
          
          {rewards.length === 0 && !isLoading && (
            <div className="col-span-2 py-12 text-center bg-secondary/20 rounded-2xl border border-dashed border-border">
              <Gift className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma recompensa disponível neste momento.</p>
            </div>
          )}
        </div>

        {/* Bottom motivational CTA */}
        <div className="rounded-2xl bg-accent/10 p-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <p className="text-lg font-semibold text-foreground">Cada mês ativo = um novo presente</p>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Mantenha sua assinatura ativa e registre o uso diário para desbloquear todos os prêmios da sua trilha.
          </p>
        </div>

        {/* Modal de Confirmação */}
        <Dialog open={redeemModalOpen} onOpenChange={setRedeemModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-accent" />
                Confirmar Resgate
              </DialogTitle>
              <DialogDescription>
                Você está prestes a trocar seus Vitacoins por uma recompensa.
              </DialogDescription>
            </DialogHeader>
            
            {selectedReward && (
              <div className="py-4 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="h-16 w-16 rounded-lg bg-card flex items-center justify-center border border-border">
                    {selectedReward.image_url ? (
                      <img src={selectedReward.image_url} alt={selectedReward.name} className="h-12 w-12 object-contain" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-accent/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{selectedReward.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedReward.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2">
                  <span className="text-sm text-muted-foreground">Custo do resgate:</span>
                  <span className="text-lg font-bold text-accent">-{selectedReward.cost_vitacoins} VC</span>
                </div>
                
                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                  <Info className="h-4 w-4 text-accent" />
                  <p className="text-[11px] text-muted-foreground">
                    Após confirmar, nossa equipe entrará em contato para organizar a entrega ou ativação do seu prêmio.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setRedeemModalOpen(false)}>Cancelar</Button>
              <Button 
                onClick={() => selectedReward && redeemMutation.mutate(selectedReward)}
                disabled={redeemMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {redeemMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  "Confirmar Resgate"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RewardsRoadmap;
