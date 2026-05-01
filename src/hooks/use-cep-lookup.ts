import { useState } from "react";
import { toast } from "sonner";

export interface CEPResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export const useCEPLookup = () => {
  const [loading, setLoading] = useState(false);

  const lookupCEP = async (cep: string): Promise<CEPResult | null> => {
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length !== 8) return null;

    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data: CEPResult = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado.");
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching CEP:", error);
      toast.error("Erro ao buscar o CEP.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { lookupCEP, loading };
};
