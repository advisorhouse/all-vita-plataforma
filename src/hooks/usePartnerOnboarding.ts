import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Controla a exibição do onboarding educacional do partner.
 * Persistido em profiles.partner_onboarding_seen — independente do tour de tooltips.
 */
export const usePartnerOnboarding = () => {
  const { user } = useAuth();
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
    await supabase
      .from("profiles")
      .update({ partner_onboarding_seen: true })
      .eq("id", user.id);
    setSeen(true);
    setForceOpen(false);
  }, [user]);

  const reopen = useCallback(() => setForceOpen(true), []);

  const shouldShow = forceOpen || seen === false;

  return { shouldShow, markAsSeen, reopen, loaded: seen !== null };
};
