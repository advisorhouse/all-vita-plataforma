import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useLocation } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';

export const useProductTour = () => {
  const location = useLocation();
  const { currentTenant } = useTenant();

  const startTour = () => {
    const isPartner = location.pathname.includes('/partner');
    const isCore = location.pathname.includes('/core');
    const isClub = location.pathname.includes('/club');
    const isAdmin = location.pathname.includes('/admin');

    const commonSteps: DriveStep[] = [
      {
        element: '#sidebar-brand',
        popover: {
          title: '✨ Bem-vindo',
          description: `Você está acessando o portal ${currentTenant?.name || 'Allvita'}. Aqui você encontra todas as suas ferramentas de forma organizada.`,
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#sidebar-nav',
        popover: {
          title: '📂 Menu Principal',
          description: 'Navegue por todas as funcionalidades do sistema através deste menu lateral.',
          side: 'right',
          align: 'start'
        }
      }
    ];

    const finalSteps: DriveStep[] = [
      {
        element: '#topbar-notifications',
        popover: {
          title: '🔔 Notificações',
          description: 'Fique por dentro de alertas, mensagens e novidades importantes em tempo real.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#topbar-profile',
        popover: {
          title: '👤 Seu Perfil',
          description: 'Gerencie seus dados, altere sua senha e personalize sua experiência no sistema.',
          side: 'bottom',
          align: 'center'
        }
      }
    ];

    let steps: DriveStep[] = [...commonSteps];

    // Role-specific steps
    if (isPartner) {
      steps.push({
        element: '#sidebar-link-network',
        popover: {
          title: '🌟 Minha Rede',
          description: 'Acompanhe o crescimento da sua rede, seus pontos e parceiros indicados.',
          side: 'right',
          align: 'start'
        }
      });
      steps.push({
        element: '#sidebar-link-revenue',
        popover: {
          title: '💰 Minha Receita',
          description: 'Visualize seus ganhos, histórico de comissões e metas financeiras.',
          side: 'right',
          align: 'start'
        }
      });
    } else if (isCore) {
      steps.push({
        element: '#sidebar-link-partners',
        popover: {
          title: '🤝 Parceiros',
          description: 'Gerencie e acompanhe o desempenho de todos os parceiros do seu tenant.',
          side: 'right',
          align: 'start'
        }
      });
      steps.push({
        element: '#sidebar-link-finance',
        popover: {
          title: '📈 Financeiro',
          description: 'Controle total sobre o faturamento, pagamentos e saúde financeira da empresa.',
          side: 'right',
          align: 'start'
        }
      });
    } else if (isClub) {
      steps.push({
        element: '#sidebar-link-benefits',
        popover: {
          title: '🎁 Benefícios',
          description: 'Explore todos os produtos, descontos e serviços exclusivos para membros.',
          side: 'right',
          align: 'start'
        }
      });
    } else if (isAdmin) {
      steps.push({
        element: '#sidebar-link-tenants',
        popover: {
          title: '🏢 Gestão de Tenants',
          description: 'Controle centralizado de todas as empresas e marcas da plataforma.',
          side: 'right',
          align: 'start'
        }
      });
    }

    steps = [...steps, ...finalSteps];

    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Concluir',
      steps: steps,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
    });

    driverObj.drive();
  };

  return { startTour };
};
