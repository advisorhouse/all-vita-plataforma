import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import logoAllVita from "@/assets/logo-allvita.png";

const TermsOfUse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Termos de Uso | All Vita</title>
      </Helmet>
      
      <div className="max-w-3xl mx-auto">
        <header className="flex flex-col items-center mb-12 border-b pb-8">
          <img
            src={logoAllVita}
            alt="All Vita"
            className="h-12 w-auto mb-6"
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Termos de Uso</h1>
          <p className="text-muted-foreground mt-2">All Vita Platform</p>
        </header>

        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>

        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-center prose-h1:hidden">
          <p className="text-muted-foreground italic mb-8">Última atualização: 28 de abril de 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">1. OBJETO E VINCULAÇÃO</h2>
            <p>
              Estes Termos e Condições de Uso ("Termos") regem o acesso e a utilização da plataforma tecnológica <strong>All Vita</strong>, de propriedade e operada pela <strong>MAXIMA VITA HUMAN HEALTH LTDA</strong>, inscrita no CNPJ sob o nº 60.410.363/0001-27, com sede na cidade de São Paulo, Estado de São Paulo.
            </p>
            <p className="mt-4">
              A plataforma All Vita é um ecossistema digital integrado que visa otimizar a gestão da saúde visual, longevidade e bem-estar, proporcionando ferramentas de acompanhamento clínico, programas de fidelidade, gamificação e intermediação de jornadas de saúde entre profissionais (Parceiros), pacientes (Assinantes do Club) e administradores (Core).
            </p>
            <p className="mt-4">
              Ao clicar em "Aceito", realizar o cadastro ou simplesmente navegar pela plataforma, você declara ter lido, compreendido e aceitado integralmente estes Termos, bem como a nossa Política de Privacidade.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">2. FUNCIONALIDADES E ESCOPO DOS SERVIÇOS</h2>
            <p>A All Vita disponibiliza as seguintes funcionalidades, de acordo com o perfil do usuário:</p>
            <div className="mt-4 space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-foreground">A. Gestão de Saúde e Jornada do Paciente</h3>
                <p className="text-sm">Ferramentas para monitoramento de tratamentos, prescrição de suplementação personalizada, controle de consultas e exames, e visualização da evolução do quadro clínico do usuário.</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-foreground">B. Sistema de Inteligência "Último Click"</h3>
                <p className="text-sm">Algoritmo proprietário que gerencia o vínculo dinâmico entre o paciente e o profissional de saúde. O vínculo ativo para fins de comissionamento ou visualização de dados detalhados será sempre atribuído ao parceiro que realizou a última interação válida ou autorizada pelo paciente no sistema.</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-foreground">C. Club All Vita e Benefícios</h3>
                <p className="text-sm">Programa de assinatura e fidelidade que garante acesso a descontos exclusivos, conteúdos educativos premium e condições especiais em produtos de parceiros.</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-foreground">D. Gamificação e Vitacoins</h3>
                <p className="text-sm">Sistema de recompensas baseado no engajamento. O cumprimento de metas de saúde, leitura de conteúdos e permanência no Club geram "Vitacoins", pontos que podem ser trocados conforme as regras vigentes da campanha atual.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">3. CADASTRO, CONTAS E SEGURANÇA</h2>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Capacidade Legal:</strong> A plataforma é destinada a maiores de 18 anos. Menores de idade devem ser assistidos ou representados por seus tutores legais conforme a legislação civil brasileira.</li>
              <li><strong>Veracidade das Informações:</strong> O usuário se compromete a fornecer dados exatos, atuais e verdadeiros. O fornecimento de informações falsas pode acarretar na suspensão imediata da conta.</li>
              <li><strong>Responsabilidade pela Senha:</strong> O acesso é pessoal e intransferível. O usuário é o único responsável pela guarda de sua senha e por todas as atividades realizadas em sua conta. Em caso de perda ou suspeita de uso indevido, a All Vita deve ser comunicada imediatamente.</li>
              <li><strong>Perfis de Acesso:</strong> Cada usuário possui um nível de permissão (Admin, Core, Partner, Club). O uso de ferramentas fora do escopo de seu perfil é estritamente proibido.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">4. REGRAS ESPECÍFICAS PARA PARCEIROS</h2>
            <p>Profissionais de saúde que utilizam a plataforma como Parceiros declaram e garantem:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Possuir registro ativo e regular perante o Conselho Federal ou Regional de sua categoria (CRM, etc.);</li>
              <li>Observar o sigilo profissional e os preceitos éticos da medicina/saúde em todas as interações e registros na plataforma;</li>
              <li>Não utilizar a plataforma para fins de diagnóstico exclusivo sem o devido exame clínico presencial, quando este for exigido pelas normas regulamentares de sua profissão;</li>
              <li>Reconhecer que a All Vita não garante fluxo de pacientes, sendo uma ferramenta de suporte à gestão e relacionamento.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">5. USO DOS DADOS E PRIVACIDADE</h2>
            <p>
              A proteção dos dados dos usuários é prioridade. O tratamento de dados sensíveis (informações de saúde) ocorre estritamente nos termos da <strong>Lei Geral de Proteção de Dados (LGPD)</strong> e conforme detalhado em nossa Política de Privacidade.
            </p>
            <p className="mt-4 italic text-sm border-l-4 border-primary/50 pl-4 py-2 bg-muted/30">
              O usuário consente expressamente que seus dados de saúde sejam compartilhados com o profissional de saúde ao qual ele está vinculado ("Último Click"), para que este possa realizar o acompanhamento clínico necessário.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">6. PROPRIEDADE INTELECTUAL</h2>
            <p>
              Todos os elementos da plataforma All Vita, incluindo código-fonte, algoritmos de cálculo, design de interface, logotipos, textos, vídeos explicativos, protocolos de jornada e o nome "All Vita", são propriedades exclusivas da <strong>MAXIMA VITA HUMAN HEALTH LTDA</strong>. 
            </p>
            <p className="mt-4">
              É proibida a reprodução, engenharia reversa, descompilação ou qualquer forma de extração de dados (scraping) da plataforma sem autorização prévia e por escrito.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">7. LIMITAÇÃO DE RESPONSABILIDADE E GARANTIAS</h2>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Independência Médica:</strong> A All Vita é uma fornecedora de tecnologia. Não exercemos a medicina nem interferimos nas decisões clínicas. A responsabilidade por qualquer diagnóstico ou tratamento é exclusiva do médico ou profissional de saúde assistente.</li>
              <li><strong>Disponibilidade:</strong> Embora busquemos a excelência técnica, não garantimos que a plataforma estará disponível 100% do tempo sem interrupções. Manutenções programadas ou problemas técnicos de terceiros podem ocorrer.</li>
              <li><strong>Resultados:</strong> A All Vita não garante resultados de saúde específicos, uma vez que estes dependem de fatores biológicos individuais e da adesão rigorosa do usuário aos protocolos.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">8. CANCELAMENTO E SUSPENSÃO</h2>
            <p>
              A All Vita reserva-se o direito de suspender ou encerrar contas que violem estes Termos, pratiquem atos fraudulentos, disseminem informações falsas ou utilizem a plataforma para fins ilícitos. O usuário pode solicitar o cancelamento de sua conta a qualquer momento, observadas as condições contratuais específicas do Club All Vita, se aplicável.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">9. ALTERAÇÕES DOS TERMOS</h2>
            <p>
              Estes Termos podem ser atualizados periodicamente para refletir melhorias funcionais ou mudanças legislativas. Notificaremos os usuários sobre alterações substanciais. O uso continuado da plataforma após a atualização implica na aceitação automática da nova versão.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">10. LEI APLICÁVEL E FORO</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer dúvidas ou litígios decorrentes deste documento, as partes elegem o Foro Central da Comarca de São Paulo/SP, com renúncia expressa a qualquer outro.
            </p>
          </section>
        </article>
        
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 MAXIMA VITA HUMAN HEALTH LTDA | CNPJ: 60.410.363/0001-27</p>
          <p className="mt-2">Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfUse;
