import React from "react";

const AdminTenants: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerenciar tenants cadastrados na plataforma
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p className="text-sm">Gestão de empresas será construída aqui.</p>
      </div>
    </div>
  );
};

export default AdminTenants;
