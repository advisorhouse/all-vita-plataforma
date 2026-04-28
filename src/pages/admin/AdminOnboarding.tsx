import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Shield, Lock, FileText, Loader2 } from "lucide-react";
import { OnboardingHeader, OnboardingFooter } from "@/components/onboarding/OnboardingLayout";

type Step = "change_password" | "accept_terms" | "complete";

const AdminOnboarding: React.FC = () => {
  const { user } = useAuth();
  const { currentTenant, isLoading } = useTenant();
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

// Render logo and footer are now handled by reusable components

  const renderStepContent = () => {
    if (step === "change_password") {
      return (
        <Card className="w-full max-w-md shadow-xl border-primary/10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Primeiro Acesso</CardTitle>
            <CardDescription className="text-base">
              Para sua segurança, defina uma nova senha para continuar sua jornada na All Vita.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nova senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Confirmar senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="h-11"
              />
            </div>
            <Button onClick={handleChangePassword} className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02]" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ativar minha conta
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (step === "accept_terms") {
      return (
        <Card className="w-full max-w-md shadow-xl border-primary/10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Termos e Condições</CardTitle>
            <CardDescription className="text-base">
              Precisamos que você leia e aceite nossas diretrizes para garantir a melhor experiência e segurança.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-muted/30 p-4 rounded-lg border border-transparent transition-colors hover:border-primary/20">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(v) => setTermsAccepted(v === true)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer font-medium">
                  Li e concordo com os <a href="/terms" target="_blank" className="text-primary underline hover:text-primary/80 transition-colors">Termos de Uso</a> da plataforma All Vita.
                </label>
              </div>
              <div className="flex items-start gap-3 bg-muted/30 p-4 rounded-lg border border-transparent transition-colors hover:border-primary/20">
                <Checkbox
                  id="privacy"
                  checked={privacyAccepted}
                  onCheckedChange={(v) => setPrivacyAccepted(v === true)}
                  className="mt-1"
                />
                <label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer font-medium">
                  Estou ciente da <a href="/privacy" target="_blank" className="text-primary underline hover:text-primary/80 transition-colors">Política de Privacidade</a> e autorizo o tratamento de dados.
                </label>
              </div>
            </div>
            <Button
              onClick={handleAcceptTerms}
              className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02]"
              disabled={loading || !termsAccepted || !privacyAccepted}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Concluir Onboarding
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-md text-center shadow-xl border-primary/10">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
            <Shield className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold">Acesso Configurado!</CardTitle>
          <CardDescription className="text-base">
            Parabéns! Sua conta foi ativada com sucesso e você já pode acessar todo o ecossistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/core")} className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] bg-green-600 hover:bg-green-700">
            Começar Agora
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4 sm:p-8">
      <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <OnboardingHeader 
          logoUrl={currentTenant?.logo_url} 
          tradeName={currentTenant?.trade_name} 
        />
        {renderStepContent()}
        <OnboardingFooter tenantName={currentTenant?.trade_name} />
      </div>
    </div>
  );
};

export default AdminOnboarding;
