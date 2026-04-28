import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (token) {
        verifyToken(token);
      } else {
        setError("Token de convite ausente.");
        setVerifying(false);
      }
    };

    checkUser();
  }, [token]);

  const verifyToken = async (t: string) => {
    try {
      const { data, error } = await (supabase.from as any)("staff_invitations")
        .select("*")
        .eq("token", t)
        .eq("status", "pending")
        .single();

      if (error || !data) {
        setError("Este convite é inválido ou já foi utilizado.");
      } else {
        // Verificar expiração
        if (new Date(data.expires_at) < new Date()) {
          setError("Este convite expirou.");
        } else {
          setInvitation(data);
        }
      }
    } catch (err) {
      setError("Erro ao verificar convite.");
    } finally {
      setVerifying(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      // Redirecionar para login, mas salvar o retorno
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/auth?redirect=${returnUrl}`);
      return;
    }

    setAccepting(true);
    try {
      const { data, error } = await supabase.rpc("accept_staff_invitation", {
        invitation_token: token,
      });

      const result = data as any;

      if (error || !result.success) {
        throw new Error(result?.error || "Erro ao aceitar convite.");
      }

      toast.success("Bem-vindo ao staff!");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAccepting(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md border-border/60 shadow-xl">
        {error ? (
          <>
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Ops! Algo deu errado</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => navigate("/")}>
                Voltar para o Início
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Convite de Staff</CardTitle>
              <CardDescription>
                Você foi convidado para integrar a equipe da <strong>All Vita</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/60 p-4 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">E-mail:</span>
                  <span className="font-medium">{invitation?.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Papel:</span>
                  <span className="font-medium capitalize">{invitation?.role}</span>
                </div>
              </div>
              
              {!user && (
                <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-[13px] text-amber-700 flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>Você precisa estar logado para aceitar o convite. Se não tiver conta, poderá criar uma no próximo passo.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full gap-2" 
                onClick={handleAccept} 
                disabled={accepting}
              >
                {accepting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {user ? "Aceitar e Acessar Painel" : "Fazer Login para Aceitar"}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default AcceptInvitation;
