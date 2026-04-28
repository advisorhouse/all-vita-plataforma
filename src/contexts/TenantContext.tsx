import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface Tenant {
  id: string;
  name: string;
  trade_name: string | null;
  slug: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  domain: string | null;
  active: boolean;
  settings: Record<string, any>;
}

export interface Membership {
  id: string;
  user_id: string;
  tenant_id: string | null;
  role: "super_admin" | "admin" | "manager" | "partner" | "client";
  active: boolean;
  tenant?: Tenant;
}

interface TenantContextValue {
  currentTenant: Tenant | null;
  isLoading: boolean;
  memberships: Membership[];
  activeMembership: Membership | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  setMemberships: (memberships: Membership[]) => void;
  setIsLoading: (loading: boolean) => void;
  switchTenant: (tenantId: string) => void;
  isSuperAdmin: boolean;
  userRole: Membership["role"] | null;
  platformRole: string | null;
  setPlatformRole: (role: string | null) => void;
  setIsSuperAdmin: (is: boolean) => void;
  availableTenants: Tenant[];
  isSubdomainAccess: boolean;
  setIsSubdomainAccess: (v: boolean) => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

const TENANT_STORAGE_KEY = "allvita_active_tenant";

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isSubdomainAccess, setIsSubdomainAccess] = useState(false);

  // We will derive isSuperAdmin and platform staff status 
  // from a separate effect that checks all_vita_staff
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [platformRole, setPlatformRole] = useState<string | null>(null);

  const activeMembership = currentTenant
    ? memberships.find((m) => m.tenant_id === currentTenant.id && m.active) || null
    : isSuperAdmin
      ? { role: "super_admin", tenant_id: null, active: true } as any
      : null;

  const userRole = activeMembership?.role || null;

  const availableTenants = memberships
    .filter((m) => m.tenant && m.active)
    .map((m) => m.tenant!)
    .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);

  const setCurrentTenant = useCallback((tenant: Tenant | null) => {
    setCurrentTenantState(tenant);
    if (tenant) {
      localStorage.setItem(TENANT_STORAGE_KEY, tenant.id);
    } else {
      localStorage.removeItem(TENANT_STORAGE_KEY);
    }
  }, []);

  const switchTenant = useCallback(
    (tenantId: string) => {
      const tenant = availableTenants.find((t) => t.id === tenantId);
      if (tenant) {
        setCurrentTenant(tenant);
      }
    },
    [availableTenants, setCurrentTenant]
  );

  // Restore tenant from storage on memberships change
  useEffect(() => {
    if (memberships.length === 0) return;

    const storedTenantId = localStorage.getItem(TENANT_STORAGE_KEY);
    const tenants = memberships
      .filter((m) => m.tenant && m.active)
      .map((m) => m.tenant!);

    if (storedTenantId) {
      const stored = tenants.find((t) => t.id === storedTenantId);
      if (stored) {
        setCurrentTenantState(stored);
        return;
      }
    }

    // Auto-select if single tenant
    if (tenants.length === 1 && !isSuperAdmin) {
      setCurrentTenant(tenants[0]);
    }
  }, [memberships, isSuperAdmin, setCurrentTenant]);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        isLoading,
        memberships,
        activeMembership,
        setCurrentTenant,
        setMemberships,
        setIsLoading,
        switchTenant,
        isSuperAdmin,
        userRole,
        availableTenants,
        isSubdomainAccess,
        setIsSubdomainAccess,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextValue => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
};
