import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight, Lock, BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTenant } from "@/contexts/TenantContext";
import { cn } from "@/lib/utils";

type Mode = "quiz" | "chat";

interface ProtocolConsentPageProps {
  mode?: Mode;
}

const ProtocolConsentPage: React.FC<ProtocolConsentPageProps> = ({ mode = "quiz" }) => {
  const { doctorCode } = useParams<{ doctorCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentTenant, loading: tenantLoading } = useTenant();
  const [accepted, setAccepted] = useState(false);

  // Persist referral if it arrives via URL
  useEffect(() => {
    const ref = searchParams.get("ref") || doctorCode;
    if (ref) {
      try { localStorage.setItem("allvita_partner_ref", ref.toString().toUpperCase()); } catch {}
    }
  }, [doctorCode, searchParams]);

  const tenantLogo = currentTenant?.logo_url;
  const tenantName = currentTenant?.trade_name || currentTenant?.name || "Sua marca";

  const handleAccept = () => {
    if (!accepted) return;
    const ref = searchParams.get("ref") || doctorCode || "";
    const params = new URLSearchParams();
    if (ref) params.set("ref", ref.toString());
    const qs = params.toString();

    const base = mode === "chat" ? "/chat" : "/quiz";
    const suffix = mode === "chat" ? "" : "/start";

    if (doctorCode) {
      navigate(`${base}/${doctorCode}${suffix}${qs ? `?${qs}` : ""}`);
    } else {
      navigate(`${base}${suffix}${qs ? `?${qs}` : ""}`);
    }
  };

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[520px] bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-black/5 p-8 sm:p-10"
      >
        {/* Tenant logo */}
        <div className="flex items-center justify-center mb-8 h-10">
          {tenantLogo ? (
            <img
              src={tenantLogo}
              alt={tenantName}
              className="max-h-10 max-w-[180px] object-contain"
            />
          ) : (
            <span className="text-base font-semibold tracking-wide text-foreground">
              {tenantName}
            </span>
          )}
        </div>

        {/* Shield icon */}
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 flex items-center justify-center">
            <ShieldCheck
              className="h-10 w-10"
              strokeWidth={1.5}
              style={{ color: "#D97757" }}
            />
          </div>
        </div>

        {/* Title & subtitle */}
        <h1 className="text-[26px] font-bold text-center text-[#1a1a1a] mb-3">
          Antes de começar
        </h1>
        <p className="text-[14px] text-center text-muted-foreground leading-relaxed mb-7 max-w-[400px] mx-auto">
          Para prosseguir com o diagnóstico, precisamos do seu consentimento sobre o uso dos seus dados.
        </p>

        {/* Consent box */}
        <label
          className={cn(
            "block bg-[#F5F2EE] rounded-xl p-5 cursor-pointer transition-colors mb-6",
            "hover:bg-[#EFEAE4]"
          )}
        >
          <div className="flex gap-3 items-start">
            <Checkbox
              checked={accepted}
              onCheckedChange={(v) => setAccepted(!!v)}
              className="mt-0.5 h-5 w-5 rounded-full border-muted-foreground/40 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
            />
            <p className="text-[13px] leading-[1.6] text-foreground/80">
              Li e concordo com o{" "}
              <Link to="#" className="font-semibold" style={{ color: "#D97757" }}>
                Termo de Consentimento para Telessaúde
              </Link>
              ,{" "}
              <Link to="#" className="font-semibold" style={{ color: "#D97757" }}>
                Política de dados pessoais
              </Link>
              ,{" "}
              <Link to="#" className="font-semibold" style={{ color: "#D97757" }}>
                Termos e condições de uso
              </Link>
              , autorizando a coleta e tratamento de meus dados pela{" "}
              <span className="font-semibold uppercase">{tenantName}</span>.
            </p>
          </div>
        </label>

        {/* CTA */}
        <Button
          onClick={handleAccept}
          disabled={!accepted}
          className={cn(
            "w-full h-14 rounded-xl text-[15px] font-medium transition-all",
            accepted
              ? "bg-[#1a1a1a] hover:bg-[#1a1a1a]/90 text-white"
              : "bg-[#B5B5B5] text-white cursor-not-allowed hover:bg-[#B5B5B5]"
          )}
        >
          Sim, eu concordo
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-5 mt-6">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" strokeWidth={1.5} />
            Dados criptografados
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <BadgeCheck className="h-3 w-3" strokeWidth={1.5} />
            LGPD compliant
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProtocolConsentPage;
