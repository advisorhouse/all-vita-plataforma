import React from "react";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const highlights = [
  { name: "Ana C.", text: "Já sinto diferença após 2 meses de uso consistente!", days: 58 },
  { name: "Beatriz R.", text: "O calendário me ajuda a manter o hábito todos os dias.", days: 120 },
  { name: "Carla M.", text: "Atingi 21 dias seguidos pela primeira vez!", days: 21 },
];

const CommunityHighlight: React.FC = () => {
  const navigate = useNavigate();
  const highlight = highlights[new Date().getDate() % highlights.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
    >
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Comunidade</h2>
            </div>
            <div className="rounded-xl bg-secondary/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-semibold text-foreground">
                  {highlight.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[12px] font-medium text-foreground">{highlight.name}</p>
                  <p className="text-[10px] text-muted-foreground">{highlight.days} dias ativos</p>
                </div>
              </div>
              <p className="text-[13px] text-foreground/80 italic leading-relaxed">"{highlight.text}"</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/club/community")}
            className="w-full border-t border-border px-5 py-3 flex items-center justify-between text-left hover:bg-accent hover:text-accent-foreground transition-colors group"
          >
            <span className="text-[12px] font-medium text-muted-foreground group-hover:text-accent-foreground">Ver comunidade</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CommunityHighlight;
