import { supabase } from "@/integrations/supabase/client";

/**
 * Logs a structured audit event to the audit_logs table.
 * Non-blocking — errors are silently caught.
 */
export async function logAuditEvent(params: {
  action: string;
  actorType?: string;
  entityType?: string;
  entityId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  tenantId?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (supabase.from as any)("audit_logs").insert({
      user_id: user.id,
      tenant_id: params.tenantId || null,
      actor_type: params.actorType || "system",
      action: params.action,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      old_data: params.oldData || {},
      new_data: params.newData || {},
      details: params.metadata || {},
    });
  } catch (e) {
    console.warn("Audit log failed:", e);
  }
}

/**
 * Creates a version snapshot for critical entities.
 * Non-blocking.
 */
export async function createEntityVersion(params: {
  entityType: string;
  entityId: string;
  dataSnapshot: Record<string, any>;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await (supabase.from as any)("entity_versions").insert({
      entity_type: params.entityType,
      entity_id: params.entityId,
      data_snapshot: params.dataSnapshot,
      changed_by: user?.id || null,
    });
  } catch (e) {
    console.warn("Entity version failed:", e);
  }
}
