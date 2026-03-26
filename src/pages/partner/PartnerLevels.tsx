import React from "react";
import { motion } from "framer-motion";
import { Star, Lock, Check, Users, ShieldCheck } from "lucide-react";

const tiers = [
  {
    name: "Basic",
    minClients: 0,
    minRetention: 0,
    benefits: ["Pontuação padrão 10x", "Link de indicação", "Acesso ao painel"],
    unlocked: true,
  },
  {
    name: "Premium",
    minClients: 20,
    minRetention: 80,
    benefits: ["Pontuação 12x", "Bônus de permanência 2x", "Materiais exclusivos", "Suporte prioritário"],
    unlocked: true,
  },
  {
    name: "Elite",
    minClients: 50,
    minRetention: 90,
    benefits: ["Pontuação 15x", "Bônus de permanência 3x", "Acesso antecipado a lançamentos", "Gerente de conta dedicado", "Eventos exclusivos"],
    unlocked: false,
  },
];

const currentClients = 34;
const currentRetention = 87;

const PartnerLevels: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Current status */}
      <div className="flex items-center gap-6 rounded-2xl border border-border bg-card p-5 vision-shadow">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">{currentClients}</p>
            <p className="text-[11px] text-muted-foreground">Clientes ativos</p>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">{currentRetention}%</p>
            <p className="text-[11px] text-muted-foreground">Retenção média</p>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div className="space-y-4">
        {tiers.map((tier, i) => {
          const clientProgress = Math.min(currentClients / Math.max(tier.minClients, 1), 1);
          const retentionProgress = Math.min(currentRetention / Math.max(tier.minRetention, 1), 1);

          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border bg-card p-6 vision-shadow ${
                tier.unlocked ? "border-border" : "border-border/60 opacity-80"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    tier.unlocked ? "bg-accent/10" : "bg-secondary"
                  }`}>
                    {tier.unlocked ? (
                      <Star className="h-5 w-5 text-accent" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{tier.name}</h3>
                    {tier.minClients > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        {tier.minClients}+ clientes · {tier.minRetention}%+ retenção
                      </p>
                    )}
                  </div>
                </div>
                {tier.unlocked && (
                  <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
                    Ativo
                  </span>
                )}
              </div>

              {/* Progress bars for locked tiers */}
              {!tier.unlocked && tier.minClients > 0 && (
                <div className="mb-4 space-y-2">
                  <div>
                    <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>Clientes: {currentClients}/{tier.minClients}</span>
                      <span>{Math.round(clientProgress * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${clientProgress * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>Retenção: {currentRetention}%/{tier.minRetention}%</span>
                      <span>{Math.round(retentionProgress * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${retentionProgress * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="space-y-2">
                {tier.benefits.map((b, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Check className={`h-3.5 w-3.5 ${tier.unlocked ? "text-success" : "text-muted-foreground/40"}`} />
                    <span className={`text-caption ${tier.unlocked ? "text-foreground" : "text-muted-foreground"}`}>{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerLevels;
