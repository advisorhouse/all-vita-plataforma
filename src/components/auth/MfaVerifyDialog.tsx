import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

interface MfaVerifyDialogProps {
  open: boolean;
  factorId: string;
  onVerified: () => void;
  onCancel: () => void;
}

const MfaVerifyDialog: React.FC<MfaVerifyDialogProps> = ({
  open,
  factorId,
  onVerified,
  onCancel,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Insira o código de 6 dígitos");
      return;
    }

    setLoading(true);
    try {
      // In this app, "factorId" is being passed as the phone number for SMS verification
      const { error } = await supabase.auth.verifyOtp({
        phone: factorId,
        token: code,
        type: 'sms'
      });
      
      if (error) throw error;

      onVerified();
    } catch {
      toast.error("Código inválido ou expirado. Tente novamente.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: factorId });
      if (error) throw error;
      toast.success("Novo código enviado por SMS!");
    } catch (err: any) {
      toast.error("Erro ao reenviar: " + err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle>Verificação em duas etapas</DialogTitle>
          <DialogDescription>
            Insira o código enviado por SMS para seu celular
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Código SMS</Label>
            <Input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              className="text-center text-lg tracking-widest"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verificando..." : "Verificar"}
          </Button>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="w-full text-xs"
            onClick={handleResend}
          >
            Não recebeu o código? Reenviar SMS
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MfaVerifyDialog;
