import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import logoAllVita from "@/assets/logo-allvita.png";

const ResetPasswordPage: React.FC = () => {
  const { navigate } = useTenantNavigation();
  const { currentTenant } = useTenant();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const tenantName = currentTenant?.trade_name || currentTenant?.name || "All Vita";
  const tenantLogo = currentTenant?.logo_url || logoAllVita;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Senha atualizada com sucesso!");
        navigate("/auth/login");
      }
    } catch {
      toast.error("Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center p-4 transition-colors duration-500"
        style={{ 
          backgroundColor: currentTenant?.primary_color || 'var(--background)' 
        }}
      >
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Link de recuperação inválido ou expirado.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/auth/forgot-password")}>
              Solicitar novo link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4 transition-colors duration-500"
      style={{ 
        backgroundColor: currentTenant?.primary_color || 'var(--background)' 
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <img 
            src={tenantLogo} 
            alt={tenantName} 
            className="h-16 w-auto mx-auto mb-4 object-contain" 
            style={{ maxHeight: '80px' }}
          />
          <h1 
            className="text-2xl font-semibold tracking-tight transition-colors duration-500"
            style={{ 
              color: currentTenant?.primary_color ? 'white' : 'var(--foreground)'
            }}
          >
            Nova senha
          </h1>
          <p 
            className="text-sm mt-1 transition-colors duration-500"
            style={{ 
              color: currentTenant?.primary_color ? 'rgba(255, 255, 255, 0.9)' : 'var(--muted-foreground)'
            }}
          >
            Defina sua nova senha de acesso
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p 
          className="text-center text-[11px] mt-6 transition-colors duration-500"
          style={{ 
            color: currentTenant?.primary_color ? 'rgba(255, 255, 255, 0.7)' : 'var(--muted-foreground)'
          }}
        >
          Powered by <span className="font-medium">All Vita</span>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
