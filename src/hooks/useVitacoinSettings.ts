import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VitacoinSettings {
  conversionRate: number; // 1 Vitacoin = R$ X
  minRedemption: number;
  loading: boolean;
}

/**
 * Lê vitacoin_settings do tenant (com fallback para configuração global / defaults).
 * Alimenta o exemplo prático dinâmico no onboarding e onde mais for útil.
 */
export const useVitacoinSettings = (tenantId?: string | null): VitacoinSettings => {
  const [state, setState] = useState<VitacoinSettings>({
    conversionRate: 1,
    minRedemption: 10,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchSettings = async () => {
      // 1. tenta config do tenant atual
      let conversion = 1;
      let minRed = 10;

      if (tenantId) {
        const { data } = await supabase
          .from("vitacoin_settings")
          .select("conversion_rate, min_redemption")
          .eq("tenant_id", tenantId)
          .maybeSingle();

        if (data) {
          conversion = Number(data.conversion_rate) || 1;
          minRed = Number(data.min_redemption) || 10;
        } else {
          // 2. fallback: config global (tenant_id null)
          const { data: globalData } = await supabase
            .from("vitacoin_settings")
            .select("conversion_rate, min_redemption")
            .is("tenant_id", null)
            .maybeSingle();

          if (globalData) {
            conversion = Number(globalData.conversion_rate) || 1;
            minRed = Number(globalData.min_redemption) || 10;
          }
        }
      }

      if (!cancelled) {
        setState({ conversionRate: conversion, minRedemption: minRed, loading: false });
      }
    };

    fetchSettings();
    return () => { cancelled = true; };
  }, [tenantId]);

  return state;
};
