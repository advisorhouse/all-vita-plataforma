import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProductTour } from "./useProductTour";

/**
 * Controla a exibição do onboarding educacional do partner.
 * Persistido em profiles.partner_onboarding_seen — independente do tour de tooltips.
 */
export const usePartnerOnboarding = () => {
  const { user } = useAuth();
  const { startTour } = useProductTour();
  const [seen, setSeen] = useState<boolean | null>(null);
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("partner_onboarding_seen")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setSeen(Boolean(data?.partner_onboarding_seen));
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const markAsSeen = useCallback(async () => {
    if (!user) return;
    
    // Atualiza no banco
    const { error } = await supabase
      .from("profiles")
      .update({ partner_onboarding_seen: true })
      .eq("id", user.id);
    
    if (!error) {
      setSeen(true);
      setForceOpen(false);
      
      // Dispara o tour explicativo (tooltips) IMEDIATAMENTE após o fechamento do onboarding
      setTimeout(() => {
        startTour();
      }, 500);
    }
  }, [user, startTour]);

  const reopen = useCallback(() => setForceOpen(true), []);

  const shouldShow = forceOpen || seen === false;

  return { shouldShow, markAsSeen, reopen, loaded: seen !== null };
};
