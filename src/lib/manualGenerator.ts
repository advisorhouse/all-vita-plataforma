import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export const generateManualPDF = () => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [217, 119, 87]; // All Vita Brand Color
  const secondaryColor: [number, number, number] = [45, 55, 72];
  
  let currentY = 0;

  // Configuration for consistent spacing
  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN = 20;
  const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

  // Helper: New Page with Header
  const addNewPage = () => {
    doc.addPage();
    currentY = MARGIN;
  };

  // Helper: Space Check & Flow
  const checkSpace = (needed: number) => {
    if (currentY + needed > PAGE_HEIGHT - MARGIN - 20) {
      addNewPage();
    }
  };

  // UI Components
  const addTitle = (text: string) => {
    checkSpace(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(text, MARGIN, currentY + 10);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, currentY + 13, MARGIN + 60, currentY + 13);
    currentY += 25;
  };

  const addSubtitle = (text: string) => {
    checkSpace(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(text, MARGIN, currentY);
    currentY += 10;
  };

  const addParagraph = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    const height = lines.length * 6;
    checkSpace(height + 5);
    doc.text(lines, MARGIN, currentY);
    currentY += height + 5;
  };

  const addListItem = (label: string, text: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    checkSpace(10);
    doc.text(`• ${label}:`, MARGIN + 5, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const fullText = ` ${text}`;
    const lines = doc.splitTextToSize(fullText, CONTENT_WIDTH - 35);
    doc.text(lines, MARGIN + 35, currentY);
    currentY += (lines.length * 6) + 2;
  };

  // --- CAPA ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("ALL VITA", PAGE_WIDTH / 2, 100, { align: "center" });
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text("Guia Oficial da Plataforma - Versão 2.5", PAGE_WIDTH / 2, 120, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("Ecossistema de Saúde, Longevidade e Gestão", PAGE_WIDTH / 2, 130, { align: "center" });
  
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(PAGE_WIDTH / 2 - 40, 140, PAGE_WIDTH / 2 + 40, 140);

  // --- INTRODUÇÃO ---
  addNewPage();
  addTitle("1. Introdução");
  addParagraph("A All Vita é uma plataforma tecnológica inovadora que une saúde preventiva, inteligência artificial e um modelo de negócios escalável. O objetivo é proporcionar aos profissionais de saúde (Partners) as ferramentas necessárias para prescrever com precisão, enquanto oferece aos pacientes (Clientes) uma jornada de acompanhamento gamificada no Clube All Vita.");

  addSubtitle("O Propósito");
  addParagraph("Nascemos para resolver a falta de adesão aos protocolos de saúde. Através da tecnologia, transformamos o uso de suplementos e medicamentos em uma experiência recompensadora e monitorada.");

  // --- TENANTS & ARQUITETURA ---
  addTitle("2. Conceitos de Tenants");
  addParagraph("A All Vita opera sob uma arquitetura Multi-Tenant. Um 'Tenant' é uma instância isolada do sistema para uma empresa ou clínica específica.");
  
  addSubtitle("Características de um Tenant:");
  addListItem("Isolamento Total", "Os dados de clientes, partners e faturamento são 100% segregados.");
  addListItem("Personalização (White Label)", "Cada Tenant define seu próprio subdomínio (ex: clinica.allvita.com.br), logo e identidade visual.");
  addListItem("Regras Próprias", "As taxas de comissão, metas de Vitacoins e integrações de pagamento são configuradas por Tenant.");

  // --- FUNCIONALIDADES CORE (ADMIN) ---
  addTitle("3. Painel Administrativo (CORE)");
  addParagraph("É o coração da gestão do Tenant. Aqui o administrador configura a inteligência do negócio.");

  addSubtitle("Configurações Disponíveis:");
  addListItem("Usuários & Permissões", "Criação de perfis (Admin, Staff, Financeiro) com matriz de acesso granular.");
  addListItem("Catálogo de Produtos", "Gestão de estoque, preços e vinculação com Partners específicos.");
  addListItem("Financeiro & Comissões", "Configuração de split de pagamento e níveis de marketing de rede.");
  addListItem("Gamificação", "Regras para ganho de Vitacoins por consistência no tratamento.");
  addListItem("Integrações", "Configuração de Pagar.me para pagamentos e chaves de IA para os assistentes virtuais.");

  // --- JORNADA DO PARTNER ---
  addNewPage();
  addTitle("4. O Ecossistema do Partner");
  addParagraph("O Partner (Médico ou Afiliado) é quem impulsiona a plataforma através de prescrições e indicações.");

  addSubtitle("Ferramentas do Partner:");
  addListItem("Links de Captura", "Links personalizados que rastreiam o lead desde o primeiro clique.");
  addListItem("Quiz de Protocolo", "Questionário inteligente que gera uma recomendação personalizada baseada em IA.");
  addListItem("IA Assistant", "Chatbot treinado para tirar dúvidas dos pacientes sobre longevidade e produtos.");
  addListItem("Gestão de Rede", "Visualização de sua árvore de indicações e bônus de performance.");

  // --- JORNADA DO CLIENTE (CLUBE) ---
  addTitle("5. O Clube All Vita (Cliente)");
  addParagraph("Focado na retenção e sucesso do tratamento do paciente.");

  addSubtitle("Funcionalidades:");
  addListItem("Calendário de Consistência", "Interface onde o cliente marca o uso diário, gerando dados de adesão.");
  addListItem("Carteira de Vitacoins", "Moedas virtuais acumuladas que podem ser trocadas por novos produtos ou PIX.");
  addListItem("Área de Conteúdo", "Vídeos educativos e dicas de saúde personalizadas.");

  // --- GUIA DE TESTES (PASSO A PASSO) ---
  addNewPage();
  addTitle("6. Passo a Passo de Testes Operacionais");
  addParagraph("Para validar sua implementação, realize este fluxo completo:");

  addSubtitle("Fase 1: Configuração Inicial");
  addParagraph("1. No Admin, acesse CORE > Comissões e defina 10% de venda direta.");
  addParagraph("2. Acesse CORE > Integrações e garanta que o modo Sandbox está ativo.");

  addSubtitle("Fase 2: Simulação de Venda");
  addParagraph("1. Crie um Partner e acesse o link de Quiz dele.");
  addParagraph("2. Preencha o Quiz e siga para o Checkout.");
  addParagraph("3. Realize a compra com cartão de teste.");

  addSubtitle("Fase 3: Validação de Resultados");
  addParagraph("1. Verifique se a comissão apareceu no saldo do Partner.");
  addParagraph("2. Acesse o Clube com o e-mail do cliente e veja se o produto está liberado.");

  // --- TABELA DE CHECKLIST ---
  addTitle("7. Checklist de Auditoria");
  const auditData = [
    ["Módulo", "Funcionalidade", "Status de Verificação"],
    ["AUTH", "Login MFA & Recuperação", "[ ] Testado"],
    ["CORE", "Matriz de Permissões", "[ ] Testado"],
    ["PARTNER", "Links de Recrutamento", "[ ] Testado"],
    ["CHECKOUT", "Split de Pagamento", "[ ] Testado"],
    ["CLUBE", "Sync de Calendário", "[ ] Testado"]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [auditData[0]],
    body: auditData.slice(1),
    theme: "grid",
    headStyles: { fillColor: primaryColor },
    margin: { left: MARGIN, right: MARGIN }
  });

  // Footer & Page Numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220);
    doc.line(MARGIN, PAGE_HEIGHT - 15, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 15);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("All Vita - Ecossistema de Saúde Digital - Manual de Operações", MARGIN, PAGE_HEIGHT - 10);
    doc.text(`Página ${i} de ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, { align: "right" });
  }

  // Final Download
  try {
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Manual_AllVita_Completo.pdf");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    doc.save("Manual_AllVita_Completo.pdf");
  }
};
