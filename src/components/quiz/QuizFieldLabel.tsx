import React from "react";

interface Props {
  children: React.ReactNode;
  required?: boolean;
  icon?: React.ElementType;
}

const QuizFieldLabel: React.FC<Props> = ({ children, required = true, icon: Icon }) => (
  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
    {Icon && <Icon className="h-3 w-3" />}
    {children}
    {required && <span className="text-destructive">*</span>}
  </label>
);

export default QuizFieldLabel;
