import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Authenticate user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonRes(401, { error: "Unauthorized" });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await userClient.auth.getUser(token);
  if (claimsError || !claimsData?.user) {
    return jsonRes(401, { error: "Invalid token" });
  }

  const userId = claimsData.user.id;
  const adminClient = createClient(supabaseUrl, serviceKey);

  // Parse URL path: /tenant-api/v1/{resource}[/{id}]
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Expected: ["tenant-api", "v1", resource, ...rest]
  const resource = pathParts[2] || "";
  const resourceId = pathParts[3] || null;

  // Get tenant_id from header
  const tenantId = req.headers.get("X-Tenant-Id");

  // Helper to check permissions using the unified RBAC function
  const checkPermission = async (res: string, act: string, tId: string | null) => {
    const { data: allowed, error: rpcError } = await adminClient.rpc('can', {
      _user_id: userId,
      _resource: res,
      _action: act,
      _tenant_id: tId
    });
    if (rpcError) {
      console.error(`[RBAC] Error checking ${res}:${act} for user ${userId}:`, rpcError);
      return false;
    }
    return !!allowed;
  };

  // Determine user role and primary tenant access
  // We still need to know the role for some scoping logic later in handleGet
  const { data: memberships } = await adminClient
    .from("memberships")
    .select("tenant_id, role")
    .eq("user_id", userId)
    .eq("active", true);

  const { data: platformStaff } = await adminClient
    .from("all_vita_staff")
    .select("role")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  const isSuperAdmin = platformStaff?.role === "super_admin";
  const tenantMembership = memberships?.find((m: any) => m.tenant_id === tenantId);
  const userRole = isSuperAdmin ? "admin" : (tenantMembership?.role || null);

  if (!isSuperAdmin && tenantId) {
    const hasTenantAccess = memberships?.some((m: any) => m.tenant_id === tenantId);
    if (!hasTenantAccess) {
      return jsonRes(403, { error: "Access denied to this tenant" });
    }
  }

  // Check permission via unified RBAC
  const action = methodToAction(req.method);
  const mappedRes = mapResource(resource);
  const isAllowed = await checkPermission(mappedRes, action, tenantId);

  if (!isAllowed) {
    return jsonRes(403, { error: `No permission: ${action} on ${resource}` });
  }

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(adminClient, resource, resourceId, tenantId, userId, userRole);
      case "POST":
        return await handlePost(adminClient, resource, tenantId, userId, await req.json());
      case "PUT":
      case "PATCH":
        return await handleUpdate(adminClient, resource, resourceId, tenantId, await req.json());
      case "DELETE":
        return await handleDelete(adminClient, resource, resourceId, tenantId);
      default:
        return jsonRes(405, { error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API error:", error);
    return jsonRes(500, { error: error.message });
  }
});

async function handleGet(client: any, resource: string, id: string | null, tenantId: string | null, userId: string, role: string) {
  const table = mapResource(resource);
  let query = client.from(table).select("*");

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  // Scope for partner/client roles
  if (role === "partner" && ["partners", "mt_commissions", "referrals"].includes(table)) {
    const { data: partner } = await client
      .from("partners")
      .select("id")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .single();
    if (partner && table === "partners") {
      // Will be filtered by RLS
    } else if (partner) {
      query = query.eq("partner_id", partner.id);
    }
  }

  if (role === "client" && table === "clients") {
    query = query.eq("user_id", userId);
  }

  if (id) {
    query = query.eq("id", id).single();
  } else {
    query = query.limit(100);
  }

  const { data, error } = await query;
  if (error) return jsonRes(400, { error: error.message });
  return jsonRes(200, { data });
}

async function handlePost(client: any, resource: string, tenantId: string | null, userId: string, body: any) {
  const table = mapResource(resource);
  const insertData = { ...body, tenant_id: tenantId };

  const { data, error } = await client.from(table).insert(insertData).select().single();
  if (error) return jsonRes(400, { error: error.message });
  return jsonRes(201, { data });
}

async function handleUpdate(client: any, resource: string, id: string | null, tenantId: string | null, body: any) {
  if (!id) return jsonRes(400, { error: "Resource ID required" });
  const table = mapResource(resource);

  let query = client.from(table).update(body).eq("id", id);
  if (tenantId) query = query.eq("tenant_id", tenantId);

  const { data, error } = await query.select().single();
  if (error) return jsonRes(400, { error: error.message });
  return jsonRes(200, { data });
}

async function handleDelete(client: any, resource: string, id: string | null, tenantId: string | null) {
  if (!id) return jsonRes(400, { error: "Resource ID required" });
  const table = mapResource(resource);

  let query = client.from(table).delete().eq("id", id);
  if (tenantId) query = query.eq("tenant_id", tenantId);

  const { error } = await query;
  if (error) return jsonRes(400, { error: error.message });
  return jsonRes(200, { success: true });
}

function mapResource(resource: string): string {
  const map: Record<string, string> = {
    tenants: "tenants",
    users: "memberships",
    memberships: "memberships",
    partners: "partners",
    clients: "clients",
    content: "content",
    commissions: "mt_commissions",
    referrals: "referrals",
    gamification: "gamification",
  };
  return map[resource] || resource;
}

function methodToAction(method: string): string {
  switch (method) {
    case "GET": return "read";
    case "POST": return "create";
    case "PUT":
    case "PATCH": return "update";
    case "DELETE": return "delete";
    default: return "read";
  }
}

function jsonRes(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-id",
      "Content-Type": "application/json",
    },
  });
}
