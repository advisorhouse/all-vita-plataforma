import React from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Calendar, CreditCard,
  History, Activity, ArrowLeft, ShoppingBag,
  ExternalLink, CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientDetailProps {
  client: any;
  onBack: () => void;
}

const ClientDetailView: React.FC<ClientDetailProps> = ({ client, onBack }) => {
  // Static data for demonstration (to be replaced with real query in next step)
  const purchaseHistory = [
    { id: "1", date: "2026-03-15", product: "Vision Lift 9 Meses", amount: 1290.00, status: "pago" },
    { id: "2", date: "2026-02-15", product: "Vision Lift 9 Meses", amount: 1290.00, status: "pago" },
  ];

  const usageLogs = [
    { date: "Hoje, 09:30", event: "Marcou uso do produto", notes: "Vision Lift AM" },
    { date: "Ontem, 09:15", event: "Marcou uso do produto", notes: "Vision Lift AM" },
    { date: "2 dias atrás", event: "Acessou o App Shell", notes: "Visualizou conteúdos" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
          <p className="text-sm text-muted-foreground">ID do Paciente: {client.id}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Ativo no Club
          </Badge>
          <Button size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" /> Ações do Gateway
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Info Cards */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="h-2 bg-accent" />
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col items-center text-center pb-4 border-b border-border">
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-foreground mb-3">
                  {client.initials}
                </div>
                <h3 className="font-bold text-lg">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="leading-tight">Av. Paulista, 1000 - Bela Vista<br/>São Paulo, SP</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Membro desde Julho de 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Info */}
          <Card className="border-border shadow-sm bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Assinatura Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-white border border-accent/20">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Plano Contratado</p>
                <p className="text-base font-bold text-foreground">{client.plan}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Valor Mensal</span>
                  <span className="text-sm font-bold text-accent">R$ 1.290,00</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Próxima renovação</span>
                  <span className="font-bold text-foreground">{client.nextPayment}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ciclos concluídos</span>
                  <span className="font-bold text-foreground">8 de 9</span>
                </div>
                <Progress value={88} className="h-1.5 mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs/History */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white">Geral</TabsTrigger>
              <TabsTrigger value="purchases" className="data-[state=active]:bg-white">Compras</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-white">Uso do Produto</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Consistência</p>
                      <p className="text-xl font-bold text-foreground">{client.consistencyScore}%</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Vendas Geradas</p>
                      <p className="text-xl font-bold text-foreground">R$ 10.320</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <History className="h-4 w-4" /> Atividade Recente (App Club)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageLogs.map((log, i) => (
                      <div key={i} className="flex gap-4 items-start relative pb-4 last:pb-0">
                        {i !== usageLogs.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
                        )}
                        <div className="h-6 w-6 rounded-full bg-secondary border-2 border-white flex items-center justify-center shrink-0 z-10">
                          <div className="h-2 w-2 rounded-full bg-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-none">{log.event}</p>
                          <p className="text-xs text-muted-foreground mt-1">{log.notes}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {log.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases" className="mt-6">
              <Card className="border-border shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseHistory.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm font-medium">
                            {format(new Date(p.date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="text-sm">{p.product}</TableCell>
                          <TableCell className="text-sm font-bold text-foreground">
                            R$ {p.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100">
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6 text-center py-12 border-2 border-dashed border-border rounded-xl">
              <div className="max-w-xs mx-auto">
                <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h4 className="font-bold text-foreground">Nenhuma atividade anormal</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  O paciente está seguindo o protocolo de uso conforme recomendado nas últimas 4 semanas.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailView;
