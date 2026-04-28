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
    const { email, role, appUrl } = await req.json();

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
    const inviteLink = `${APP_URL}/accept-invitation?token=${invitation.token}`;

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
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #000;">Olá!</h2>
            <p>Você foi convidado para fazer parte da equipe da <strong>All Vita</strong> com o papel de <strong>${role}</strong> no painel administrativo global.</p>
            <p>Para aceitar o convite e acessar o sistema, clique no botão abaixo:</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Aceitar Convite</a>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 40px;">Se o botão não funcionar, copie e cole este link no seu navegador:<br><span style="color: #0066cc;">${inviteLink}</span></p>
            <p style="font-size: 12px; color: #999;">Este convite expira em 7 dias.</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.json();
      console.error("Erro ao enviar e-mail:", emailError);
    }

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
