import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricWidgetProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  delay?: number;
}

const MetricWidget: React.FC<MetricWidgetProps> = ({ title, value, subtitle, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-border bg-card p-5 vision-shadow"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-caption font-medium text-muted-foreground">{title}</p>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
    </motion.div>
  );
};

export default MetricWidget;
