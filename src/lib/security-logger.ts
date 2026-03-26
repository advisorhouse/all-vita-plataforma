import { supabase } from "@/integrations/supabase/client";

/**
 * Logs access events (login, logout, password_change, etc.) to the access_logs table.
 * Non-blocking — errors are silently caught to avoid disrupting user flow.
 */
export async function logAccessEvent(
  action: string,
  metadata?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (supabase.from as any)("access_logs").insert({
      user_id: user.id,
      action,
      metadata: metadata || {},
    });
  } catch (e) {
    // Non-blocking
    console.warn("Access log failed:", e);
  }
}

/**
 * Logs a security event for fraud detection.
 */
export async function logSecurityEvent(
  type: string,
  metadata?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await (supabase.from as any)("security_events").insert({
      user_id: user?.id || null,
      type,
      metadata: metadata || {},
    });
  } catch (e) {
    console.warn("Security event log failed:", e);
  }
}
