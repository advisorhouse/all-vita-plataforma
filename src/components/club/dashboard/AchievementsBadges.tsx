import React from "react";
import { motion } from "framer-motion";
import {
  Award, Lock, Sun, Flame, Zap, Sparkles, BookOpen, Shield, Clock, Crown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Badge {
  id: string;
  icon: React.ElementType;
  label: string;
  unlocked: boolean;
}

interface AchievementsBadgesProps {
  streak: number;
  markedDays: number;
  contentConsumed: number;
  activeMonths: number;
}

function getBadges(props: AchievementsBadgesProps): Badge[] {
  return [
    { id: "first_day", icon: Sun, label: "Primeiro Dia", unlocked: props.markedDays >= 1 },
    { id: "streak_7", icon: Flame, label: "7 Dias", unlocked: props.streak >= 7 },
    { id: "streak_14", icon: Zap, label: "14 Dias", unlocked: props.streak >= 14 },
    { id: "streak_21", icon: Sparkles, label: "21 Dias", unlocked: props.streak >= 21 },
    { id: "content_1", icon: BookOpen, label: "Explorador", unlocked: props.contentConsumed >= 1 },
    { id: "month_3", icon: Shield, label: "Proteção", unlocked: props.activeMonths >= 3 },
    { id: "month_6", icon: Clock, label: "Longevidade", unlocked: props.activeMonths >= 6 },
    { id: "month_12", icon: Crown, label: "Elite", unlocked: props.activeMonths >= 12 },
  ];
}

const AchievementsBadges: React.FC<AchievementsBadgesProps> = (props) => {
  const badges = getBadges(props);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
    >
      <Card className="border border-border shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Conquistas</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {unlockedCount}/{badges.length}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {badges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.03 }}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-colors ${
                    badge.unlocked ? "bg-accent/10" : "bg-secondary/20"
                  }`}
                >
                  {badge.unlocked ? (
                    <Icon className="h-5 w-5 text-accent" />
                  ) : (
                    <div className="relative">
                      <Icon className="h-5 w-5 text-muted-foreground/20" />
                      <Lock className="h-3 w-3 text-muted-foreground/30 absolute -bottom-0.5 -right-0.5" />
                    </div>
                  )}
                  <p className={`text-[9px] font-medium leading-tight ${badge.unlocked ? "text-foreground" : "text-muted-foreground/40"}`}>
                    {badge.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementsBadges;
