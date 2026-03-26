import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Package, ArrowRight, BookOpen, Clock, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ConsistencyCalendar from "@/components/club/ConsistencyCalendar";
import { t, t2 } from "@/lib/emotional-copy";
import { useNavigate } from "react-router-dom";

interface FirstExperienceViewProps {
  userName: string;
  todayMarked: boolean;
  markedDays: number[];
  productName: string;
  nextShipment: string;
  onMarkToday: () => void;
  onMarkDay: (day: number) => void;
  onConsumeContent: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const FirstExperienceView: React.FC<FirstExperienceViewProps> = ({
  userName,
  todayMarked,
  markedDays,
  productName,
  nextShipment,
  onMarkToday,
  onMarkDay,
  onConsumeContent,
}) => {
  const navigate = useNavigate();
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* ===== BLOCK 1 — HERO HUMANIZADO ===== */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="relative rounded-2xl overflow-hidden">
          <AspectRatio ratio={16 / 9}>
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-secondary/60 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_100%)]" />
            {/* Subtle texture pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </AspectRatio>

          {/* Overlay text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-muted-foreground text-sm mb-2"
            >
              {t("first_experience_label")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground"
            >
              Bem-vinda, {userName}.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-muted-foreground text-base mt-3 max-w-xs"
            >
              {t("first_experience_subtitle")}
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* ===== BLOCK 2 — VÍDEO DE BOAS-VINDAS ===== */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                {videoPlaying ? (
                  <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center">
                    {/* Placeholder for actual video — replace src with real video URL */}
                    <div className="text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto">
                        <Play className="h-5 w-5 text-foreground ml-0.5" />
                      </div>
                      <p className="text-sm text-muted-foreground">Vídeo em reprodução</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 bg-secondary/40 flex items-center justify-center group cursor-pointer transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-16 w-16 rounded-full bg-foreground flex items-center justify-center shadow-lg"
                      >
                        <Play className="h-6 w-6 text-background ml-1" />
                      </motion.div>
                      <p className="text-sm font-medium text-foreground">
                        {t("first_experience_video_title")}
                      </p>
                    </div>
                  </button>
                )}
              </AspectRatio>
            </div>
            <div className="px-5 py-3">
              <p className="text-[12px] text-muted-foreground">
                {t("first_experience_video_hint")}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== BLOCK 3 — SEU PRIMEIRO PASSO ===== */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                {todayMarked ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Clock className="h-4 w-4 text-primary" />
                )}
              </div>
              <h2 className="text-sm font-semibold text-foreground">{t("next_step_title")}</h2>
            </div>

            {todayMarked ? (
              <div className="space-y-3">
                <p className="text-foreground text-[15px] font-medium">
                  {t("first_experience_marked")}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t2("first_experience_marked")}
                </p>
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-11 text-sm"
                  onClick={() => navigate("/club/benefits")}
                >
                  {t("next_step_button_calendar")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-foreground text-[15px] font-medium">
                  {t("first_experience_cta")}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t2("first_experience_cta")}
                </p>
                <Button
                  onClick={onMarkToday}
                  className="w-full rounded-xl h-12 text-[15px] font-medium bg-foreground text-background hover:bg-foreground/90"
                >
                  Registrar hoje
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== BLOCK 4 — CALENDÁRIO MINIMAL ===== */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <ConsistencyCalendar
          markedDays={markedDays}
          onMarkDay={onMarkDay}
        />
      </motion.div>

      {/* ===== BLOCK 5 — SUA JORNADA ORGANIZADA ===== */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Package className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{productName}</p>
                  <p className="text-[12px] text-muted-foreground">Próximo envio: {nextShipment}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-[12px]"
                onClick={() => navigate("/club/subscription")}
              >
                {t("subscription_manage")}
              </Button>
            </div>
            <p className="text-[12px] text-muted-foreground mt-3">
              {t("first_experience_organized")}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== BLOCK 6 — CONTEÚDO CURADO ===== */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <button
              className="w-full flex items-center gap-4 p-5 hover:bg-secondary/50 transition-colors text-left"
              onClick={() => {
                onConsumeContent();
                navigate("/club/content");
              }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <BookOpen className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t("content_title")}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{t2("content_title")}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FirstExperienceView;
