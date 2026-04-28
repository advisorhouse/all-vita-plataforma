import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import logoAllVita from "@/assets/logo-allvita.png";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Política de Privacidade | All Vita</title>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <header className="flex flex-col items-center mb-12 border-b pb-8">
          <img
            src={logoAllVita}
            alt="All Vita"
            className="h-12 w-auto mb-6"
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Política de Privacidade</h1>
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
            <h2 className="text-xl font-semibold mb-4 text-primary">1. COMPROMISSO E CONFORMIDADE (LGPD)</h2>
            <p>
              A <strong>MAXIMA VITA HUMAN HEALTH LTDA</strong> ("All Vita"), inscrita no CNPJ sob o nº 60.410.363/0001-27, valoriza sua privacidade e a segurança de seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações de acordo com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>.
            </p>
            <p className="mt-4">
              Esta política aplica-se a todos os usuários da plataforma All Vita: administradores (Core), profissionais de saúde (Partners) e pacientes (Club).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">2. CATEGORIAS DE DADOS COLETADOS</h2>
            <p>A All Vita coleta diferentes tipos de dados conforme o uso da plataforma:</p>
            <div className="mt-4 space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-bold mb-1 text-foreground">A. Dados Cadastrais e de Identificação</h3>
                <p className="text-sm">Nome completo, CPF, RG, data de nascimento, gênero, endereço residencial, e-mail, número de telefone e fotos de perfil.</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-bold mb-1 text-foreground">B. Dados de Saúde (Dados Sensíveis)</h3>
                <p className="text-sm">Informações sobre saúde visual, histórico médico, respostas a questionários de saúde (quizzes), prescrições de suplementos, evolução de tratamentos e registros de exames. <strong>Estes dados recebem tratamento especial e acesso restrito.</strong></p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-bold mb-1 text-foreground">C. Dados Profissionais (Para Parceiros)</h3>
                <p className="text-sm">Número de registro profissional (CRM, etc.), especialidade, endereço do consultório e dados para repasse de comissões/recompensas.</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-bold mb-1 text-foreground">D. Dados Financeiros e de Transação</h3>
                <p className="text-sm">Histórico de compras, status de assinaturas do Club e dados de pagamento (processados via gateways seguros, sem armazenamento de dados sensíveis de cartão pela All Vita).</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-bold mb-1 text-foreground">E. Dados Tecnológicos e de Uso</h3>
                <p className="text-sm">Endereço IP, geolocalização aproximada, tipo de navegador, sistema operacional, registros de acesso (logs) e interações com a interface.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">3. FINALIDADES DO TRATAMENTO DE DADOS</h2>
            <p>Utilizamos seus dados para finalidades legítimas e específicas:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Execução de Contrato:</strong> Para gerenciar sua conta, processar assinaturas do Club e permitir o uso das funcionalidades da plataforma.</li>
              <li><strong>Acompanhamento de Saúde:</strong> Para permitir que profissionais de saúde visualizem sua jornada e prescrevam tratamentos/suplementos adequados.</li>
              <li><strong>Gestão de Recompensas (Vitacoins):</strong> Para calcular pontos baseados no seu engajamento e permitir a troca por benefícios.</li>
              <li><strong>Comunicação:</strong> Para enviar notificações sobre seu tratamento, alertas de segurança, atualizações da plataforma e comunicações de marketing (estas últimas mediante seu opt-out).</li>
              <li><strong>Segurança:</strong> Para prevenir fraudes, acessos não autorizados e garantir a integridade dos dados de saúde.</li>
              <li><strong>Melhoria Contínua:</strong> Para realizar análises estatísticas anonimizadas visando aprimorar nossos algoritmos e serviços.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">4. COMPARTILHAMENTO DE DADOS</h2>
            <p>O compartilhamento de dados ocorre apenas em cenários estritamente necessários:</p>
            <ul className="list-disc pl-5 mt-4 space-y-3">
              <li><strong>Entre Usuários:</strong> Dados de saúde do paciente são compartilhados com o profissional vinculado (Partner) para fins de cuidado clínico.</li>
              <li><strong>Fornecedores de Tecnologia:</strong> Serviços de hospedagem em nuvem (Supabase/AWS), envio de e-mails e infraestrutura de TI, todos com rigorosos contratos de confidencialidade.</li>
              <li><strong>Processadores de Pagamento:</strong> Para viabilizar transações financeiras.</li>
              <li><strong>Logística:</strong> Endereço e nome para entrega de produtos/kits All Vita.</li>
              <li><strong>Obrigação Legal:</strong> Quando exigido por autoridades governamentais, ordem judicial ou para o cumprimento de deveres regulatórios.</li>
            </ul>
            <p className="mt-4 font-semibold text-destructive">A All Vita NUNCA comercializa ou aluga seus dados pessoais para terceiros.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">5. SEGURANÇA E ARMAZENAMENTO</h2>
            <p>Adotamos padrões de segurança de nível bancário e hospitalar:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Criptografia:</strong> Dados sensíveis são criptografados tanto em repouso quanto em trânsito (SSL/TLS).</li>
              <li><strong>Controle de Acesso:</strong> Autenticação rigorosa e políticas de "mínimo privilégio" (cada colaborador acessa apenas o que é essencial).</li>
              <li><strong>Localização:</strong> Os dados são armazenados em servidores de alta segurança localizados globalmente (AWS/Supabase), em conformidade com as normas internacionais de proteção de dados.</li>
              <li><strong>Retenção:</strong> Mantemos seus dados enquanto seu cadastro estiver ativo ou conforme exigido por leis de guarda de prontuários médicos (que podem chegar a 20 anos em certos casos).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">6. SEUS DIREITOS COMO TITULAR</h2>
            <p>Você tem total controle sobre seus dados e pode exercer os seguintes direitos conforme a LGPD:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Confirmação e Acesso:</strong> Saber se tratamos seus dados e obter uma cópia deles.</li>
              <li><strong>Correção:</strong> Solicitar a atualização de dados incompletos ou errados.</li>
              <li><strong>Anonimização ou Eliminação:</strong> Quando os dados forem desnecessários ou excessivos.</li>
              <li><strong>Portabilidade:</strong> Transferir seus dados para outro fornecedor de serviço.</li>
              <li><strong>Revogação do Consentimento:</strong> Retirar sua autorização para o tratamento de dados (isso pode limitar o uso de certas funções).</li>
              <li><strong>Informação sobre Compartilhamento:</strong> Saber com quais entidades compartilhamos seus dados.</li>
            </ul>
            <p className="mt-4">Para exercer estes direitos, entre em contato através do e-mail: <strong>privacidade@allvita.com.br</strong>.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">7. COOKIES E TECNOLOGIAS DE RASTREAMENTO</h2>
            <p>
              Utilizamos cookies para reconhecer seu navegador, lembrar suas preferências e entender como você utiliza nossa plataforma. Você pode gerenciar as preferências de cookies nas configurações do seu navegador, mas desativá-los pode afetar a experiência de uso da All Vita.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">8. ALTERAÇÕES NESTA POLÍTICA</h2>
            <p>
              Podemos atualizar esta Política de Privacidade a qualquer momento. Versões atualizadas serão publicadas nesta página com uma nova data de revisão. Recomendamos a leitura periódica deste documento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">9. CONTATO E ENCARREGADO (DPO)</h2>
            <p>
              Dúvidas, reclamações ou solicitações sobre privacidade devem ser enviadas ao nosso Encarregado de Proteção de Dados:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
              <strong>All Vita Privacy Team</strong><br />
              Email: privacidade@allvita.com.br<br />
              MAXIMA VITA HUMAN HEALTH LTDA<br />
              CNPJ: 60.410.363/0001-27
            </div>
          </section>

          <p className="mt-8 text-sm text-center text-muted-foreground">
            <strong>MAXIMA VITA HUMAN HEALTH LTDA</strong>
          </p>
        </article>

        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 MAXIMA VITA HUMAN HEALTH LTDA | CNPJ: 60.410.363/0001-27</p>
          <p className="mt-2">Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
