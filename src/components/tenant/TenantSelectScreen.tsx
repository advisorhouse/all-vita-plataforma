import React from "react";
import { useTenant, type Tenant } from "@/contexts/TenantContext";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const TenantSelectScreen: React.FC = () => {
  const { availableTenants, setCurrentTenant, isSuperAdmin } = useTenant();

  const handleSelect = (tenant: Tenant) => {
    setCurrentTenant(tenant);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Selecionar Empresa</h1>
          <p className="text-sm text-muted-foreground">
            Escolha a empresa que deseja acessar
          </p>
        </div>

        <div className="space-y-3">
          {availableTenants.map((tenant) => (
            <Card
              key={tenant.id}
              className="cursor-pointer hover:border-accent/50 hover:shadow-md transition-all"
              onClick={() => handleSelect(tenant)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                {tenant.logo_url ? (
                  <img
                    src={tenant.logo_url}
                    alt={tenant.name}
                    className="h-10 w-10 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{tenant.name}</p>
                  <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isSuperAdmin && (
          <div className="pt-4 text-center">
            <a
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Acessar Painel All Vita
            </a>
          </div>
        )}

        <p className="text-center text-[11px] text-muted-foreground">
          Powered by Alvita
        </p>
      </motion.div>
    </div>
  );
};

export default TenantSelectScreen;
