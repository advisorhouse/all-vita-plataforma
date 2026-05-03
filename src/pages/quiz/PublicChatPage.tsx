import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ShieldCheck, Send, Loader2 } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "attendant";
  content: string;
  timestamp: number;
}

const PublicChatPage: React.FC = () => {
  const { doctorCode } = useParams<{ doctorCode: string }>();
  const [searchParams] = useSearchParams();
  const { currentTenant } = useTenant();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Configuration (placeholder — will be tenant-configurable later)
  const attendantName = "Dra. Marina";
  const attendantStatus = "Online agora";
  const tenantSecondary = currentTenant?.secondary_color || "#D97757";
  const tenantLogo = currentTenant?.logo_url;
  const tenantName = currentTenant?.trade_name || currentTenant?.name || "";

  // Resolve referral
  useEffect(() => {
    const urlRef = searchParams.get("ref");
    const stored = typeof window !== "undefined" ? localStorage.getItem("allvita_partner_ref") : null;
    const finalRef = (urlRef || stored || doctorCode || null)?.toUpperCase() ?? null;
    setReferralCode(finalRef);
  }, [doctorCode, searchParams]);

  // Initial greeting (simulated — real AI integration comes next)
  useEffect(() => {
    const t = setTimeout(() => {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "attendant",
          content: `Olá! Eu sou a ${attendantName}. Estou aqui para entender melhor sua rotina e identificar o nível ideal de proteção para a saúde dos seus olhos. Tudo bem se eu te fizer algumas perguntas rápidas?`,
          timestamp: Date.now(),
        },
      ]);
      setIsTyping(false);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping || !currentTenant?.id) return;
    
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === "attendant" ? "assistant" : "user",
            content: m.content
          })),
          tenant_id: currentTenant.id,
          partner_id: referralCode, // Pass referring doctor code
        }),
      });

      if (!response.ok) throw new Error("Falha na comunicação com a IA");

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "attendant",
          content: data.message,
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "attendant",
          content: "Desculpe, tive um problema técnico. Pode repetir, por favor?",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] px-4 py-10">
      <div className="max-w-[720px] mx-auto">
        {/* Tenant logo */}
        <div className="flex items-center justify-center mb-6 h-10">
          {tenantLogo ? (
            <img src={tenantLogo} alt={tenantName} className="max-h-10 max-w-[180px] object-contain" />
          ) : (
            <span className="text-base font-semibold tracking-wide text-foreground">{tenantName}</span>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-widest mb-4"
            style={{
              backgroundColor: `${tenantSecondary}1A`,
              color: tenantSecondary,
            }}
          >
            DIAGNÓSTICO GRATUITO
          </div>
          <h1 className="text-[30px] font-bold text-[#1a1a1a] leading-tight">
            Diagnóstico Visual Personalizado
          </h1>
          <p className="text-[14px] text-muted-foreground mt-2 max-w-[520px] mx-auto leading-relaxed">
            Converse com a {attendantName} e descubra seu nível de proteção ocular em menos de 3 minutos.
          </p>
        </div>

        {/* Chat card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-black/5 overflow-hidden flex flex-col h-[560px]"
        >
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${tenantSecondary}1A` }}
              >
                <Eye className="h-5 w-5" strokeWidth={1.75} style={{ color: tenantSecondary }} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1a1a1a] leading-tight">{attendantName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-emerald-600 font-medium">{attendantStatus}</span>
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
              <ShieldCheck className="h-3 w-3" strokeWidth={2} />
              LGPD
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[78%] px-4 py-2.5 text-[14px] leading-relaxed",
                      m.role === "user"
                        ? "rounded-2xl rounded-br-sm text-white"
                        : "rounded-2xl rounded-bl-sm bg-[#F5F2EE] text-foreground"
                    )}
                    style={
                      m.role === "user"
                        ? { backgroundColor: tenantSecondary }
                        : undefined
                    }
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-[#F5F2EE] rounded-2xl rounded-bl-sm px-4 py-3 inline-flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-black/5 px-5 py-4 bg-white">
            <div className="flex items-center gap-2 bg-[#F5F2EE] rounded-full px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua resposta..."
                disabled={isTyping}
                className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-muted-foreground/60 text-foreground disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="h-9 w-9 rounded-full flex items-center justify-center text-white transition-opacity disabled:opacity-40"
                style={{ backgroundColor: tenantSecondary }}
                aria-label="Enviar"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trust footer */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
          <span>Dados criptografados</span>
          <span>•</span>
          <span>LGPD compliant</span>
          <span>•</span>
          <span>Atendimento humano</span>
        </div>
      </div>
    </div>
  );
};

export default PublicChatPage;
