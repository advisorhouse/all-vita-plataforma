import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { email, role, appUrl, fullName } = await req.json();

    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: "Email e papel são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verificar se o chamador é admin do staff
    const authHeader = req.headers.get("Authorization")!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: staffMember, error: staffError } = await supabaseAdmin
      .from("all_vita_staff")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (staffError || !staffMember || !["super_admin", "admin"].includes(staffMember.role)) {
      return new Response(
        JSON.stringify({ error: "Apenas administradores podem convidar staff" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Criar o convite
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from("staff_invitations")
      .insert({
        email,
        full_name: fullName,
        role,
        invited_by: user.id,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Erro ao criar convite:", inviteError);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar convite. O e-mail já pode ter um convite pendente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Enviar e-mail
    const APP_URL = appUrl || Deno.env.get("PUBLIC_APP_URL") || "https://app.allvita.com.br";
    const inviteLink = `${APP_URL}/auth/signup?redirect=${encodeURIComponent(`/auth/accept-invitation?token=${invitation.token}`)}`;

    const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "Você foi convidado para o Staff da All Vita",
        html: `
          <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: 700; margin: 0; color: #1a1a1a;">All Vita</h1>
              <p style="font-size: 14px; color: #666; margin: 4px 0 0;">Plataforma de Gestão Integrada</p>
            </div>
            
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #1a1a1a;">Olá, bem-vindo à equipe!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Você foi convidado para fazer parte da equipe de <strong>Staff Global</strong> da All Vita. 
              Sua conta foi configurada com o papel de <strong>${role}</strong>, permitindo que você contribua diretamente para o crescimento e operação da nossa plataforma.
            </p>

            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">
                Como membro do Staff, você terá acesso ao painel administrativo global para gerenciar operações críticas, 
                acompanhar métricas de parceiros e garantir a excelência da experiência All Vita para todos os nossos clientes.
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${inviteLink}" style="background-color: #000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block; transition: background-color 0.2s;">
                Configurar Acesso e Aceitar Convite
              </a>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #64748b; text-align: center; margin-bottom: 0;">
              Este convite é de uso pessoal e expira em 7 dias.<br>
              Se o botão acima não funcionar, acesse o link:<br>
              <a href="${inviteLink}" style="color: #2563eb; text-decoration: none;">${inviteLink}</a>
            </p>
            
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f0f0f0; text-align: center;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                © 2026 All Vita Tecnologia. Todos os direitos reservados.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.json();
      console.error("Erro ao enviar e-mail:", emailError);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar e-mail de convite", details: emailError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Marcar como enviado
    await supabaseAdmin
      .from("staff_invitations")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", invitation.id);

    return new Response(
      JSON.stringify({ success: true, invitation }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
