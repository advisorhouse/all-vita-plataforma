import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export const generateManualPDF = () => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [217, 119, 87]; // #D97757 (Accent color typical in the project)

  // Helper for title
  const addSectionTitle = (text: string, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(text, 20, y);
    doc.setLineWidth(0.5);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(20, y + 2, 190, y + 2);
    return y + 15;
  };

  // Helper for normal text
  const addBodyText = (text: string, y: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, 20, y);
    return y + (lines.length * 7);
  };

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Manual de Testes - All Vita", 105, 25, { align: "center" });
  doc.setFontSize(12);
  doc.text("Plataforma de Saúde e Gestão de Benefícios", 105, 33, { align: "center" });

  let y = 55;

  // Introduction
  y = addSectionTitle("1. Introdução à Fase de Testes", y);
  y = addBodyText("Bem-vindos à fase de testes operacionais da All Vita. O objetivo desta etapa é validar fluxos, identificar possíveis gaps de experiência e garantir que todas as regras de negócio e integrações estejam prontas para o lançamento oficial.", y);
  y += 5;

  // Setup
  y = addSectionTitle("2. Configurações Iniciais (Tenant)", y);
  y = addBodyText("O primeiro passo é configurar a inteligência do sistema na área CORE:", y);
  doc.setFont("helvetica", "bold");
  doc.text("• Comissões:", 25, y);
  y = addBodyText("Acesse 'Core > Comissões' para definir as porcentagens de venda direta e recorrência para cada nível de partner.", y - 5);
  doc.setFont("helvetica", "bold");
  doc.text("• Vitacoins:", 25, y);
  y = addBodyText("Em 'Core > Gamificação', configure os benefícios e as metas de pontos para resgate de prêmios ou PIX.", y - 5);
  doc.setFont("helvetica", "bold");
  doc.text("• Integrações:", 25, y);
  y = addBodyText("Conecte o gateway de pagamento (Pagar.me) e a IA em 'Core > Integrações' para automação de checkout e diagnósticos.", y - 5);
  y += 5;

  // Roles
  y = addSectionTitle("3. Hierarquia e Colaboradores", y);
  y = addBodyText("Cadastre sua equipe interna em 'Core > Usuários'. Você pode definir permissões específicas para cada colaborador, limitando o que eles podem ver ou editar no dashboard administrativo.", y);
  y += 5;

  // Products
  y = addSectionTitle("4. Gestão de Produtos", y);
  y = addBodyText("Em 'Core > Catálogo de Produtos', cadastre os itens. Você pode vincular um produto a um parceiro específico (Exclusivo) ou deixá-lo disponível para toda a rede (Compartilhado).", y);
  y += 5;

  // Partner Flow
  y = addSectionTitle("5. Fluxo do Partner (Afiliado/Médico)", y);
  y = addBodyText("O Partner é o motor de crescimento da rede. Ele possui um painel exclusivo com:", y);
  doc.text("• Links Personalizados:", 25, y);
  y = addBodyText("Dois canais: o Chat (IA Assistente) e o Protocolo (Quiz). Ambos são personalizados com o nome do médico para gerar confiança.", y - 5);
  doc.text("• Formação da Rede:", 25, y);
  y = addBodyText("O partner possui um link de recrutamento para convidar outros profissionais e ganhar sobre as vendas da rede indireta.", y - 5);
  y += 5;

  // Client Flow
  if (y > 230) { doc.addPage(); y = 20; }
  y = addSectionTitle("6. Experiência do Cliente (Clube All Vita)", y);
  y = addBodyText("Ao finalizar uma compra, o cliente ganha acesso ao Clube, onde ele pode:", y);
  y = addBodyText("• Registrar o uso diário no Calendário de Consistência.\n• Ver vídeos educativos e conteúdos exclusivos.\n• Acompanhar a evolução da sua saúde visual e desbloquear prêmios.", y);
  y += 5;

  // Testing Steps
  y = addSectionTitle("7. Como Testar (Checklist)", y);
  y = addBodyText("Para listar gaps e ajustes, sugerimos realizar estes 5 testes:", y);
  const checklist = [
    ["#", "Teste", "Objetivo"],
    ["1", "Cadastro de Partner", "Validar envio de e-mail e criação de links."],
    ["2", "Preenchimento de Quiz", "Verificar se o lead cai corretamente no painel do médico."],
    ["3", "Simulação de Checkout", "Testar a geração de fatura e criação da assinatura."],
    ["4", "Consistência no Clube", "Marcar 7 dias de uso e ver se a barra de progresso avança."],
    ["5", "Resgate de Vitacoins", "Solicitar um resgate como partner e aprovar como admin."]
  ];
  autoTable(doc, {
    startY: y,
    head: [checklist[0]],
    body: checklist.slice(1),
    theme: "striped",
    headStyles: { fillColor: primaryColor }
  });

  // Footer on each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Manual All Vita - Fase de Testes - Página ${i} de ${pageCount}`, 105, 285, { align: "center" });
  }

  // Finalize
  try {
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Manual_AllVita_Testes.pdf");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Error generating PDF:", error);
    doc.save("Manual_AllVita_Testes.pdf");
  }
};
