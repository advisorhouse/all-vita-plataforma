import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp, Calendar, Gift, ChevronRight, Gem, Crown, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { t, t2 } from "@/lib/emotional-copy";

interface EvolutionCardProps {
  totalActiveDays: number;
  averageConsistency: number;
  monthsToNext: number;
  nextMilestoneLabel: string;
  nextMilestoneTarget: number;
  activeMonths: number;
  benefitUnlocked: boolean;
  benefitRedeemed: boolean;
  benefit6MUnlocked?: boolean;
  benefit6MRedeemed?: boolean;
  benefit12MUnlocked?: boolean;
  benefit12MRedeemed?: boolean;
  memberSince?: string;
  highValueClient?: boolean;
  eliteStatus?: boolean;
  onRedeemBenefit: () => void;
  onRedeem6MBenefit?: () => void;
  onRedeem12MBenefit?: () => void;
}

const EvolutionCard: React.FC<EvolutionCardProps> = ({
  totalActiveDays,
  averageConsistency,
  monthsToNext,
  nextMilestoneLabel,
  nextMilestoneTarget,
  activeMonths,
  benefitUnlocked,
  benefitRedeemed,
  benefit6MUnlocked,
  benefit6MRedeemed,
  benefit12MUnlocked,
  benefit12MRedeemed,
  memberSince,
  highValueClient,
  eliteStatus,
  onRedeemBenefit,
  onRedeem6MBenefit,
  onRedeem12MBenefit,
}) => {
  const navigate = useNavigate();
  const is6MPlus = activeMonths >= 6;
  const is12MPlus = activeMonths >= 12;

  const titleKey = is12MPlus ? "evolution_title_12m" : is6MPlus ? "evolution_title_6m" : "evolution_title_default";
  const contentKey = is12MPlus ? "evolution_content_12m" : is6MPlus ? "evolution_content_6m" : "evolution_content_default";

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {is12MPlus ? <Crown className="h-4 w-4 text-foreground" /> : <TrendingUp className="h-4 w-4 text-muted-foreground" />}
            <h2 className="text-sm font-semibold text-foreground">{t(titleKey)}</h2>
          </div>
          {memberSince && (
            <span className="text-[10px] text-muted-foreground">
              Membro desde {memberSince}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Dias ativos</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{totalActiveDays}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Consistência</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{averageConsistency}%</p>
          </div>
        </div>

        {/* Next milestone */}
        {monthsToNext > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">Próximo marco: {nextMilestoneLabel}</span>
              <span className="text-[11px] text-muted-foreground">{monthsToNext}m restantes</span>
            </div>
            <Progress value={((nextMilestoneTarget - monthsToNext) / nextMilestoneTarget) * 100} className="h-1.5" />
          </div>
        )}

        {/* 12M Elite Benefit */}
        {benefit12MUnlocked && !benefit12MRedeemed && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl bg-foreground/5 border border-foreground/10 px-4 py-3"
          >
            <Crown className="h-5 w-5 text-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground">{t("milestone_benefit_12m")}</p>
              <p className="text-[11px] text-muted-foreground">{t2("milestone_benefit_12m")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] rounded-lg shrink-0"
              onClick={onRedeem12MBenefit}
            >
              Ver
            </Button>
          </motion.div>
        )}

        {/* 6M Benefit */}
        {benefit6MUnlocked && !benefit6MRedeemed && !(benefit12MUnlocked && !benefit12MRedeemed) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl bg-foreground/5 px-4 py-3"
          >
            <Gem className="h-5 w-5 text-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground">{t("milestone_benefit_6m")}</p>
              <p className="text-[11px] text-muted-foreground">{t2("milestone_benefit_6m")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] rounded-lg shrink-0"
              onClick={onRedeem6MBenefit}
            >
              Ver
            </Button>
          </motion.div>
        )}

        {/* 3M Benefit */}
        {benefitUnlocked && !benefitRedeemed && !(benefit6MUnlocked && !benefit6MRedeemed) && !(benefit12MUnlocked && !benefit12MRedeemed) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3"
          >
            <Gift className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground">{t("milestone_benefit_3m")}</p>
              <p className="text-[11px] text-muted-foreground">{t2("milestone_benefit_3m")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] rounded-lg shrink-0"
              onClick={onRedeemBenefit}
            >
              Ver
            </Button>
          </motion.div>
        )}

        {/* Ambassador card for Elite with high consistency */}
        {is12MPlus && eliteStatus && averageConsistency > 80 && (
          <button
            onClick={() => navigate("/club/content")}
            className="w-full flex items-center gap-3 rounded-xl bg-foreground/5 border border-foreground/10 px-4 py-3 hover:bg-foreground/10 transition-colors text-left"
          >
            <Users className="h-4 w-4 text-foreground shrink-0" />
            <span className="text-[13px] font-medium text-foreground flex-1">{t("evolution_ambassador")}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        )}

        {/* Upgrade suggestion for high consistency 6M+ (non-elite) */}
        {is6MPlus && !is12MPlus && highValueClient && averageConsistency > 75 && (
          <button
            onClick={() => navigate("/club/subscription")}
            className="w-full flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3 hover:bg-secondary transition-colors text-left"
          >
            <Gem className="h-4 w-4 text-foreground shrink-0" />
            <span className="text-[13px] font-medium text-foreground flex-1">{t("evolution_upgrade")}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        )}

        {/* Exclusive content teaser */}
        <button
          onClick={() => navigate("/club/content")}
          className="w-full flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3 hover:bg-secondary transition-colors text-left"
        >
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <span className="text-[13px] font-medium text-foreground flex-1">
            {t(contentKey)}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </CardContent>
    </Card>
  );
};

export default EvolutionCard;
