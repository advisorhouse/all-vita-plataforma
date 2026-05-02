import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { partnerRefStorage } from "@/hooks/usePartnerTracking";

/**
 * /q/:code → redireciona para o quiz público preservando o código do parceiro.
 * O `:code` é usado como `doctorCode` na rota do quiz (rastreabilidade da venda).
 */
const SaleRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!code) {
      navigate("/", { replace: true });
      return;
    }
    partnerRefStorage.set(code, "sale");
    navigate(`/quiz/${encodeURIComponent(code)}?ref=${encodeURIComponent(code)}`, {
      replace: true,
    });
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
};

export default SaleRedirect;
