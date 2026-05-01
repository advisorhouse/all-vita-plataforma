import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  const { event, user, redirect_to } = await req.json();

  // 1. Detect Tenant (Ex: via user metadata or current request context)
  // Supabase Auth Hooks send user info. We can store tenant_id in user_metadata
  const tenantName = user.user_metadata?.tenant_name || "All Vita";
  const tenantLogo = user.user_metadata?.tenant_logo || "https://allvita.com.br/logo.png";
  const primaryColor = user.user_metadata?.tenant_primary_color || "#6B8E23";

  let subject = "";
  let html = "";

  if (event === "PASSWORD_RECOVERY") {
    subject = `Recuperação de Senha - ${tenantName}`;
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="${tenantLogo}" alt="${tenantName}" style="height: 50px; margin-bottom: 20px;">
        <h2>Olá, ${user.email}</h2>
        <p>Recebemos uma solicitação para redefinir sua senha na plataforma ${tenantName}.</p>
        <div style="margin: 30px 0;">
          <a href="${redirect_to}" style="background-color: ${primaryColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Redefinir Senha
          </a>
        </div>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">Equipe ${tenantName}</p>
      </div>
    `;
  }

  if (subject && html) {
    await resend.emails.send({
      from: "All Vita <no-reply@allvita.com.br>", // Deve estar validado no seu Resend
      to: [user.email],
      subject: subject,
      html: html,
    });
  }

  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
});
