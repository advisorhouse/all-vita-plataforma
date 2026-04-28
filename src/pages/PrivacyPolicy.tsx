import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>

        <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
          <h1>Política de Privacidade</h1>
          <p className="text-muted-foreground">Última atualização: 28 de abril de 2026</p>

          <section>
            <h2>1. Compromisso com a Privacidade</h2>
            <p>
              A All Vita, operada pela <strong>MAXIMA VITA HUMAN HEALTH LTDA</strong>, está comprometida com a proteção da privacidade e dos dados pessoais de seus usuários. Esta política descreve como coletamos, usamos, armazenamos e protegemos seus dados em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2>2. Dados Coletados</h2>
            <p>Coletamos diferentes tipos de dados dependendo do seu perfil na plataforma:</p>
            <ul>
              <li><strong>Dados de Identificação:</strong> Nome completo, CPF, e-mail, telefone e endereço.</li>
              <li><strong>Dados Profissionais (Parceiros):</strong> CRM e registro profissional.</li>
              <li><strong>Dados de Saúde (Pacientes):</strong> Informações coletadas em quizzes pré-consulta, histórico de suplementação e acompanhamento de jornadas (coletados mediante consentimento explícito).</li>
              <li><strong>Dados de Navegação:</strong> Endereço IP, tipo de dispositivo, cookies e logs de acesso para segurança e melhoria da experiência.</li>
            </ul>
          </section>

          <section>
            <h2>3. Finalidade do Tratamento</h2>
            <p>Seus dados são utilizados para:</p>
            <ul>
              <li>Gestão do vínculo médico-paciente e personalização do atendimento;</li>
              <li>Processamento de pedidos e gestão do Club All Vita;</li>
              <li>Cálculo e distribuição de recompensas (Vitacoins);</li>
              <li>Segurança da plataforma e prevenção contra fraudes;</li>
              <li>Cumprimento de obrigações legais e regulatórias.</li>
            </ul>
          </section>

          <section>
            <h2>4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos seus dados pessoais. O compartilhamento ocorre apenas quando necessário para a prestação do serviço, como:
            </p>
            <ul>
              <li>Com o profissional de saúde vinculado, para fins de acompanhamento clínico;</li>
              <li>Com parceiros logísticos para entrega de produtos;</li>
              <li>Com gateways de pagamento para processamento de transações;</li>
              <li>Por determinação judicial ou legal.</li>
            </ul>
          </section>

          <section>
            <h2>5. Segurança da Informação</h2>
            <p>
              Implementamos medidas técnicas e organizacionais avançadas para proteger seus dados, incluindo criptografia de ponta a ponta em dados sensíveis, controle estrito de acesso e monitoramento contínuo contra vulnerabilidades.
            </p>
          </section>

          <section>
            <h2>6. Seus Direitos</h2>
            <p>
              Como titular dos dados, você possui direitos garantidos pela LGPD, incluindo:
            </p>
            <ul>
              <li>Confirmação da existência de tratamento;</li>
              <li>Acesso aos seus dados;</li>
              <li>Correção de dados incompletos ou inexatos;</li>
              <li>Revogação do consentimento a qualquer momento;</li>
              <li>Eliminação de dados pessoais (salvo quando a manutenção for obrigatória por lei).</li>
            </ul>
          </section>

          <section>
            <h2>7. Contato</h2>
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail: privacidade@allvita.com.br.
            </p>
          </section>

          <p className="mt-8 text-sm text-center text-muted-foreground">
            <strong>MAXIMA VITA HUMAN HEALTH LTDA</strong>
          </p>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
