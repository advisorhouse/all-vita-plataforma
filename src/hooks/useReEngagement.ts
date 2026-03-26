import { useState, useCallback, useMemo } from "react";

const STORAGE_KEY = "vl_reengagement";

export type RiskLevel = "none" | "low" | "moderate" | "high";
export type ReEngagementPhase = "none" | "phase1" | "phase2" | "phase3";

export interface ReEngagementState {
  cycle_day: number;
  consistency_score: number;
  engagement_score: number;
  churn_probability: number;
  phase1_dismissed: boolean;
  phase2_dismissed: boolean;
  phase3_dismissed: boolean;
  phase3_action: string | null; // "continue" | "pause" | "support"
  recovery_streak: number;
  recovery_badge_earned: boolean;
  chronic_risk_cycles: number;
  chronic_risk_flag: boolean;
  last_updated: string;
}

const defaultState: ReEngagementState = {
  cycle_day: 22, // demo: start in phase 1
  consistency_score: 45,
  engagement_score: 35,
  churn_probability: 0.55,
  phase1_dismissed: false,
  phase2_dismissed: false,
  phase3_dismissed: false,
  phase3_action: null,
  recovery_streak: 0,
  recovery_badge_earned: false,
  chronic_risk_cycles: 0,
  chronic_risk_flag: false,
  last_updated: new Date().toISOString(),
};

function classifyRisk(state: ReEngagementState): RiskLevel {
  if (state.churn_probability > 0.7 && state.consistency_score < 40) return "high";
  if (state.churn_probability > 0.5 && state.consistency_score < 60) return "moderate";
  if (state.cycle_day >= 21 && state.consistency_score < 60) return "low";
  return "none";
}

function getPhase(cycleDay: number): ReEngagementPhase {
  if (cycleDay >= 28) return "phase3";
  if (cycleDay >= 25) return "phase2";
  if (cycleDay >= 21) return "phase1";
  return "none";
}

export function useReEngagement() {
  const [state, setState] = useState<ReEngagementState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as ReEngagementState;
      } catch {
        // corrupted
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return defaultState;
  });

  const update = useCallback((partial: Partial<ReEngagementState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial, last_updated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const riskLevel = useMemo(() => classifyRisk(state), [state]);
  const phase = useMemo(() => getPhase(state.cycle_day), [state.cycle_day]);

  const isPhaseVisible = useMemo(() => {
    if (riskLevel === "none") return false;
    if (phase === "phase1" && !state.phase1_dismissed) return true;
    if (phase === "phase2" && !state.phase2_dismissed) return true;
    if (phase === "phase3" && !state.phase3_dismissed) return true;
    return false;
  }, [phase, state, riskLevel]);

  const dismissPhase = useCallback((p: ReEngagementPhase) => {
    if (p === "phase1") update({ phase1_dismissed: true });
    if (p === "phase2") update({ phase2_dismissed: true });
    if (p === "phase3") update({ phase3_dismissed: true });
  }, [update]);

  const setPhase3Action = useCallback((action: string) => {
    update({ phase3_action: action, phase3_dismissed: true });
  }, [update]);

  const markRecoveryDay = useCallback(() => {
    const newStreak = state.recovery_streak + 1;
    const badgeEarned = newStreak >= 3;
    update({
      recovery_streak: newStreak,
      recovery_badge_earned: badgeEarned || state.recovery_badge_earned,
    });
  }, [update, state.recovery_streak, state.recovery_badge_earned]);

  // Demo controls
  const setCycleDay = useCallback((day: number) => {
    update({ cycle_day: day });
  }, [update]);

  const setRiskParams = useCallback(
    (consistency: number, churn: number) => {
      update({ consistency_score: consistency, churn_probability: churn });
    },
    [update]
  );

  const resetReEngagement = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  return {
    state,
    riskLevel,
    phase,
    isPhaseVisible,
    dismissPhase,
    setPhase3Action,
    markRecoveryDay,
    setCycleDay,
    setRiskParams,
    resetReEngagement,
  };
}
