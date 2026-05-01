import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("Auth Email Hook received payload:", JSON.stringify(payload, null, 2));

    const { event, user, redirect_to } = payload;

    // Detect tenant from redirect_to or user metadata
    let tenantSlug = user.user_metadata?.tenant_slug;
    
    if (!tenantSlug && redirect_to) {
      const url = new URL(redirect_to);
      const hostname = url.hostname;
      
      // Try to find tenant by domain first
      const { data: tenantByDomain } = await supabaseAdmin
        .from("tenants")
        .select("slug")
        .eq("domain", hostname)
        .maybeSingle();
      
      if (tenantByDomain) {
        tenantSlug = tenantByDomain.slug;
      } else {
        // Fallback to subdomain or path segment if on base domains
        if (hostname.endsWith("allvita.com.br") || hostname.endsWith("lovable.app")) {
          const parts = hostname.split('.');
          if (parts.length > 2 && parts[0] !== 'app' && parts[0] !== 'www') {
            tenantSlug = parts[0];
          }
        }
      }
    }

    // Default branding (All Vita)
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
    const name = user.user_metadata?.full_name || user.email.split('@')[0];

    switch (event) {
      case "PASSWORD_RECOVERY":
        subject = `Recuperação de Senha - ${tenantBranding.name}`;
        html = getTemplate(tenantBranding, `
          <h2>Olá, ${name}</h2>
          <p>Recebemos uma solicitação para redefinir sua senha na plataforma ${tenantBranding.name}.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${redirect_to}" style="background-color: ${tenantBranding.primaryColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Redefinir Minha Senha
            </a>
          </div>
          <p>Se você não solicitou isso, pode ignorar este e-mail com segurança. Sua senha permanecerá a mesma.</p>
        `);
        break;

      case "EMAIL_CHANGE":
        subject = `Confirme seu novo e-mail - ${tenantBranding.name}`;
        html = getTemplate(tenantBranding, `
          <h2>Confirmação de Alteração</h2>
          <p>Você solicitou a alteração do seu e-mail na plataforma ${tenantBranding.name}.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${redirect_to}" style="background-color: ${tenantBranding.primaryColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Confirmar Novo E-mail
            </a>
          </div>
        `);
        break;

      case "INVITE":
        subject = `Você foi convidado para ${tenantBranding.name}`;
        html = getTemplate(tenantBranding, `
          <h2>Bem-vindo(a)!</h2>
          <p>Você foi convidado para participar da plataforma ${tenantBranding.name}.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${redirect_to}" style="background-color: ${tenantBranding.primaryColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Aceitar Convite
            </a>
          </div>
        `);
        break;

      case "SIGNUP":
        subject = `Confirme seu cadastro - ${tenantBranding.name}`;
        html = getTemplate(tenantBranding, `
          <h2>Quase lá!</h2>
          <p>Obrigado por se cadastrar na ${tenantBranding.name}. Por favor, confirme seu e-mail para começar.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${redirect_to}" style="background-color: ${tenantBranding.primaryColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Confirmar E-mail
            </a>
          </div>
        `);
        break;

      default:
        console.log("Unhandled auth event:", event);
        return new Response(JSON.stringify({ error: "Unhandled event" }), { status: 400 });
    }

    if (subject && html) {
      const { data, error } = await resend.emails.send({
        from: `${tenantBranding.name} <no-reply@allvita.com.br>`,
        to: [user.email],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error("Resend error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      console.log("Email sent successfully:", data);
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json" },
    });
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
        .logo { max-height: 60px; max-width: 200px; }
        .content { background: #ffffff; border-radius: 8px; padding: 30px; border: 1px solid #f0f0f0; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
        h2 { color: #1a1a1a; margin-top: 0; }
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
