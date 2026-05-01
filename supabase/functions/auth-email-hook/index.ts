import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  console.log("=== AUTH EMAIL HOOK CALLED ===");
  try {
    const payload = await req.json();
    console.log("Payload Type:", payload.type || payload.event || payload.email_action_type || "unknown");
    console.log("Full Payload:", JSON.stringify(payload));

    // Supabase Auth Hooks can have data nested in various ways
    // Try different paths to find the user and email data
    const user = payload.user || payload.data?.user || payload.record;
    const email_data = payload.email_data || payload.data?.email_data || payload.data;
    const event = email_data?.email_action_type || payload.event || payload.type || payload.email_data?.email_action_type;
    const redirect_to = email_data?.redirect_to || payload.redirect_to || payload.email_data?.redirect_to || payload.data?.redirect_to;
    
    if (!user) {
      console.warn("Missing user in payload structure, checking if it is a health check or different format");
      // If we have an email but no user object, try to construct a minimal user
      const email = payload.email || email_data?.email || payload.data?.email;
      if (email) {
        console.log("Found email in payload, continuing with minimal user data");
        // We'll proceed with this minimal info
      } else if (payload.type || payload.event || payload.email_action_type) {
        return new Response(JSON.stringify({ status: "ok", message: "Event received but no user found" }), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ error: "Usuário não encontrado no payload" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Detect tenant from redirect_to or user metadata
    let tenantSlug = user?.user_metadata?.tenant_slug;
    
    if (!tenantSlug && redirect_to) {
      try {
        const url = new URL(redirect_to);
        const hostname = url.hostname;
        
        const { data: tenantByDomain } = await supabaseAdmin
          .from("tenants")
          .select("slug")
          .eq("domain", hostname)
          .maybeSingle();
        
        if (tenantByDomain) {
          tenantSlug = tenantByDomain.slug;
        } else if (hostname.endsWith("allvita.com.br") || hostname.endsWith("lovable.app")) {
          const parts = hostname.split('.');
          if (parts.length > 2 && parts[0] !== 'app' && parts[0] !== 'www') {
            tenantSlug = parts[0];
          }
        }
      } catch (e) {
        console.error("Error parsing redirect_to URL:", e);
      }
    }

    // Default branding
    let tenantBranding = {
      name: "All Vita",
      logo: "https://fmkcxsyudgtimpbjwcjv.supabase.co/storage/v1/object/public/tenant-logos/allvita-logo.png",
      primaryColor: "#6B8E23",
    };

    if (tenantSlug) {
      const { data: tenantData } = await supabaseAdmin
        .from("tenants")
        .select("name, trade_name, logo_url, primary_color")
        .eq("slug", tenantSlug)
        .maybeSingle();

      if (tenantData) {
        tenantBranding = {
          name: tenantData.trade_name || tenantData.name,
          logo: tenantData.logo_url || tenantBranding.logo,
          primaryColor: tenantData.primary_color || tenantBranding.primaryColor,
        };
      }
    }

    let subject = "";
    let html = "";
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || email_data?.email?.split('@')[0] || "Usuário";
    const userEmail = user?.email || user?.new_email || email_data?.email || payload.email;

    if (!userEmail) {
      console.error("User email not found in payload");
      return new Response(JSON.stringify({ error: "E-mail do usuário não encontrado" }), { status: 400 });
    }

    const normalizedEvent = (event || "").toUpperCase();
    console.log(`Processing event: ${normalizedEvent} for ${userEmail}`);

    switch (normalizedEvent) {
      case "PASSWORD_RECOVERY":
      case "RECOVERY": {
        subject = `Recuperação de Senha - ${tenantBranding.name}`;
        
        // Use site_url from email_data or fallback to a hardcoded one if necessary
        // The verify link should point to the Supabase Auth API verify endpoint
        const authApiUrl = email_data?.site_url || "https://fmkcxsyudgtimpbjwcjv.supabase.co/auth/v1";
        const confirmationUrl = `${authApiUrl}/verify?token=${email_data?.token_hash}&type=recovery&redirect_to=${encodeURIComponent(redirect_to)}`;

        html = getTemplate(tenantBranding, `
          <h2 style="color: ${tenantBranding.primaryColor};">Olá, ${name}</h2>
          <p>Recebemos uma solicitação para redefinir sua senha na plataforma <strong>${tenantBranding.name}</strong>.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${confirmationUrl}" style="background-color: ${tenantBranding.primaryColor}; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Redefinir Minha Senha
            </a>
          </div>
          <p>Se você não solicitou isso, pode ignorar este e-mail com segurança. Sua senha permanecerá a mesma.</p>
        `);
        break;
      }

      case "EMAIL_CHANGE":
      case "EMAIL_CHANGE_CONFIRM": {
        subject = `Confirme seu novo e-mail - ${tenantBranding.name}`;
        
        const authApiUrl = email_data?.site_url || "https://fmkcxsyudgtimpbjwcjv.supabase.co/auth/v1";
        const confirmationUrl = `${authApiUrl}/verify?token=${email_data?.token_hash}&type=email_change&redirect_to=${encodeURIComponent(redirect_to)}`;

        html = getTemplate(tenantBranding, `
          <h2 style="color: ${tenantBranding.primaryColor};">Confirmação de Alteração</h2>
          <p>Você solicitou a alteração do seu e-mail na plataforma <strong>${tenantBranding.name}</strong>.</p>
          <p>Para concluir o processo, clique no botão abaixo:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${confirmationUrl}" style="background-color: ${tenantBranding.primaryColor}; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Confirmar Novo E-mail
            </a>
          </div>
        `);
        break;
      }

      case "INVITE":
        subject = `Você foi convidado para ${tenantBranding.name}`;
        html = getTemplate(tenantBranding, `
          <h2 style="color: ${tenantBranding.primaryColor};">Bem-vindo(a)!</h2>
          <p>Você foi convidado para participar da plataforma <strong>${tenantBranding.name}</strong>.</p>
          <p>Clique no botão abaixo para aceitar o convite e configurar sua conta:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${redirect_to}" style="background-color: ${tenantBranding.primaryColor}; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Aceitar Convite
            </a>
          </div>
        `);
        break;

      case "SIGNUP":
      case "CONFIRMATION": {
        subject = `Confirme seu cadastro - ${tenantBranding.name}`;
        
        const authApiUrl = email_data?.site_url || "https://fmkcxsyudgtimpbjwcjv.supabase.co/auth/v1";
        const confirmationUrl = `${authApiUrl}/verify?token=${email_data?.token_hash}&type=signup&redirect_to=${encodeURIComponent(redirect_to)}`;

        html = getTemplate(tenantBranding, `
          <h2 style="color: ${tenantBranding.primaryColor};">Quase lá!</h2>
          <p>Obrigado por se cadastrar na <strong>${tenantBranding.name}</strong>.</p>
          <p>Por favor, confirme seu e-mail para ativar sua conta:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${confirmationUrl}" style="background-color: ${tenantBranding.primaryColor}; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Confirmar E-mail
            </a>
          </div>
        `);
        break;
      }

      case "MAGICLINK":
        subject = `Seu link de acesso - ${tenantBranding.name}`;
        html = getTemplate(tenantBranding, `
          <h2 style="color: ${tenantBranding.primaryColor};">Acesso Rápido</h2>
          <p>Use o botão abaixo para entrar em sua conta na <strong>${tenantBranding.name}</strong>.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${redirect_to}" style="background-color: ${tenantBranding.primaryColor}; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Entrar Agora
            </a>
          </div>
        `);
        break;

      default:
        console.log("Unhandled auth event:", normalizedEvent);
        // If it's an unhandled event but we have subject/html (from a previous version or something), we could proceed
        // but for now let's just return a generic error or handle it.
        return new Response(JSON.stringify({ error: `Evento não suportado: ${normalizedEvent}` }), { status: 400 });
    }

    if (subject && html) {
      console.log(`Sending email to ${userEmail} via Resend...`);
      const { data, error } = await resend.emails.send({
        from: `${tenantBranding.name} <no-reply@app.allvita.com.br>`,
        to: [userEmail],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error("Resend API error:", JSON.stringify(error, null, 2));
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      console.log("Email sent successfully:", data);
      return new Response(JSON.stringify({ status: "ok", id: data?.id }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Erro ao gerar template de e-mail" }), { status: 500 });
  } catch (err) {
    console.error("Unexpected error in hook:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

function getTemplate(branding: any, content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.5; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { max-height: 60px; max-width: 200px; object-fit: contain; }
        .content { background: #ffffff; border-radius: 8px; padding: 30px; border: 1px solid #f0f0f0; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
        h2 { margin-top: 0; }
        p { margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${branding.logo}" alt="${branding.name}" class="logo">
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${branding.name}. Todos os direitos reservados.</p>
          <p>Este é um e-mail automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}