import React from "react";

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Painel Alvita</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da plataforma multi-tenant
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p className="text-sm">Dashboard do super admin será construído aqui.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
