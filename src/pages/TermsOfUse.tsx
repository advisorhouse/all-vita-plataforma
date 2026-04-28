import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsOfUse = () => {
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
          <h1>Termos de Uso</h1>
          <p className="text-muted-foreground">Última atualização: 28 de abril de 2026</p>

          <section>
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar a plataforma All Vita, operada pela <strong>MAXIMA VITA HUMAN HEALTH LTDA</strong>, inscrita no CNPJ sob o nº [CNPJ_AQUI], você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2>2. Descrição do Serviço</h2>
            <p>
              A All Vita é uma plataforma de gestão e acompanhamento de saúde visual e longevidade, conectando profissionais de saúde (Parceiros), pacientes (Assinantes do Club) e gestores (Core). Nossos serviços incluem, mas não se limitam a:
            </p>
            <ul>
              <li>Sistemas de vínculo médico-paciente através de algoritmos inteligentes;</li>
              <li>Acompanhamento de jornadas de tratamento e suplementação;</li>
              <li>Sistemas de recompensas e gamificação (Vitacoins);</li>
              <li>Painéis de inteligência de dados e relatórios.</li>
            </ul>
          </section>

          <section>
            <h2>3. Cadastro e Segurança</h2>
            <p>
              Para utilizar as funcionalidades plenas da plataforma, é necessário realizar um cadastro. Você é responsável por:
            </p>
            <ul>
              <li>Fornecer informações precisas, atualizadas e completas;</li>
              <li>Manter a confidencialidade de sua senha e credenciais de acesso;</li>
              <li>Notificar imediatamente a All Vita sobre qualquer uso não autorizado de sua conta.</li>
            </ul>
          </section>

          <section>
            <h2>4. Regras para Parceiros (Profissionais de Saúde)</h2>
            <p>
              Profissionais cadastrados como parceiros declaram estar em pleno gozo de seus direitos profissionais perante seus respectivos conselhos de classe (CRM, etc.). O sistema de atribuição "Último Click" define que o vínculo ativo será sempre com o profissional que realizou o atendimento ou coleta de dados mais recente autorizado pelo paciente.
            </p>
          </section>

          <section>
            <h2>5. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo disponível na All Vita, incluindo textos, gráficos, logotipos, ícones, imagens, vídeos, softwares e código-fonte, é de propriedade exclusiva da MAXIMA VITA HUMAN HEALTH LTDA ou de seus licenciadores, protegidos pelas leis de direitos autorais e propriedade intelectual.
            </p>
          </section>

          <section>
            <h2>6. Limitação de Responsabilidade</h2>
            <p>
              A All Vita atua como uma facilitadora de gestão e dados. As decisões clínicas, diagnósticos e tratamentos são de responsabilidade exclusiva dos profissionais de saúde cadastrados. A MAXIMA VITA HUMAN HEALTH LTDA não se responsabiliza por resultados de tratamentos ou interações entre usuários fora do escopo tecnológico da plataforma.
            </p>
          </section>

          <section>
            <h2>7. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas através da plataforma ou por e-mail. O uso continuado da plataforma após tais alterações constitui sua aceitação dos novos Termos de Uso.
            </p>
          </section>

          <section>
            <h2>8. Foro</h2>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro da Comarca de [Sede da Empresa] para dirimir quaisquer controvérsias oriundas deste documento.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default TermsOfUse;
