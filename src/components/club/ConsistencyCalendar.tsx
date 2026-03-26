import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Sparkles, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { t, t2, tpl } from "@/lib/emotional-copy";

// ─── Types ───────────────────────────────────────────────────
interface ConsistencyCalendarProps {
  markedDays: number[];
  onMarkDay: (day: number) => void;
}

interface StreakInfo {
  current: number;
  longest: number;
}

// ─── Helpers ─────────────────────────────────────────────────
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function computeStreak(markedDays: number[], totalDays: number, today: number): StreakInfo {
  const sorted = [...new Set(markedDays)].sort((a, b) => a - b);
  let current = 0;
  let longest = 0;
  let streak = 0;

  for (let d = 1; d <= Math.min(today, totalDays); d++) {
    if (sorted.includes(d)) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 0;
    }
  }
  current = streak;

  return { current, longest };
}

function getConsecutiveCount(markedDays: number[], today: number): number {
  let count = 0;
  for (let d = today; d >= 1; d--) {
    if (markedDays.includes(d)) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function getMissedConsecutive(markedDays: number[], today: number): number {
  let count = 0;
  for (let d = today - 1; d >= 1; d--) {
    if (!markedDays.includes(d)) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

// Invisible milestones
const MILESTONES = [7, 14, 21];

function getNewMilestone(streakBefore: number, streakAfter: number): number | null {
  for (const m of MILESTONES) {
    if (streakBefore < m && streakAfter >= m) return m;
  }
  return null;
}

// ─── Feedback messages ───────────────────────────────────────
function getMarkFeedback(consecutiveDays: number): string {
  if (consecutiveDays >= 5) return t("calendar_mark_streak5");
  if (consecutiveDays >= 2) return t("calendar_mark_streak2");
  return t("calendar_mark_1");
}

// ─── Component ───────────────────────────────────────────────
const ConsistencyCalendar: React.FC<ConsistencyCalendarProps> = ({
  markedDays,
  onMarkDay,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [milestoneReached, setMilestoneReached] = useState<number | null>(null);

  const isCurrentMonth = viewYear === currentYear && viewMonth === currentMonth;
  const isPastMonth = viewYear < currentYear || (viewYear === currentYear && viewMonth < currentMonth);
  const simplified = true; // unified accessible layout for all users

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  const today = isCurrentMonth ? todayDate : 0;
  const isTodayMarked = markedDays.includes(todayDate) && isCurrentMonth;

  const streak = useMemo(
    () => computeStreak(markedDays, daysInMonth, isCurrentMonth ? todayDate : daysInMonth),
    [markedDays, daysInMonth, todayDate, isCurrentMonth]
  );

  const missedDays = useMemo(
    () => isCurrentMonth ? getMissedConsecutive(markedDays, todayDate) : 0,
    [markedDays, todayDate, isCurrentMonth]
  );

  const monthConsistency = useMemo(() => {
    const relevantDays = isCurrentMonth ? todayDate : daysInMonth;
    if (relevantDays === 0) return 0;
    const markedInRange = markedDays.filter(d => d >= 1 && d <= relevantDays).length;
    return Math.round((markedInRange / relevantDays) * 100);
  }, [markedDays, todayDate, daysInMonth, isCurrentMonth]);

  // ─── Navigation ─────────────────────
  const canGoNext = !isCurrentMonth;
  const canGoPrev = true;

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // ─── Mark today ─────────────────────
  const handleMarkToday = useCallback(() => {
    if (isTodayMarked || !isCurrentMonth) return;

    const streakBefore = getConsecutiveCount(markedDays, todayDate - 1);
    onMarkDay(todayDate);
    const streakAfter = streakBefore + 1;

    const msg = getMarkFeedback(streakAfter);
    setFeedback(msg);

    const milestone = getNewMilestone(streakBefore, streakAfter);
    if (milestone) {
      setTimeout(() => setMilestoneReached(milestone), 1200);
    }

    setTimeout(() => setFeedback(null), 2500);

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, [isTodayMarked, isCurrentMonth, markedDays, todayDate, onMarkDay]);

  const dismissMilestone = () => setMilestoneReached(null);

  // ─── Can mark yesterday (within 24h) ──
  const canMarkYesterday = isCurrentMonth && todayDate > 1 && !markedDays.includes(todayDate - 1);

  const handleMarkYesterday = useCallback(() => {
    if (!canMarkYesterday) return;
    onMarkDay(todayDate - 1);
    setFeedback("Dia anterior registrado.");
    setTimeout(() => setFeedback(null), 2500);
    if (navigator.vibrate) navigator.vibrate(20);
  }, [canMarkYesterday, todayDate, onMarkDay]);

  // ─── Render ─────────────────────────
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className={cn("space-y-5", simplified ? "p-5" : "p-6")}>
        {/* Title header matching Daily Use widget */}
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-foreground">
            <CalendarDays className="h-7 w-7 text-background" />
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">Consistência</p>
            <p className="text-base text-muted-foreground">Acompanhe seu progresso mensal</p>
          </div>
        </div>

        {/* Header with month nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h3 className={cn("font-semibold text-foreground", simplified ? "text-base" : "text-sm")}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h3>
            {isPastMonth && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Consistência média: {monthConsistency}%
              </p>
            )}
          </div>
          <button
            onClick={goToNextMonth}
            disabled={!canGoNext}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              canGoNext ? "text-muted-foreground hover:text-foreground hover:bg-secondary" : "text-muted-foreground/20 cursor-default"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Streak display */}
        {isCurrentMonth && streak.current > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className={cn("font-medium text-foreground", simplified ? "text-base" : "text-sm")}>
              {streak.current} {streak.current === 1 ? "dia consecutivo" : "dias consecutivos"}
            </p>
          </motion.div>
        )}

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className={cn(
              "text-center font-medium text-muted-foreground",
              simplified ? "text-[13px] py-2" : "text-[11px] py-1"
            )}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className={simplified ? "h-11" : "h-9"} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isMarked = markedDays.includes(day);
            const isToday = day === today;
            const isFuture = isCurrentMonth && day > todayDate;
            const isPast = (isCurrentMonth && day < todayDate) || isPastMonth;

            return (
              <motion.div
                key={day}
                layout
                className={cn(
                  "flex items-center justify-center rounded-lg font-medium transition-all",
                  simplified ? "h-11 text-[14px]" : "h-9 text-[12px]",
                  // Marked: solid foreground fill
                  isMarked && "bg-foreground text-background",
                  // Today unmarked: thin border
                  isToday && !isMarked && "border border-foreground/20 text-foreground",
                  // Future: light
                  isFuture && "text-muted-foreground/25",
                  // Past unmarked: subtle (NO red)
                  isPast && !isMarked && !isToday && "text-muted-foreground/40",
                )}
              >
                {isMarked ? (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check className={cn(simplified ? "h-4 w-4" : "h-3.5 w-3.5")} />
                  </motion.div>
                ) : (
                  day
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${(markedDays.filter(d => d >= 1 && d <= daysInMonth).length / daysInMonth) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className={cn("text-muted-foreground text-center", simplified ? "text-[13px]" : "text-[12px]")}>
            {tpl("calendar_progress", { marked: markedDays.filter(d => d >= 1 && d <= daysInMonth).length, total: daysInMonth })}
          </p>
        </div>

        {/* Recovery card (3+ missed days) */}
        {isCurrentMonth && missedDays >= 3 && !isTodayMarked && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-secondary/60 p-4 text-center space-y-2"
          >
            <p className={cn("font-medium text-foreground", simplified ? "text-[14px]" : "text-[13px]")}>
              {t("calendar_recovery")}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {t2("calendar_recovery")}
            </p>
          </motion.div>
        )}

        {/* Mark today button (current month only) */}
        {isCurrentMonth && (
          <div className="space-y-2">
            <Button
              onClick={handleMarkToday}
              disabled={isTodayMarked}
              className={cn(
                "w-full rounded-xl font-medium transition-all",
                simplified ? "h-14 text-[15px]" : "h-12 text-[14px]",
                isTodayMarked
                  ? "bg-secondary text-foreground/60 cursor-default hover:bg-secondary"
                  : "bg-foreground text-background hover:bg-foreground/90"
              )}
            >
              <AnimatePresence mode="wait">
                {feedback ? (
                  <motion.span
                    key="feedback"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {feedback}
                  </motion.span>
                ) : isTodayMarked ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {t("calendar_confirmed")}
                  </motion.span>
                ) : (
                  <motion.span
                    key="cta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {t("next_step_button_mark")}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Mark yesterday link */}
            {canMarkYesterday && !isTodayMarked && (
              <button
                onClick={handleMarkYesterday}
                className="w-full text-center text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {t("calendar_yesterday")}
              </button>
            )}
          </div>
        )}

        {/* Milestone toast */}
        <AnimatePresence>
          {milestoneReached && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="rounded-xl border border-border bg-card p-4 text-center space-y-1"
            >
              <p className="text-sm font-semibold text-foreground">
                {t(`calendar_milestone_${milestoneReached}`)}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {t2(`calendar_milestone_${milestoneReached}`)}
              </p>
              <button
                onClick={dismissMilestone}
                className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors mt-1"
              >
                Fechar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ConsistencyCalendar;
