import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const REF_KEY = "allvita_partner_ref";
const REF_AT_KEY = "allvita_partner_ref_at";
const REF_SOURCE_KEY = "allvita_partner_ref_source";

/**
 * Hook to capture and persist partner referral codes from the URL.
 * Looks for ?ref= or ?partner= query parameters.
 *
 * The same referral code is reused for two purposes (the route decides intent):
 *  - "/r/<code>"  → recruit (new partner joining the network)
 *  - "/q/<code>"  → sale    (new client buying the product)
 */
export function usePartnerTracking() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("partner");
    const source = searchParams.get("ref_source");

    if (ref) {
      const upper = ref.toUpperCase();
      console.log(`[PartnerTracking] Referral code detected: ${upper}`);
      localStorage.setItem(REF_KEY, upper);
      localStorage.setItem(REF_AT_KEY, new Date().toISOString());
      if (source) localStorage.setItem(REF_SOURCE_KEY, source);
    }
  }, [searchParams]);

  return {
    getReferralCode: () => localStorage.getItem(REF_KEY),
    getReferralSource: () => localStorage.getItem(REF_SOURCE_KEY),
    clearReferralCode: () => {
      localStorage.removeItem(REF_KEY);
      localStorage.removeItem(REF_AT_KEY);
      localStorage.removeItem(REF_SOURCE_KEY);
    },
  };
}

/** Static helpers (no React context required). */
export const partnerRefStorage = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem(REF_KEY) : null),
  getSource: () =>
    typeof window !== "undefined" ? localStorage.getItem(REF_SOURCE_KEY) : null,
  set: (code: string, source?: "recruit" | "sale") => {
    localStorage.setItem(REF_KEY, code.toUpperCase());
    localStorage.setItem(REF_AT_KEY, new Date().toISOString());
    if (source) localStorage.setItem(REF_SOURCE_KEY, source);
  },
  clear: () => {
    localStorage.removeItem(REF_KEY);
    localStorage.removeItem(REF_AT_KEY);
    localStorage.removeItem(REF_SOURCE_KEY);
  },
};
