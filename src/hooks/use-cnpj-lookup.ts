import { useState } from "react";
import { toast } from "sonner";

export interface CNPJData {
  razao_social: string;
  nome_fantasia: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  qsa: { nome: string }[];
}

export const useCNPJLookup = () => {
  const [loading, setLoading] = useState(false);

  const lookupCNPJ = async (cnpj: string): Promise<CNPJData | null> => {
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    if (cleanCNPJ.length !== 14) return null;

    setLoading(true);
    try {
      // Using BrasilAPI which is free and doesn't require a key for basic usage
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
      if (!response.ok) {
        throw new Error("CNPJ não encontrado ou erro na consulta.");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("CNPJ lookup error:", error);
      toast.error("Erro ao consultar CNPJ. Verifique se o número está correto.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { lookupCNPJ, loading };
};
