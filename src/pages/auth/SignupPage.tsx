import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Loader2, Phone } from "lucide-react";
import { IMaskInput } from "react-imask";
import { isColorLight } from "@/lib/utils";
import logoAllVita from "@/assets/logo-allvita.png";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { tenantPath } = useTenantNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  
  // Form states
  const [checkingToken, setCheckingToken] = useState(!!redirectTo);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only allow signup if there is a redirect/invitation token
  React.useEffect(() => {
    const validateInvitation = async () => {
      if (!redirectTo) {
        toast.error("O cadastro só é permitido através de um convite válido.");
        navigate("/auth/login");
        return;
      }

      const url = new URL(redirectTo, window.location.origin);
      const token = url.searchParams.get("token");

      if (!token) {
        toast.error("Link de convite incompleto. Por favor, utilize o link enviado ao seu e-mail.");
        navigate("/auth/login");
        return;
      }

      setCheckingToken(true);
      try {
        const { data, error } = await supabase
          .from("staff_invitations")
          .select("*")
          .eq("token", token)
          .single();

        if (error || !data) {
          toast.error("Convite não encontrado ou já utilizado.");
          navigate("/auth/login");
          return;
        }

        if (data.status !== "pending") {
          toast.error("Este convite já foi aceito anteriormente.");
          navigate("/auth/login");
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          toast.error("Este convite expirou. Por favor, solicite um novo envio.");
          navigate("/auth/login");
          return;
        }

        setEmail(data.email);
      } catch (err) {
        toast.error("Erro ao validar convite.");
        navigate("/auth/login");
      } finally {
        setCheckingToken(false);
      }
    };

    validateInvitation();
  }, [redirectTo, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !phone) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { 
            full_name: fullName,
            phone: phone
          },
        },
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success("Conta criada com sucesso!");
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          navigate("/");
        }
      } else {
        toast.info("Verifique seu email para confirmar a conta.");
        navigate(`/auth/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4 transition-colors duration-500 bg-background"
    >
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{ 
          backgroundColor: currentTenant?.primary_color || 'transparent' 
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <img 
            src={currentTenant?.logo_url || logoAllVita} 
            alt={currentTenant?.trade_name || currentTenant?.name || "All Vita"} 
            className="h-16 w-auto mx-auto mb-4 object-contain" 
            style={{ maxHeight: '80px' }}
          />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Criar conta
          </h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Complete seu cadastro para acessar a {currentTenant?.trade_name || currentTenant?.name || "All Vita"}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10 bg-muted cursor-not-allowed"
                    value={email}
                    disabled
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">O e-mail não pode ser alterado pois está vinculado ao seu convite.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone Celular</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <IMaskInput
                    mask="+{55} (00) 00000-0000"
                    value={phone}
                    unmask={false}
                    onAccept={(value) => setPhone(value)}
                    placeholder="+55 (00) 00000-0000"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando..." : "Criar conta"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link 
                to={tenantPath("/auth/login") + (redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "")} 
                className="text-foreground font-medium hover:underline"
              >
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] mt-6 text-muted-foreground">
          Powered by <span className="font-medium">All Vita</span>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;