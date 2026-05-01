import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { isColorLight } from "@/lib/utils";
import logoAllVita from "@/assets/logo-allvita.png";

const ForgotPasswordPage: React.FC = () => {
  const { currentTenant } = useTenant();
  const { tenantPath, tenantParam } = useTenantNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const tenantName = currentTenant?.trade_name || currentTenant?.name || "All Vita";
  const tenantLogo = currentTenant?.logo_url || logoAllVita;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu email");
      return;
    }

    setLoading(true);
    try {
      // Preserve tenant param in the redirect URL
      const resetUrl = tenantParam
        ? `${window.location.origin}/auth/reset-password?tenant=${encodeURIComponent(tenantParam)}`
        : `${window.location.origin}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });
      
      if (error) {
        console.error("Auth reset error:", error);
        let message = "Erro ao enviar e-mail de recuperação";
        
        if (error.message.includes("Email rate limit exceeded")) {
          message = "Limite de tentativas excedido. Tente novamente mais tarde.";
        } else if (error.message.includes("User not found")) {
          message = "Usuário não encontrado.";
        } else if (error.status === 500 || error.message.includes("hook")) {
          message = "Erro no serviço de e-mail. Por favor, contate o suporte.";
        }
        
        toast.error(message);
      } else {
        setSent(true);
        toast.success("E-mail de recuperação enviado com sucesso!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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
              color: currentTenant?.primary_color 
                ? (isColorLight(currentTenant.primary_color) ? '#1A1A1A' : 'white') 
                : 'var(--foreground)'
            }}
          >
            Recuperar senha
          </h1>
          <p 
            className="text-sm mt-2 transition-colors duration-500 max-w-[280px] mx-auto"
            style={{ 
              color: currentTenant?.primary_color 
                ? (isColorLight(currentTenant.primary_color) ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)') 
                : 'var(--muted-foreground)'
            }}
          >
            Esqueceu sua senha? Não se preocupe. Informe seu e-mail abaixo e enviaremos as instruções para você criar uma nova.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-foreground">
                  Email enviado para <strong>{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Verifique sua caixa de entrada e clique no link de recuperação.
                </p>
                <Link to={tenantPath("/auth/login")}>
                  <Button variant="outline" className="w-full mt-4">
                    Voltar ao login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar link"}
                </Button>
                <Link
                  to={tenantPath("/auth/login")}
                  className="block text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  Voltar ao login
                </Link>
              </form>
            )}
          </CardContent>
        </Card>

        <p 
          className="text-center text-[11px] mt-6 transition-colors duration-500"
          style={{ 
            color: currentTenant?.primary_color 
              ? (isColorLight(currentTenant.primary_color) ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.7)') 
              : 'var(--muted-foreground)'
          }}
        >
          Powered by <span className="font-medium">All Vita</span>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
