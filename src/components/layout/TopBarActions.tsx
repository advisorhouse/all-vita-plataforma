import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Settings, Check, CheckCheck, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const typeColor: Record<string, string> = {
  info: "bg-accent",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-destructive",
  alert: "bg-destructive",
};

const TopBarActions: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const isAdmin = location.pathname.startsWith("/admin");
  const isCore = location.pathname.startsWith("/core");
  const isClub = location.pathname.startsWith("/club");
  const settingsPath = isAdmin
    ? "/admin/settings"
    : isCore
    ? "/core/settings"
    : isClub
    ? "/club/settings"
    : "/partner/settings";

  const handleNotificationClick = (n: { id: string; read: boolean; action_url: string | null }) => {
    if (!n.read) markAsRead(n.id);
    if (n.action_url) {
      setOpen(false);
      navigate(n.action_url);
    }
  };

  return (
    <div className="fixed top-4 right-8 z-50 flex items-center gap-2">
      {/* Notifications */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary transition-colors shadow-sm">
            <Bell className="h-4 w-4 text-foreground" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-0.5 text-[9px] font-bold text-accent-foreground"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between border-b border-border p-3">
            <p className="text-[13px] font-semibold text-foreground">Notificações</p>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="h-3 w-3" /> Marcar todas
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-80">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "flex w-full items-start gap-3 p-3 border-b border-border last:border-0 text-left transition-colors hover:bg-muted/50",
                    !n.read && "bg-accent/5"
                  )}
                >
                  <div className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", !n.read ? (typeColor[n.type] || "bg-accent") : "bg-transparent")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground leading-snug truncate">{n.title}</p>
                    {n.message && (
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {n.action_url && <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />}
                </button>
              ))
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[11px] text-muted-foreground"
                onClick={() => {
                  setOpen(false);
                  const basePath = isAdmin ? "/admin" : isCore ? "/core" : isClub ? "/club" : "/partner";
                  navigate(`${basePath}/notifications`);
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Settings */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => navigate(settingsPath)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary transition-colors shadow-sm"
          >
            <Settings className="h-4 w-4 text-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[11px]">Configurações</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TopBarActions;
