import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Zap, ShoppingCart, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface ResultLevel {
  max: number;
  label: string;
  color: string;
  message: string;
}

interface Props {
  score: number;
  tenantLogo?: string | null;
  tenantName?: string;
  title: string;
  subtitle: string;
  levels: ResultLevel[];
  productEyebrow: string;
  productName: string;
  productPoweredBy: string;
  ctaLabel: string;
  ctaUrl: string;
  disclaimer: string;
}

const QuizStepResult: React.FC<Props> = ({
  score, title, subtitle, levels, productEyebrow, productName,
  productPoweredBy, ctaLabel, ctaUrl, disclaimer,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [syncing, setSyncing] = React.useState(false);

  const sorted = [...levels].sort((a, b) => a.max - b.max);
...
  const offset = circumference - (score / 100) * circumference;

  const handleCta = async () => {
    // If it's already a full URL, open it
    if (ctaUrl && (ctaUrl.startsWith("http://") || ctaUrl.startsWith("https://"))) {
      window.open(ctaUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // If it's a relative path (likely /checkout/:productId), navigate to it
    if (ctaUrl && ctaUrl.startsWith("/")) {
      const ref = searchParams.get("ref") || localStorage.getItem("allvita_partner_ref");
      const qs = ref ? `?ref=${ref}` : "";
      navigate(`${ctaUrl}${qs}`);
      return;
    }

    // Fallback: If no URL is set, try to find the first synced product for this tenant
    setSyncing(true);
    try {
      const { data: products } = await supabase
        .from("products")
        .select("id, checkout_url")
        .not("pagarme_product_id", "is", null)
        .limit(1);

      if (products && products.length > 0) {
        const ref = searchParams.get("ref") || localStorage.getItem("allvita_partner_ref");
        const qs = ref ? `?ref=${ref}` : "";
        
        if (products[0].checkout_url) {
          navigate(`${products[0].checkout_url}${qs}`);
        } else {
          navigate(`/checkout/${products[0].id}${qs}`);
        }
      } else {
        window.alert("Nenhum produto disponível para compra no momento.");
      }
    } catch (err) {
      console.error("Error finding product:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1a1a1a] leading-tight">{title}</h2>
        <p className="text-[13px] text-muted-foreground mt-2 max-w-[440px] mx-auto">{subtitle}</p>
      </div>

      {/* Score circle */}
      <div className="flex flex-col items-center">
        <div className="relative h-44 w-44">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" stroke="#EFEAE4" strokeWidth="10" fill="none" />
            <circle
              cx="80" cy="80" r="70" stroke={color} strokeWidth="10" fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[44px] font-bold leading-none" style={{ color }}>{score}</span>
            <span className="text-[11px] text-muted-foreground mt-1">de 100</span>
          </div>
        </div>

        <div
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.8} />
          {level?.label}
        </div>
      </div>

      {/* Message */}
      <div className="bg-[#F7F4EF] border border-black/5 rounded-xl p-5">
        <p className="text-[13px] font-semibold text-foreground mb-2">O que isso significa:</p>
        {level?.message.split("\n\n").map((para, i) => (
          <p key={i} className="text-[13px] text-muted-foreground leading-relaxed mb-2 last:mb-0">
            {i === 0 && <Zap className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color }} />}
            {para}
          </p>
        ))}
      </div>

      {/* Product CTA */}
      <div className="bg-[#F2EDE6] border border-black/5 rounded-xl p-5 text-center">
        <p className="text-[11px] font-bold tracking-wider mb-2" style={{ color }}>{productEyebrow}</p>
        <h3 className="text-[18px] font-bold text-[#1a1a1a]">{productName}</h3>
        {productPoweredBy && (
          <p className="text-[11px] text-muted-foreground mt-1 mb-4">{productPoweredBy}</p>
        )}
        <button
          onClick={handleCta}
          disabled={syncing}
          className="mt-2 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 h-12 rounded-xl text-white font-medium text-sm shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: color }}
        >
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" strokeWidth={2} />}
          {ctaLabel}
          {!syncing && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground text-center max-w-[480px] mx-auto leading-relaxed" style={{ color: `${color}DD` }}>
        {disclaimer}
      </p>
    </motion.div>
  );
};

export default QuizStepResult;
