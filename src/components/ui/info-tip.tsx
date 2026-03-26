import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTipProps {
  text: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const InfoTip: React.FC<InfoTipProps> = ({ text, side = "top", className }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className={`inline-flex cursor-help ${className || ""}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3 w-3 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
        >
          <path
            fillRule="evenodd"
            d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </TooltipTrigger>
    <TooltipContent side={side} className="max-w-[240px] text-[11px] leading-relaxed">
      <p>{text}</p>
    </TooltipContent>
  </Tooltip>
);
