import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShieldCheck, Copy, CheckCircle2, Loader2 } from "lucide-react";

const MfaSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkAndEnroll();
  }, [user]);

  const checkAndEnroll = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactors = factors?.totp || [];
      const verified = totpFactors.find((f: any) => f.status === "verified");

      if (verified) {
        setAlreadyEnrolled(true);
        setLoading(false);
        return;
      }

      // Unenroll any unverified factors first
      for (const f of totpFactors.filter((f: any) => f.status === "unverified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "All Vita Authenticator",
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (err: any) {
      toast.error("Erro ao configurar 2FA: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCode.length !== 6) {
      toast.error("Insira o código de 6 dígitos");
      return;
    }

    setVerifying(true);
    try {
      const { data: challenge, error: challengeErr } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeErr) throw challengeErr;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode,
      });
      if (verifyErr) throw verifyErr;

      toast.success("2FA ativado com sucesso!");
      navigate(-1);
    } catch (err: any) {
      toast.error("Código inválido. Tente novamente.");
    } finally {
      setVerifying(false);
    }
  };

  const handleUnenroll = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = factors?.totp?.find((f) => f.status === "verified");
      if (!verified) return;

      const { error } = await supabase.auth.mfa.unenroll({ factorId: verified.id });
      if (error) throw error;

      toast.success("2FA desativado");
      setAlreadyEnrolled(false);
      checkAndEnroll();
    } catch (err: any) {
      toast.error("Erro ao desativar 2FA: " + err.message);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <ShieldCheck className="h-10 w-10 mx-auto text-primary mb-2" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Autenticação em Duas Etapas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Proteja sua conta com um segundo fator de segurança
          </p>
        </div>

        {alreadyEnrolled ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <p className="font-medium">2FA já está ativado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sua conta está protegida com autenticação em duas etapas.
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Voltar
                </Button>
                <Button variant="destructive" onClick={handleUnenroll}>
                  Desativar 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurar TOTP</CardTitle>
              <CardDescription>
                Escaneie o QR Code com seu aplicativo autenticador (Google Authenticator, Authy, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {qrCode && (
                <div className="flex justify-center">
                  <img
                    src={qrCode}
                    alt="QR Code para 2FA"
                    className="w-48 h-48 rounded-lg border border-border"
                  />
                </div>
              )}

              {secret && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Ou insira manualmente:
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-muted p-2 rounded font-mono break-all">
                      {secret}
                    </code>
                    <Button size="icon" variant="ghost" onClick={copySecret}>
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de verificação</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-lg tracking-widest"
                    value={verifyCode}
                    onChange={(e) =>
                      setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={verifying}>
                  {verifying ? "Verificando..." : "Ativar 2FA"}
                </Button>
              </form>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default MfaSetupPage;
