import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Stethoscope, Building2, CreditCard, Check,
  ChevronLeft, ChevronRight, ArrowRight,
  FileText, MapPin, User, Search, Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import InputMask from "react-input-mask";
import { useCNPJLookup } from "@/hooks/use-cnpj-lookup";
import { useCEPLookup } from "@/hooks/use-cep-lookup";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useCurrentPartner } from "@/hooks/useCurrentPartner";

interface ModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

const defaultData = {
  fullName: "", email: "", phone: "", phoneDdi: "+55", type: "PF" as "PF" | "PJ",
  cpf: "", rg: "", cnpj: "", socialName: "", tradingName: "", responsibleName: "",
  cep: "", street: "", number: "", complement: "", district: "", city: "", state: "SP",
  pixType: "CPF" as any, pixKey: "", bank: "", agency: "", account: "",
};

export const RegisterPartnerNetworkModal: React.FC<ModalProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const { currentTenant } = useTenant();
  const { data: currentPartner } = useCurrentPartner();
  const { lookupCNPJ, loading: loadingCNPJ } = useCNPJLookup();
  const { lookupCEP, loading: loadingCEP } = useCEPLookup();

  const update = (partial: any) => setData((d) => ({ ...d, ...partial }));

  const handleSubmit = async () => {
    if (!currentTenant || !currentPartner) return;
    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("manage-users/create", {
        headers: { "X-Tenant-Id": currentTenant.id },
        body: {
          email: data.email,
          full_name: data.fullName,
          phone: `${data.phoneDdi}${data.phone.replace(/\D/g, "")}`,
          role: "partner",
          partner_data: {
            ...data,
            parent_partner_id: currentPartner.id,
          },
        },
      });
      if (error || res?.error) throw error || new Error(res.error);
      toast.success("Convite enviado com sucesso!");
      onOpenChange(false);
      setData(defaultData);
    } catch (e: any) {
      toast.error("Erro ao enviar convite", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Indicar Novo Parceiro</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
           <Input placeholder="Nome Completo" value={data.fullName} onChange={(e) => update({ fullName: e.target.value })} />
           <Input placeholder="E-mail" value={data.email} onChange={(e) => update({ email: e.target.value })} />
           <Button onClick={handleSubmit} disabled={loading} className="w-full">
             {loading ? <Loader2 className="animate-spin" /> : "Enviar Convite"}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
