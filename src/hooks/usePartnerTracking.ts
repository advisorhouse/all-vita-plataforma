import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Hook to capture and persist partner referral codes from the URL.
 * Looks for ?ref= or ?partner= query parameters.
 */
export function usePartnerTracking() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("partner");
    
    if (ref) {
      console.log(`[PartnerTracking] Referral code detected: ${ref}`);
      // Store in localStorage for attribution during conversion
      localStorage.setItem("allvita_partner_ref", ref);
      
      // Also store timestamp of last click
      localStorage.setItem("allvita_partner_ref_at", new Date().toISOString());
      
      // Optional: You could also fire an event to a Supabase edge function 
      // here to track the click in real-time if needed.
    }
  }, [searchParams]);

  return {
    getReferralCode: () => localStorage.getItem("allvita_partner_ref"),
    clearReferralCode: () => {
      localStorage.removeItem("allvita_partner_ref");
      localStorage.removeItem("allvita_partner_ref_at");
    }
  };
}
