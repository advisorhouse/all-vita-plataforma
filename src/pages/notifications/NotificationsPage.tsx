import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Filter, Inbox } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const typeBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  info: { label: "Info", variant: "secondary" },
  success: { label: "Sucesso", variant: "default" },
  warning: { label: "Aviso", variant: "outline" },
  error: { label: "Erro", variant: "destructive" },
  alert: { label: "Alerta", variant: "destructive" },
};

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");

  const filtered = tab === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.action_url) navigate(n.action_url);
  };

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Tudo em dia"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => markAllAsRead()}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Button>
        )}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="all" className="gap-1.5">
            <Inbox className="h-3.5 w-3.5" /> Todas
            <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Não lidas
            {unreadCount > 0 && (
              <Badge className="ml-1 text-[10px] h-5 px-1.5">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-2">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {tab === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((n, i) => (
              <motion.div key={n.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <Card
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/40",
                    !n.read && "border-l-2 border-l-accent"
                  )}
                  onClick={() => handleClick(n)}
                >
                  <CardContent className="flex items-start gap-4 py-4 px-5">
                    <div className={cn("mt-1 h-2.5 w-2.5 rounded-full shrink-0", !n.read ? "bg-accent" : "bg-muted")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn("text-sm leading-snug", !n.read ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                          {n.title}
                        </p>
                        {typeBadge[n.type] && (
                          <Badge variant={typeBadge[n.type].variant} className="text-[10px] h-5">
                            {typeBadge[n.type].label}
                          </Badge>
                        )}
                      </div>
                      {n.message && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground/70 mt-1.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                        {" · "}
                        {format(new Date(n.created_at), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
