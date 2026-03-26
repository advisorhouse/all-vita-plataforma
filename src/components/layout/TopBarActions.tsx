import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";

const NOTIFICATIONS = [
  { id: 1, text: "Novo cliente vinculado: João M.", time: "Há 2h", unread: true },
  { id: 2, text: "Comissão de R$ 67,00 confirmada.", time: "Há 5h", unread: true },
  { id: 3, text: "Live amanhã: Saúde Ocular 40+", time: "Há 1 dia", unread: false },
];

const TopBarActions: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;
  const isClub = location.pathname.startsWith("/club");
  const isCore = location.pathname.startsWith("/core");
  const settingsPath = isCore ? "/core/settings" : isClub ? "/club/settings" : "/partner/settings";

  return (
    <div className="fixed top-4 right-8 z-50 flex items-center gap-2">
      {/* Notifications */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary transition-colors shadow-sm">
            <Bell className="h-4 w-4 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                {unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-0">
          <div className="border-b border-border p-3">
            <p className="text-[13px] font-semibold text-foreground">Notificações</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-3 border-b border-border last:border-0 ${n.unread ? "bg-accent/5" : ""}`}>
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.unread ? "bg-accent" : "bg-transparent"}`} />
                <div>
                  <p className="text-[12px] text-foreground leading-snug">{n.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
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
