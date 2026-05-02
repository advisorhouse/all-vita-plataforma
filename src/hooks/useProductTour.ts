import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useLocation } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export const useProductTour = () => {
  const location = useLocation();
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const [tourCompleted, setTourCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    const checkTourStatus = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('tour_completed')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setTourCompleted(data.tour_completed);
      }
    };

    checkTourStatus();
  }, [user]);

  const markTourAsCompleted = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ tour_completed: true })
      .eq('id', user.id);

    if (!error) {
      setTourCompleted(true);
    }
  };

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
        element: '#dashboard-greeting',
        popover: {
          title: '🤝 Olá, Parceiro!',
          description: 'Aqui você vê um resumo rápido do seu nível e status atual.',
          side: 'bottom',
          align: 'start'
        }
      });
      steps.push({
        element: '#dashboard-kpis',
        popover: {
          title: '📊 Seus Indicadores',
          description: 'Acompanhe o número de pacientes vinculados, taxa de retenção e recorrência.',
          side: 'bottom',
          align: 'start'
        }
      });
      steps.push({
        element: '#dashboard-wallet',
        popover: {
          title: '💰 Sua Wallet Médica',
          description: 'Veja seu saldo de Vitacoins e resgate seus pontos por benefícios ou Pix.',
          side: 'left',
          align: 'center'
        }
      });
      steps.push({
        element: '#sidebar-link-network',
        popover: {
          title: '🌟 Minha Rede',
          description: 'Expanda sua influência e acompanhe o crescimento dos seus parceiros indicados.',
          side: 'right',
          align: 'start'
        }
      });
    } else if (isCore) {
      steps.push({
        element: '#core-greeting',
        popover: {
          title: '🏢 Gestão Master',
          description: 'Bem-vindo ao centro de comando do seu tenant. Aqui você tem a visão master de tudo.',
          side: 'bottom',
          align: 'start'
        }
      });
      steps.push({
        element: '#core-kpis',
        popover: {
          title: '📈 Métricas Vitais',
          description: 'Acompanhe Clientes Ativos, MRR e Ticket Médio em tempo real.',
          side: 'bottom',
          align: 'start'
        }
      });
      steps.push({
        element: '#core-revenue-hero',
        popover: {
          title: '💸 Saúde Financeira',
          description: 'Visão detalhada da sua receita acumulada e margens de operação.',
          side: 'left',
          align: 'center'
        }
      });
      steps.push({
        element: '#sidebar-link-partners',
        popover: {
          title: '🤝 Rede de Afiliados',
          description: 'Gerencie todos os parceiros que impulsionam o seu negócio.',
          side: 'right',
          align: 'start'
        }
      });
    } else if (isClub) {
      steps.push({
        element: '#club-hero',
        popover: {
          title: '🎁 Portal do Membro',
          description: 'Tudo o que você precisa para sua jornada de bem-estar está aqui.',
          side: 'bottom',
          align: 'start'
        }
      });
      steps.push({
        element: '#club-how-it-works',
        popover: {
          title: '✨ Como Funciona',
          description: 'Siga os passos para garantir seus benefícios e ganhar prêmios.',
          side: 'top',
          align: 'center'
        }
      });
      steps.push({
        element: '#club-rewards',
        popover: {
          title: '🏆 Suas Recompensas',
          description: 'Veja o seu progresso e quais prêmios você já pode resgatar.',
          side: 'top',
          align: 'center'
        }
      });
    } else if (isAdmin) {
      steps.push({
        element: '#admin-header',
        popover: {
          title: '👑 Painel Super Admin',
          description: 'Controle total da infraestrutura Allvita e de todos os tenants.',
          side: 'bottom',
          align: 'start'
        }
      });
      steps.push({
        element: '#admin-pending-tenants',
        popover: {
          title: '🕒 Pendências',
          description: 'Aprove e gerencie novos tenants que estão entrando na plataforma.',
          side: 'bottom',
          align: 'center'
        }
      });
      steps.push({
        element: '#admin-revenue-charts',
        popover: {
          title: '📊 Faturamento Global',
          description: 'Análise macro do crescimento financeiro de toda a rede Allvita.',
          side: 'top',
          align: 'center'
        }
      });
      steps.push({
        element: '#sidebar-link-tenants',
        popover: {
          title: '🏢 Ecossistema',
          description: 'Gerencie a lista completa de empresas parceiras.',
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
      onDestroyStarted: () => {
        markTourAsCompleted();
        driverObj.destroy();
      }
    });

    driverObj.drive();
  };

  useEffect(() => {
    const dashboardPaths = ['/partner', '/core', '/club', '/admin'];
    const isDashboard = dashboardPaths.some(path => {
      return location.pathname.endsWith(path);
    });

    if (isDashboard && tourCompleted === false) {
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tourCompleted, location.pathname]);

  return { startTour };
};
