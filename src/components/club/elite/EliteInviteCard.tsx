import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ChevronRight, Copy, Check } from "lucide-react";
import { t, t2 } from "@/lib/emotional-copy";

interface EliteInviteCardProps {
  canGenerateInvite: boolean;
  invitesRemaining: number;
  onGenerateInvite: () => string | null;
}

const EliteInviteCard: React.FC<EliteInviteCardProps> = ({
  canGenerateInvite,
  invitesRemaining,
  onGenerateInvite,
}) => {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const token = onGenerateInvite();
    if (token) {
      const link = `${window.location.origin}/invite/${token}`;
      setGeneratedLink(link);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-foreground">{t("elite_invite_title")}</h2>
        </div>

        {!generatedLink ? (
          <>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {t2("elite_invite_title")}
            </p>
            <Button
              onClick={handleGenerate}
              disabled={!canGenerateInvite}
              variant="outline"
              className="w-full rounded-xl h-11 text-sm"
            >
              {t("elite_invite_button")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            {invitesRemaining <= 2 && invitesRemaining > 0 && (
              <p className="text-[11px] text-muted-foreground text-center">
                {invitesRemaining} {invitesRemaining === 1 ? "convite restante" : "convites restantes"} este mês
              </p>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-[13px] text-muted-foreground">
              {t("elite_invite_ready")}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg bg-secondary px-3 py-2.5 text-[12px] text-foreground font-mono truncate">
                {generatedLink}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 h-9 w-9 p-0"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[12px] text-muted-foreground"
              onClick={() => {
                setGeneratedLink(null);
                setCopied(false);
              }}
            >
              Gerar outro convite
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default EliteInviteCard;
