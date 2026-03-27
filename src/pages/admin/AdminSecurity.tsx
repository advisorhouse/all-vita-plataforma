import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  ShieldCheck, AlertTriangle, Lock, Search, Filter,
  ChevronLeft, ChevronRight, ShieldAlert, Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const severityConfig: Record<string, { color: string; bg: string }> = {
  low: { color: "text-muted-foreground", bg: "bg-secondary" },
  medium: { color: "text-warning", bg: "bg-warning/10" },
  high: { color: "text-destructive", bg: "bg-destructive/10" },
  critical: { color: "text-destructive", bg: "bg-destructive/20" },
};

const AdminSecurity: React.FC = () => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-security-events", page, severityFilter, search],
    queryFn: async () => {
      let query = supabase
        .from("security_events")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (severityFilter !== "all") {
        query = query.eq("severity", severityFilter);
      }
      if (search) {
        query = query.ilike("type", `%${search}%`);
      }

      const { data: events, count } = await query;
      return { events: events || [], total: count || 0 };
    },
  });

  const events = data?.events || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Stats
  const { data: stats } = useQuery({
    queryKey: ["admin-security-stats"],
    queryFn: async () => {
      const { data: all } = await supabase.from("security_events").select("severity");
      const counts = { low: 0, medium: 0, high: 0, critical: 0 };
      all?.forEach((e) => {
        const s = (e.severity || "medium") as keyof typeof counts;
        if (counts[s] !== undefined) counts[s]++;
      });
      return { total: all?.length || 0, ...counts };
    },
  });

  return (
    <div className="space-y-6 pb-12">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" /> Segurança
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitoramento de eventos de segurança da plataforma
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats?.total || 0, icon: ShieldCheck, color: "text-foreground" },
            { label: "Baixo", value: stats?.low || 0, icon: Eye, color: "text-muted-foreground" },
            { label: "Médio", value: stats?.medium || 0, icon: AlertTriangle, color: "text-warning" },
            { label: "Alto", value: stats?.high || 0, icon: ShieldAlert, color: "text-destructive" },
            { label: "Crítico", value: stats?.critical || 0, icon: Lock, color: "text-destructive" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={cn("h-5 w-5", color)} />
                <div>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tipo de evento..."
                className="pl-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>
            <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="p-3 text-left font-medium text-muted-foreground">Data/Hora</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Severidade</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">IP</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => {
                  const sev = (evt.severity || "medium") as string;
                  const config = severityConfig[sev] || severityConfig.medium;
                  return (
                    <tr key={evt.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(evt.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3 text-xs font-medium text-foreground">{evt.type}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={cn("text-[10px]", config.color, config.bg)}>
                          {sev}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground font-mono">{evt.ip || "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                        {evt.user_id ? evt.user_id.slice(0, 8) + "..." : "—"}
                      </td>
                    </tr>
                  );
                })}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      {isLoading ? "Carregando..." : "Nenhum evento encontrado"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurity;
