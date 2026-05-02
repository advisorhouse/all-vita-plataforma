import { useEffect } from 'react';
import { driver } from 'driver.js';
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

    const steps = [
      {
        element: '#sidebar-brand',
        popover: {
          title: '✨ Bem-vindo à Allvita',
          description: `Você está acessando o portal ${currentTenant?.name || 'Allvita'}. Aqui você encontra todas as suas ferramentas.`,
          position: 'right',
        }
      },
      {
        element: '#sidebar-nav',
        popover: {
          title: '📂 Menu de Navegação',
          description: 'Acesse rapidamente as principais funcionalidades do sistema por aqui.',
          position: 'right',
        }
      },
      {
        element: '#topbar-notifications',
        popover: {
          title: '🔔 Notificações',
          description: 'Fique por dentro de todas as novidades e alertas importantes em tempo real.',
          position: 'bottom',
        }
      },
      {
        element: '#topbar-profile',
        popover: {
          title: '👤 Seu Perfil',
          description: 'Gerencie suas informações pessoais, altere sua senha e personalize sua experiência.',
          position: 'bottom',
        }
      }
    ];

    // Add role-specific steps if needed
    if (isPartner) {
      steps.splice(2, 0, {
        element: '#sidebar-link-network',
        popover: {
          title: '🌟 Minha Rede',
          description: 'Acompanhe seu crescimento, pontos e parceiros indicados.',
          position: 'right',
        }
      } as any);
    }

    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendi!',
      steps: steps as any,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
    });

    driverObj.drive();
  };

  return { startTour };
};
