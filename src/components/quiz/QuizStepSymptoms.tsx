import React from "react";
import { Droplet, Eye, Brain, Sun, AlertTriangle, Sparkles, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Droplet, Eye, Brain, Sun, AlertTriangle, Sparkles,
};

export interface SymptomOption {
  icon: string;
  title: string;
  description: string;
}

interface Props {
  title: string;
  subtitle: string;
  options: SymptomOption[];
  value: string[];
  onChange: (v: string[]) => void;
}

const QuizStepSymptoms: React.FC<Props> = ({ title, subtitle, options, value, onChange }) => {
  const toggle = (label: string) => {
    if (value.includes(label)) onChange(value.filter((v) => v !== label));
    else onChange([...value, label]);
  };

  return (
    <div>
      <h2 className="text-[18px] font-bold text-[#1a1a1a] leading-tight mb-2">{title}</h2>
      <p className="text-[13px] text-muted-foreground mb-6">{subtitle}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, i) => {
          const Icon = ICON_MAP[opt.icon] || Sparkles;
          const selected = value.includes(opt.title);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(opt.title)}
              className={cn(
                "text-left rounded-xl bg-[#F5F2EE] hover:bg-[#EFEAE4] p-4 transition-colors flex items-start gap-3",
                selected && "ring-2 ring-[#D97757] bg-[#EFEAE4]"
              )}
            >
              <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#1a1a1a] leading-tight">{opt.title}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizStepSymptoms;
