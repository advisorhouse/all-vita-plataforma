import { useState, useCallback } from "react";

const STORAGE_KEY = "vl_elite_invite";

export interface EliteInviteState {
  invites: Array<{
    token: string;
    created_at: string;
    converted: boolean;
    convertee_retained: boolean;
  }>;
  total_invites_this_month: number;
  max_invites_per_month: number;
  benefit_earned: boolean;
  benefit_redeemed: boolean;
  can_invite: boolean;
  last_updated: string;
}

const defaultState: EliteInviteState = {
  invites: [],
  total_invites_this_month: 0,
  max_invites_per_month: 5,
  benefit_earned: false,
  benefit_redeemed: false,
  can_invite: true,
  last_updated: new Date().toISOString(),
};

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function useEliteInvite(eliteStatus: boolean, consistencyScore: number) {
  const [state, setState] = useState<EliteInviteState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultState, ...JSON.parse(stored) };
      } catch { /* corrupted */ }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return defaultState;
  });

  const update = useCallback((partial: Partial<EliteInviteState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial, last_updated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const eligible = eliteStatus && consistencyScore >= 70 && state.can_invite;
  const canGenerateInvite = eligible && state.total_invites_this_month < state.max_invites_per_month;

  const generateInvite = useCallback((): string | null => {
    if (!canGenerateInvite) return null;
    const token = generateToken();
    const newInvite = {
      token,
      created_at: new Date().toISOString(),
      converted: false,
      convertee_retained: false,
    };
    update({
      invites: [...state.invites, newInvite],
      total_invites_this_month: state.total_invites_this_month + 1,
    });
    return token;
  }, [canGenerateInvite, state.invites, state.total_invites_this_month, update]);

  const redeemBenefit = useCallback(() => {
    update({ benefit_redeemed: true });
  }, [update]);

  const resetInvites = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  return {
    state,
    eligible,
    canGenerateInvite,
    generateInvite,
    redeemBenefit,
    resetInvites,
  };
}
