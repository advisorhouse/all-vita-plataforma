import React from "react";
import { motion } from "framer-motion";
import { Shield, Flame, CalendarCheck, TrendingUp } from "lucide-react";
import { t, t2 } from "@/lib/emotional-copy";
import iconVisionLift from "@/assets/icon-vision-lift.png";

interface DashboardHeroProps {
  userName: string;
  greetingKey: string;
  streak: number;
  markedDays: number;
  consistencyPercent: number;
  level: string;
  is3MPlus: boolean;
  is6MPlus: boolean;
  is12MPlus: boolean;
}

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function getTimeIcon() {
  const h = new Date().getHours();
  if (h < 12)
    return (
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="h-4 w-4 text-accent"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </motion.svg>
    );
  if (h < 18)
    return (
      <motion.svg
        animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
        className="h-4 w-4 text-accent"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
      </motion.svg>
    );
  return (
    <motion.svg
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="h-4 w-4 text-accent"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </motion.svg>
  );
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  userName,
  greetingKey,
  streak,
  markedDays,
  consistencyPercent,
  level,
  is3MPlus,
  is6MPlus,
  is12MPlus,
}) => {
  const stats = [
    { icon: Flame, label: "Sequência", value: `${streak}d` },
    { icon: CalendarCheck, label: "Este mês", value: `${markedDays}` },
    { icon: TrendingUp, label: "Consistência", value: `${consistencyPercent}%` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Greeting — clean, minimal */}
      <div className="flex items-start justify-between pt-1">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
            {getTimeGreeting()}, <span className="font-medium text-foreground">{userName}</span>
            {getTimeIcon()}
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-foreground leading-snug">
            {t(greetingKey)}
          </h1>
          <p className="text-muted-foreground text-[13px] font-light max-w-md">
            {t2(greetingKey)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <img src={iconVisionLift} alt="Vision Lift" className="h-8 w-8 object-contain opacity-50" />
          {is3MPlus && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                is12MPlus
                  ? "bg-foreground text-background"
                  : is6MPlus
                  ? "bg-foreground/10 text-foreground"
                  : "bg-accent/10 text-accent"
              }`}
            >
              <Shield className="h-3 w-3" />
              {level}
            </span>
          )}
        </div>
      </div>

      {/* Stats — uniform accent tint */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
            className="rounded-xl border border-border bg-card p-3.5 text-center shadow-sm"
          >
            <stat.icon className="h-4 w-4 mx-auto mb-1.5 text-accent" />
            <p className="text-lg font-semibold text-foreground leading-none">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DashboardHero;
