import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Shield, Lock, FileText, Loader2 } from "lucide-react";

type Step = "change_password" | "accept_terms" | "complete";

const AdminOnboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("change_password");
  const [loading, setLoading] = useState(false);

  // Password step
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Terms step
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("must_change_password, onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profile?.onboarding_completed) {
      navigate("/core");
      return;
    }
    if (!profile?.must_change_password) {
      // Check if terms are accepted
      const { data: consents } = await supabase
        .from("user_consents")
        .select("type")
        .eq("user_id", user.id);

      const types = consents?.map((c: any) => c.type) || [];
      if (types.includes("terms_of_use") && types.includes("privacy_policy")) {
        setStep("complete");
      } else {
        setStep("accept_terms");
      }
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("Erro ao alterar senha", { description: error.message });
      setLoading(false);
      return;
    }
    // Update profile
    await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", user!.id);

    toast.success("Senha alterada com sucesso!");
    setStep("accept_terms");
    setLoading(false);
  };

  const handleAcceptTerms = async () => {
    if (!termsAccepted || !privacyAccepted) {
      toast.error("Você deve aceitar todos os termos para continuar");
      return;
    }
    setLoading(true);

    const consents = [
      { user_id: user!.id, type: "terms_of_use" },
      { user_id: user!.id, type: "privacy_policy" },
    ];

    const { error } = await supabase.from("user_consents").upsert(consents, {
      onConflict: "user_id,type",
    });

    if (error) {
      toast.error("Erro ao registrar aceite", { description: error.message });
      setLoading(false);
      return;
    }

    // Mark onboarding complete
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user!.id);

    toast.success("Onboarding concluído!");
    setStep("complete");
    setLoading(false);
    navigate("/core");
  };

  if (step === "change_password") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Troca de senha obrigatória</CardTitle>
            <CardDescription>
              Para sua segurança, defina uma nova senha para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar senha</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button onClick={handleChangePassword} className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "accept_terms") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Termos e Condições</CardTitle>
            <CardDescription>
              Para continuar, você precisa aceitar os termos de uso e a política de privacidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(v) => setTermsAccepted(v === true)}
                />
                <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  Li e aceito os <a href="#" className="text-primary underline">Termos de Uso</a> da plataforma All Vita.
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy"
                  checked={privacyAccepted}
                  onCheckedChange={(v) => setPrivacyAccepted(v === true)}
                />
                <label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                  Li e aceito a <a href="#" className="text-primary underline">Política de Privacidade</a> da plataforma All Vita.
                </label>
              </div>
            </div>
            <Button onClick={handleAcceptTerms} className="w-full" disabled={loading || !termsAccepted || !privacyAccepted}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Aceitar e Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Tudo pronto!</CardTitle>
          <CardDescription>Seu acesso foi configurado com segurança.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/core")} className="w-full">
            Acessar o Painel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOnboarding;
