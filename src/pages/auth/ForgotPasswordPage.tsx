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
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success("Email de recuperação enviado!");
      }
    } catch {
      toast.error("Erro ao enviar email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <img src={tenantLogo} alt={tenantName} className="h-10 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enviaremos um link para redefinir sua senha
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

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Powered by <span className="font-medium">All Vita</span>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
