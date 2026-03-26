import { useState, useEffect, useCallback } from "react";

// Activation state stored in localStorage until auth is integrated
const STORAGE_KEY = "vl_activation";

export interface ActivationState {
  activated_at: string;
  day_counter: number;
  activation_completed: boolean;
  days_marked: number[];
  logins_count: number;
  content_consumed: number;
  activation_score: number;
  early_risk_flag: boolean;
  badge_first_week: boolean;
  last_login_at: string;
  welcome_modal_seen: boolean;
}

const defaultState: ActivationState = {
  activated_at: new Date().toISOString(),
  day_counter: 0,
  activation_completed: false,
  days_marked: [],
  logins_count: 1,
  content_consumed: 0,
  activation_score: 0,
  early_risk_flag: false,
  badge_first_week: false,
  last_login_at: new Date().toISOString(),
  welcome_modal_seen: false,
};

function getDaysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calculateScore(state: ActivationState): number {
  const markScore = Math.min(state.days_marked.length * 15, 45);
  const loginScore = Math.min(state.logins_count * 10, 30);
  const contentScore = Math.min(state.content_consumed * 25, 25);
  return Math.min(markScore + loginScore + contentScore, 100);
}

export function useActivationFlow() {
  const [state, setState] = useState<ActivationState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ActivationState;
        // Update day counter and login count on each load
        const dayCounter = Math.min(getDaysSince(parsed.activated_at), 7);
        const updated = {
          ...parsed,
          day_counter: dayCounter,
          logins_count: parsed.logins_count + 1,
          last_login_at: new Date().toISOString(),
        };
        updated.activation_score = calculateScore(updated);
        if (dayCounter >= 7) {
          updated.activation_completed = true;
          if (updated.days_marked.length >= 5) {
            updated.badge_first_week = true;
          }
          if (updated.activation_score < 40) {
            updated.early_risk_flag = true;
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      } catch {
        // corrupted, reset
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return defaultState;
  });

  const update = useCallback((partial: Partial<ActivationState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      next.activation_score = calculateScore(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const markDay = useCallback((day: number) => {
    setState((prev) => {
      if (prev.days_marked.includes(day)) return prev;
      const next = {
        ...prev,
        days_marked: [...prev.days_marked, day],
      };
      next.activation_score = calculateScore(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const dismissWelcome = useCallback(() => {
    update({ welcome_modal_seen: true });
  }, [update]);

  const consumeContent = useCallback(() => {
    update({ content_consumed: state.content_consumed + 1 });
  }, [update, state.content_consumed]);

  // For demo: allow resetting
  const resetActivation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  return {
    state,
    markDay,
    dismissWelcome,
    consumeContent,
    resetActivation,
    isActive: !state.activation_completed,
    currentDay: state.day_counter,
    consistencyPercent: state.days_marked.length > 0
      ? Math.round((state.days_marked.length / Math.max(state.day_counter, 1)) * 100)
      : 0,
  };
}
