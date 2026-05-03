import React, { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Link2, QrCode, Copy, Download, ClipboardList, MessageSquare, Sparkles, Check
} from "lucide-react";
import { toast } from "sonner";

type Mode = "link" | "qr";
type Channel = "quiz" | "chat";

interface PremiumLinkWidgetProps {
  referralCode?: string;
  tenantLogo?: string | null;
}

const PremiumLinkWidget: React.FC<PremiumLinkWidgetProps> = ({ referralCode, tenantLogo }) => {
  const [mode, setMode] = useState<Mode>("link");
  const [channel, setChannel] = useState<Channel>("quiz");
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const path = channel === "quiz" ? "quiz" : "chat";
  const url = referralCode ? `${origin}/${path}/${referralCode}` : `${origin}/${path}/...`;

  const copyLink = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success(channel === "quiz" ? "Link do Quiz copiado!" : "Link do Chat copiado!");
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadQR = () => {
    const canvas = document.createElement("canvas");
    const svg = document.getElementById("premium-qr-code");
    if (!svg) return;

    // Use a high scale for better print quality
    const scale = 4;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = (img.width * scale) + 80;
      canvas.height = (img.height * scale) + 80;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40, img.width * scale, img.height * scale);
        const pngFile = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.download = `qrcode-${channel}-${referralCode}.png`;
        a.href = pngFile;
        a.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl shadow-lg text-white"
      style={{
        background:
          "linear-gradient(135deg, #4F8BF5 0%, #5B95F7 45%, #7AAEFB 100%)",
      }}
    >
      {/* Decorative orbs (top-right + bottom-left like reference) */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/15 blur-[2px]" />
      <div className="pointer-events-none absolute top-10 -right-32 h-72 w-72 rounded-full border-[40px] border-white/10" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/8 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative z-10 p-6 md:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
              <ClipboardList className="h-5 w-5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-semibold">
                Seu Canal Exclusivo
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                Envie antes da consulta.
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5">
            <Sparkles className="h-3 w-3 text-white" />
            <span className="text-[11px] font-semibold text-white">Vínculo Vitalício</span>
          </div>
        </div>

        <p className="mt-3 text-sm text-white/85 max-w-2xl leading-relaxed">
          O paciente preenche dados de saúde, autoriza LGPD e fica vinculado ao seu cadastro{" "}
          <span className="font-semibold text-white">automaticamente</span>. Toda compra futura gera Vitacoins para você.
        </p>

        {/* Channel selector — clearer cards with description */}
        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-semibold mb-2">
            Escolha o formato de envio
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([
              {
                id: "quiz",
                label: "Quiz Tradicional",
                desc: "Formulário guiado com perguntas objetivas de saúde.",
                icon: ClipboardList,
              },
              {
                id: "chat",
                label: "Chat com IA",
                desc: "Conversa natural com assistente inteligente.",
                icon: MessageSquare,
              },
            ] as const).map(({ id, label, desc, icon: Icon }) => {
              const active = channel === id;
              return (
                <button
                  key={id}
                  onClick={() => setChannel(id)}
                  className={`group flex items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-all border ${
                    active
                      ? "bg-white text-foreground border-white shadow-md"
                      : "bg-white/8 text-white border-white/15 hover:bg-white/15"
                  }`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-[#4F8BF5]/10" : "bg-white/15"
                  }`}>
                    <Icon className={`h-4 w-4 ${active ? "text-[#4F8BF5]" : "text-white"}`} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold leading-tight">{label}</p>
                      {active && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#4F8BF5] bg-[#4F8BF5]/10 px-1.5 py-0.5 rounded">
                          Selecionado
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 leading-snug ${active ? "text-muted-foreground" : "text-white/75"}`}>
                      {desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode tabs (Link / QR) */}
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-semibold mb-2">
            Como compartilhar
          </p>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/12 backdrop-blur-sm p-1 ring-1 ring-white/15">
            {([
              { id: "link", label: "Link", icon: Link2 },
              { id: "qr", label: "QR Code", icon: QrCode },
            ] as const).map(({ id, label, icon: Icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-white text-foreground shadow-sm"
                      : "text-white/85 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="mt-5">
          {mode === "link" ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 overflow-hidden">
                <Link2 className="h-4 w-4 text-white/70 shrink-0" />
                <p className="text-sm font-medium text-white truncate flex-1">
                  {url}
                </p>
              </div>
              <button
                onClick={copyLink}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar Link"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="bg-white p-3 rounded-2xl shadow-md">
                {referralCode ? (
                  <QRCodeSVG
                    id="premium-qr-code"
                    value={url}
                    size={150}
                    level="H"
                    includeMargin={false}
                    imageSettings={tenantLogo ? {
                      src: tenantLogo,
                      height: 28,
                      width: 28,
                      excavate: true,
                    } : undefined}
                  />
                ) : (
                  <div className="h-[150px] w-[150px] flex items-center justify-center bg-muted rounded-lg">
                    <QrCode className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-white/85">
                  Aponte a câmera ou baixe a imagem para imprimir e usar em material físico.
                </p>
                <button
                  onClick={downloadQR}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <Download className="h-4 w-4" />
                  Baixar QR Code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer pills */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2">
            <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Rastreamento</p>
            <p className="text-xs font-bold text-white mt-0.5">Vínculo Direto</p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2">
            <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Validade</p>
            <p className="text-xs font-bold text-white mt-0.5">Vitalício</p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2 col-span-2 sm:col-span-1">
            <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Status</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-bold text-white">Ativo</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumLinkWidget;
