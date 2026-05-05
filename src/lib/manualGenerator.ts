import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export const generateManualPDF = () => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [217, 119, 87]; // #D97757
  const secondaryColor: [number, number, number] = [45, 55, 72]; // Dark slate

  let currentY = 0;

  // Helper for text wrapping and page management
  const checkPageOverflow = (neededHeight: number) => {
    if (currentY + neededHeight > 270) {
      doc.addPage();
      currentY = 20;
    }
  };

  const addSectionTitle = (text: string) => {
    checkPageOverflow(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(text, 20, currentY + 10);
    doc.setLineWidth(0.5);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(20, currentY + 12, 190, currentY + 12);
    currentY += 22;
  };

  const addSubSectionTitle = (text: string) => {
    checkPageOverflow(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(text, 20, currentY + 5);
    currentY += 12;
  };

  const addBodyText = (text: string, isBold = false) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, 170);
    const neededHeight = lines.length * 7;
    checkPageOverflow(neededHeight);
    doc.text(lines, 20, currentY);
    currentY += neededHeight + 3;
  };

  const addBulletPoint = (label: string, description: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    checkPageOverflow(10);
    doc.text(`• ${label}:`, 25, currentY);
    
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(description, 155);
    const neededHeight = descLines.length * 7;
    checkPageOverflow(neededHeight);
    doc.text(descLines, 35, currentY + (descLines.length > 1 ? 0 : 0));
    currentY += Math.max(7, neededHeight) + 2;
  };

  // --- Cover Page ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 297, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.text("ALL VITA", 105, 100, { align: "center" });
  
  doc.setFontSize(20);
  doc.text("Manual Operacional e Guia de Testes", 105, 120, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Versão 2.0 - Guia Completo da Plataforma", 105, 140, { align: "center" });
  
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.line(40, 150, 170, 150);

  doc.addPage();
  currentY = 30;

  // --- Section 1: Introduction ---
  addSectionTitle("1. Sobre a All Vita");
  addBodyText("A All Vita é uma ecossistema de saúde e bem-estar projetado para revolucionar a forma como profissionais de saúde e pacientes interagem. Nossa plataforma combina tecnologia de Inteligência Artificial, gamificação e gestão de rede para promover longevidade e saúde preventiva.");
  
  addSubSectionTitle("Visão Geral");
  addBodyText("Diferente de sistemas comuns de gestão, a All Vita foca na experiência do usuário final através do 'Clube All Vita' e no empoderamento do profissional através do sistema de 'Partners'.");

  // --- Section 2: Tenants ---
  addSectionTitle("2. Conceito de Tenants (Multi-empresa)");
  addBodyText("O sistema All Vita é construído sobre uma arquitetura multi-tenant. Isso significa que cada organização (Tenant) opera em um ambiente isolado, com suas próprias configurações, usuários e regras.");
  
  addSubSectionTitle("Por que usar Tenants?");
  addBulletPoint("Isolamento de Dados", "Garante que as informações de uma clínica ou rede não se misturem com outras.");
  addBulletPoint("Personalização", "Cada Tenant pode configurar suas próprias taxas de comissão, integrações e catálogo de produtos.");
  addBulletPoint("Escalabilidade", "Permite que a All Vita cresça suportando milhares de parceiros independentes sob o mesmo núcleo tecnológico.");

  // --- Section 3: Admin Configurations ---
  addSectionTitle("3. Configurações Disponíveis (Admin)");
  addBodyText("Como administrador, você tem controle total sobre o funcionamento do seu Tenant através da aba 'CORE'.");
  
  addSubSectionTitle("Áreas de Configuração:");
  addBulletPoint("Configurações do Tenant", "Definição de nome, logo, subdomínio e informações de contato da sua organização.");
  addBulletPoint("Comissões", "Regras de bonificação para a rede. Define quanto um Partner ganha por venda direta e quanto os níveis acima recebem (Marketing de Rede).");
  addBulletPoint("Gamificação (Vitacoins)", "Configuração das metas de saúde. Quantos pontos o cliente ganha por consistência e como os Partners podem trocar pontos por recompensas.");
  addBulletPoint("Integrações", "Configuração de chaves de API para gateways de pagamento (Pagar.me), serviços de e-mail e modelos de IA.");

  // --- Section 4: Functional Flow ---
  addSectionTitle("4. Funcionalidades Detalhadas");
  
  addSubSectionTitle("4.1 O Ecossistema de Partners");
  addBodyText("O Partner (Médico, Nutricionista ou Afiliado) é o centro da distribuição. Ao se cadastrar, ele recebe:");
  addBulletPoint("Landing Pages Personalizadas", "Páginas de captura com sua foto e nome para gerar autoridade.");
  addBulletPoint("Quiz de Saúde Inteligente", "Um formulário interativo que usa IA para diagnosticar necessidades e sugerir produtos.");
  addBulletPoint("Dashboard de Vendas", "Monitoramento em tempo real de leads, conversões e comissões acumuladas.");

  addSubSectionTitle("4.2 O Clube All Vita (Cliente)");
  addBodyText("O cliente não apenas compra um produto, ele entra em um programa de acompanhamento:");
  addBulletPoint("Calendário de Consistência", "Onde o cliente marca o uso diário dos suplementos/medicamentos.");
  addBulletPoint("Ranking e Recompensas", "O engajamento gera Vitacoins que podem ser usados para descontos futuros.");
  addBulletPoint("Conteúdo Educativo", "Acesso a vídeos e artigos curados para o seu perfil de saúde.");

  // --- Section 5: Step-by-Step Testing ---
  addSectionTitle("5. Passo a Passo para Testes Operacionais");
  addBodyText("Siga este roteiro para garantir que sua instância está configurada corretamente:");

  addSubSectionTitle("Passo 1: Configuração Core");
  addBodyText("Acesse 'Core > Usuários' e crie um usuário com perfil 'Partner'. Verifique se o e-mail de boas-vindas foi disparado corretamente.");

  addSubSectionTitle("Passo 2: Jornada do Lead");
  addBodyText("Acesse o link público do Partner criado. Preencha o Quiz como se fosse um paciente. Ao final, verifique se a recomendação de produtos faz sentido com as respostas dadas.");

  addSubSectionTitle("Passo 3: Ciclo Financeiro");
  addBodyText("Realize uma compra em modo 'test' no checkout. Verifique no Admin se o pedido foi criado e se a comissão foi calculada corretamente para o Partner que indicou.");

  // --- Checklist Table ---
  addSectionTitle("6. Checklist Final de Lançamento");
  const checklist = [
    ["ID", "Ação de Teste", "Resultado Esperado"],
    ["T1", "Cadastro de Partner", "Dashboard criado e links ativos."],
    ["T2", "Uso do Quiz de IA", "Lead capturado e recomendação gerada."],
    ["T3", "Pagamento de Pedido", "Status muda para 'Pago' e libera o Clube."],
    ["T4", "Acesso ao Clube", "Cliente consegue ver seus produtos e calendário."],
    ["T5", "Saque de Comissão", "Partner solicita saque e Admin recebe a notificação."]
  ];
  
  autoTable(doc, {
    startY: currentY,
    head: [checklist[0]],
    body: checklist.slice(1),
    theme: "grid",
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left: 20, right: 20 }
  });

  // Footer on each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Draw line above footer
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.line(20, 280, 190, 280);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`All Vita - Manual Oficial de Operação`, 20, 287);
    doc.text(`Página ${i} de ${pageCount}`, 190, 287, { align: "right" });
  }

  // Download Trigger
  try {
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Manual_Completo_AllVita.pdf");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Error generating PDF:", error);
    doc.save("Manual_Completo_AllVita.pdf");
  }
};
