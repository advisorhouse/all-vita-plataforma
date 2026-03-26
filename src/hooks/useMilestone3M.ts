import { useState, useCallback, useMemo } from "react";

const STORAGE_KEY = "vl_milestone3m";

export interface Milestone3MState {
  active_months: number;
  milestone_3m_unlocked: boolean;
  milestone_6m_unlocked: boolean;
  milestone_12m_unlocked: boolean;
  milestone_modal_seen: boolean;
  milestone_6m_modal_seen: boolean;
  milestone_12m_modal_seen: boolean;
  benefit_unlocked: boolean;
  benefit_redeemed: boolean;
  benefit_6m_unlocked: boolean;
  benefit_6m_redeemed: boolean;
  benefit_12m_unlocked: boolean;
  benefit_12m_redeemed: boolean;
  total_active_days: number;
  average_consistency: number;
  fragile_retention_flag: boolean;
  high_value_client: boolean;
  elite_status: boolean;
  core_customer: boolean;
  level: string;
  member_since: string;
  last_updated: string;
}

function computeLevel(months: number, consistency: number): string {
  if (months >= 12) return "Elite Vision";
  if (months >= 6) return "Longevidade";
  if (months >= 3 && consistency >= 50) return "Proteção Ativa";
  return "Início";
}

const defaultState: Milestone3MState = {
  active_months: 3,
  milestone_3m_unlocked: false,
  milestone_6m_unlocked: false,
  milestone_12m_unlocked: false,
  milestone_modal_seen: false,
  milestone_6m_modal_seen: false,
  milestone_12m_modal_seen: false,
  benefit_unlocked: false,
  benefit_redeemed: false,
  benefit_6m_unlocked: false,
  benefit_6m_redeemed: false,
  benefit_12m_unlocked: false,
  benefit_12m_redeemed: false,
  total_active_days: 68,
  average_consistency: 72,
  fragile_retention_flag: false,
  high_value_client: false,
  elite_status: false,
  core_customer: false,
  level: "Início",
  member_since: "Set 2025",
  last_updated: new Date().toISOString(),
};

function migrateState(parsed: any): Milestone3MState {
  return {
    ...defaultState,
    ...parsed,
    milestone_12m_unlocked: parsed.milestone_12m_unlocked ?? false,
    milestone_12m_modal_seen: parsed.milestone_12m_modal_seen ?? false,
    benefit_12m_unlocked: parsed.benefit_12m_unlocked ?? false,
    benefit_12m_redeemed: parsed.benefit_12m_redeemed ?? false,
    elite_status: parsed.elite_status ?? false,
    core_customer: parsed.core_customer ?? false,
    milestone_6m_unlocked: parsed.milestone_6m_unlocked ?? false,
    milestone_6m_modal_seen: parsed.milestone_6m_modal_seen ?? false,
    benefit_6m_unlocked: parsed.benefit_6m_unlocked ?? false,
    benefit_6m_redeemed: parsed.benefit_6m_redeemed ?? false,
    high_value_client: parsed.high_value_client ?? false,
    member_since: parsed.member_since ?? "Set 2025",
  };
}

export function useMilestone3M() {
  const [state, setState] = useState<Milestone3MState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = migrateState(JSON.parse(stored));
        let updated = { ...parsed };
        let changed = false;

        if (updated.active_months >= 3 && !updated.milestone_3m_unlocked) {
          updated.milestone_3m_unlocked = true;
          updated.benefit_unlocked = true;
          updated.level = computeLevel(updated.active_months, updated.average_consistency);
          updated.fragile_retention_flag = updated.average_consistency < 50;
          changed = true;
        }
        if (updated.active_months >= 6 && !updated.milestone_6m_unlocked) {
          updated.milestone_6m_unlocked = true;
          updated.benefit_6m_unlocked = true;
          updated.high_value_client = true;
          updated.level = computeLevel(updated.active_months, updated.average_consistency);
          changed = true;
        }
        if (updated.active_months >= 12 && !updated.milestone_12m_unlocked) {
          updated.milestone_12m_unlocked = true;
          updated.benefit_12m_unlocked = true;
          updated.elite_status = true;
          updated.core_customer = true;
          updated.level = "Elite Vision";
          changed = true;
        }

        if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      } catch { /* corrupted */ }
    }
    const initial: Milestone3MState = {
      ...defaultState,
      milestone_3m_unlocked: true,
      benefit_unlocked: true,
      level: "Proteção Ativa",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  });

  const update = useCallback((partial: Partial<Milestone3MState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial, last_updated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const dismissModal = useCallback(() => update({ milestone_modal_seen: true }), [update]);
  const dismiss6MModal = useCallback(() => update({ milestone_6m_modal_seen: true }), [update]);
  const dismiss12MModal = useCallback(() => update({ milestone_12m_modal_seen: true }), [update]);

  const redeemBenefit = useCallback(() => update({ benefit_redeemed: true }), [update]);
  const redeem6MBenefit = useCallback(() => update({ benefit_6m_redeemed: true }), [update]);
  const redeem12MBenefit = useCallback(() => update({ benefit_12m_redeemed: true }), [update]);

  const monthsToNext = useMemo(() => {
    if (state.active_months >= 12) return 0;
    if (state.active_months >= 6) return 12 - state.active_months;
    return Math.max(6 - state.active_months, 0);
  }, [state.active_months]);

  const nextMilestoneLabel = useMemo(() => {
    if (state.active_months >= 12) return "—";
    if (state.active_months >= 6) return "12 meses";
    return "6 meses";
  }, [state.active_months]);

  const nextMilestoneTarget = useMemo(() => {
    if (state.active_months >= 6) return 12;
    return 6;
  }, [state.active_months]);

  // Only show 3m modal if it was freshly unlocked (not on default state load)
  const showMilestoneModal = state.milestone_3m_unlocked && !state.milestone_modal_seen && !state.milestone_6m_unlocked && state.active_months === 3 && state.total_active_days > 68;
  const show6MModal = state.milestone_6m_unlocked && !state.milestone_6m_modal_seen && !state.milestone_12m_unlocked;
  const show12MModal = state.milestone_12m_unlocked && !state.milestone_12m_modal_seen;

  const is3MPlus = state.milestone_3m_unlocked;
  const is6MPlus = state.milestone_6m_unlocked;
  const is12MPlus = state.milestone_12m_unlocked;

  const setMonths = useCallback((months: number) => {
    const m3 = months >= 3;
    const m6 = months >= 6;
    const m12 = months >= 12;
    update({
      active_months: months,
      total_active_days: months * 23,
      milestone_3m_unlocked: m3,
      milestone_6m_unlocked: m6,
      milestone_12m_unlocked: m12,
      milestone_modal_seen: m3 && !m6 ? false : state.milestone_modal_seen,
      milestone_6m_modal_seen: m6 && !m12 ? false : state.milestone_6m_modal_seen,
      milestone_12m_modal_seen: m12 ? false : true,
      benefit_unlocked: m3,
      benefit_6m_unlocked: m6,
      benefit_12m_unlocked: m12,
      high_value_client: m6,
      elite_status: m12,
      core_customer: m12,
      level: computeLevel(months, state.average_consistency),
      fragile_retention_flag: m3 && state.average_consistency < 50,
    });
  }, [update, state.milestone_modal_seen, state.milestone_6m_modal_seen, state.average_consistency]);

  const setConsistency = useCallback((avg: number) => {
    update({
      average_consistency: avg,
      fragile_retention_flag: state.milestone_3m_unlocked && avg < 50,
      level: computeLevel(state.active_months, avg),
    });
  }, [update, state.milestone_3m_unlocked, state.active_months]);

  const resetMilestone = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const initial: Milestone3MState = {
      ...defaultState,
      milestone_3m_unlocked: true,
      benefit_unlocked: true,
      level: "Proteção Ativa",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    setState(initial);
  }, []);

  return {
    state,
    showMilestoneModal,
    show6MModal,
    show12MModal,
    is3MPlus,
    is6MPlus,
    is12MPlus,
    monthsToNext,
    nextMilestoneLabel,
    nextMilestoneTarget,
    dismissModal,
    dismiss6MModal,
    dismiss12MModal,
    redeemBenefit,
    redeem6MBenefit,
    redeem12MBenefit,
    setMonths,
    setConsistency,
    resetMilestone,
  };
}
