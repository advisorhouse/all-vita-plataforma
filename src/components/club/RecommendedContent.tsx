import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  image?: string;
}

const mockContent: ContentItem[] = [
  {
    id: "1",
    title: "Como a luz azul afeta sua retina diariamente",
    category: "Saúde Digital",
    readTime: "4 min",
  },
  {
    id: "2",
    title: "5 hábitos para proteger a mácula após os 40",
    category: "Mácula",
    readTime: "6 min",
  },
  {
    id: "3",
    title: "A importância da luteína na longevidade visual",
    category: "Retina",
    readTime: "3 min",
  },
];

const RecommendedContent: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-6 vision-shadow"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Conteúdo Recomendado</h3>
            <p className="text-caption text-muted-foreground">Selecionado para você</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {mockContent.map((item) => (
          <button
            key={item.id}
            className="flex w-full items-center gap-4 rounded-xl bg-secondary/40 p-4 text-left transition-colors hover:bg-secondary/70"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/5">
              <BookOpen className="h-5 w-5 text-accent/60" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{item.category}</span>
                <span>·</span>
                <span>{item.readTime}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default RecommendedContent;
