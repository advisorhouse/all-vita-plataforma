import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Play, ArrowRight, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import cover1 from "@/assets/cover-1-1.jpg";
import cover2 from "@/assets/cover-1-2.jpg";
import cover3 from "@/assets/cover-1-3.jpg";
import cover4 from "@/assets/cover-2-1.jpg";

interface ContentItem {
  id: string;
  title: string;
  type: "article" | "video";
  duration: string;
  category: string;
  thumbnail: string;
}

const suggestedContent: ContentItem[] = [
  { id: "1", title: "Como a luz azul afeta sua retina", type: "video", duration: "3 min", category: "Saúde Digital", thumbnail: cover1 },
  { id: "2", title: "5 hábitos para proteger a mácula", type: "article", duration: "4 min", category: "Proteção", thumbnail: cover2 },
  { id: "3", title: "A importância da luteína", type: "article", duration: "3 min", category: "Nutrição Visual", thumbnail: cover3 },
];

interface ContentSuggestionsProps {
  onConsumeContent: () => void;
}

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({ onConsumeContent }) => {
  const navigate = useNavigate();

  const goToLibrary = () => {
    onConsumeContent();
    navigate("/club/content");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-4"
    >
      {/* Library banner — subtle foreground bg */}
      <button
        onClick={goToLibrary}
        className="w-full rounded-2xl bg-foreground p-5 text-left group transition-all hover:bg-foreground/90"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/15">
            <GraduationCap className="h-5 w-5 text-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-background">Biblioteca Educacional</p>
            <p className="text-[11px] text-background/60 mt-0.5">Vídeos, artigos e guias sobre saúde visual</p>
          </div>
          <ArrowRight className="h-4 w-4 text-background/50 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 mt-4">
          {[cover1, cover2, cover3, cover4].map((img, i) => (
            <div
              key={i}
              className="h-12 flex-1 rounded-lg overflow-hidden opacity-80"
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </button>

      {/* Suggested content list */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Para você</h2>
            </div>
            <button
              onClick={goToLibrary}
              className="text-[11px] text-accent font-medium hover:underline flex items-center gap-0.5"
            >
              Ver tudo <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {suggestedContent.map((item) => (
              <button
                key={item.id}
                onClick={goToLibrary}
                className="w-full flex items-center gap-3 rounded-xl bg-secondary/30 p-2.5 text-left transition-colors hover:bg-secondary/60"
              >
                <div className="relative h-12 w-[4.5rem] shrink-0 rounded-lg overflow-hidden bg-secondary">
                  <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                      <Play className="h-3.5 w-3.5 text-background ml-0.5" fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground leading-snug truncate">{item.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{item.category}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{item.duration}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContentSuggestions;
