import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { t, t2 } from "@/lib/emotional-copy";

const InviteLanding: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm text-center space-y-8"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.2 }}
          className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-foreground/5 mx-auto"
        >
          <Shield className="h-10 w-10 text-foreground" strokeWidth={1.5} />
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("elite_landing_title")}
          </h1>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            {t2("elite_landing_title")}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <Button
            onClick={() => navigate(`/activate?ref=${token}`)}
            className="w-full rounded-xl h-12 text-[15px] font-medium bg-foreground text-background hover:bg-foreground/90"
          >
            {t("elite_landing_button")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>

        {/* Subtle branding */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-[11px] text-muted-foreground/50"
        >
          Vision Lift · Proteção visual contínua
        </motion.p>
      </motion.div>
    </div>
  );
};

export default InviteLanding;
