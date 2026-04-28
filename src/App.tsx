import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import AppBootstrap from "@/components/tenant/AppBootstrap";
import AuthGuard from "@/components/auth/AuthGuard";

// Public pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ActivatePage from "./pages/activate/ActivatePage";
import InviteLanding from "./pages/invite/InviteLanding";
import ProposalPresentation from "./pages/proposal/ProposalPresentation";
import WebsiteProposal from "./pages/proposal/WebsiteProposal";
import PublicQuizPage from "./pages/quiz/PublicQuizPage";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";

import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import MfaSetupPage from "./pages/auth/MfaSetupPage";

// Layouts
import ClubLayout from "./layouts/ClubLayout";
import PartnerLayout from "./layouts/PartnerLayout";
import CoreLayout from "./layouts/CoreLayout";
import AdminLayout from "./layouts/AdminLayout";

// Club pages
import ClubStart from "./pages/club/ClubStart";
import ClubDashboard from "./pages/club/ClubDashboard";
import ClubSubscription from "./pages/club/ClubSubscription";
import ClubOrders from "./pages/club/ClubOrders";
import ClubBenefits from "./pages/club/ClubBenefits";
import ClubContent from "./pages/club/ClubContent";
import ClubCommunity from "./pages/club/ClubCommunity";
import ClubSettings from "./pages/club/ClubSettings";
import ClubReferrals from "./pages/club/ClubReferrals";
import ClubSupport from "./pages/club/ClubSupport";

// Partner pages
import PartnerStart from "./pages/partner/PartnerStart";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerClients from "./pages/partner/PartnerClients";
import PartnerRevenue from "./pages/partner/PartnerRevenue";
import PartnerMaterials from "./pages/partner/PartnerMaterials";
import PartnerLinksPage from "./pages/partner/PartnerLinksPage";
import PartnerLevels from "./pages/partner/PartnerLevels";
import PartnerSettings from "./pages/partner/PartnerSettings";
import PartnerOnboarding from "./pages/partner/PartnerOnboarding";
import PartnerFormation from "./pages/partner/PartnerFormation";
import PartnerNetwork from "./pages/partner/PartnerNetwork";
import PartnerReferrals from "./pages/partner/PartnerReferrals";
import PartnerRanking from "./pages/partner/PartnerRanking";
import PartnerSupport from "./pages/partner/PartnerSupport";
import PartnerReferredPartners from "./pages/partner/PartnerReferredPartners";

// Core pages
import { CoreDashboard, CoreCustomers, CoreSubscriptions, CoreFinance, CoreReports, CorePermissions, CoreSettings, CorePartners, CoreCommissions, CoreGamification, CoreProducts, CoreUsers, CoreIntegrations } from "./pages/core";
import CoreSelectRole from "./pages/core/CoreSelectRole";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTenants from "./pages/admin/AdminTenants";
import AdminTenantDetail from "./pages/admin/AdminTenantDetail";
import AdminOnboarding from "./pages/admin/AdminOnboarding";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettingsPage from "./pages/admin/AdminSettings";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminVitacoins from "./pages/admin/AdminVitacoins";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminMonetization from "./pages/admin/AdminMonetization";
import UserProfile from "./pages/UserProfile";
import NotificationsPage from "./pages/notifications/NotificationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <TenantProvider>
            <AppBootstrap />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<AuthGuard requireTenant={false}><Index /></AuthGuard>} />
              <Route path="/activate" element={<ActivatePage />} />
              <Route path="/invite/:token" element={<InviteLanding />} />
              <Route path="/proposta" element={<ProposalPresentation />} />
              <Route path="/proposta-site" element={<WebsiteProposal />} />
              <Route path="/quiz/:doctorCode" element={<PublicQuizPage />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />

              {/* Auth routes */}
              <Route path="/auth/login" element={<LoginPage />} />
              
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/mfa-setup" element={<AuthGuard requireTenant={false}><MfaSetupPage /></AuthGuard>} />

              {/* Club (Cliente) - Protected */}
              <Route path="/club/start" element={<AuthGuard><ClubStart /></AuthGuard>} />
              <Route path="/club" element={<AuthGuard requiredRole="client"><ClubLayout /></AuthGuard>}>
                <Route index element={<ClubDashboard />} />
                <Route path="subscription" element={<ClubSubscription />} />
                <Route path="orders" element={<ClubOrders />} />
                <Route path="benefits" element={<ClubBenefits />} />
                <Route path="content" element={<ClubContent />} />
                <Route path="community" element={<ClubCommunity />} />
                <Route path="referrals" element={<ClubReferrals />} />
                <Route path="support" element={<ClubSupport />} />
                <Route path="settings" element={<ClubSettings />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>

              {/* Partner (Afiliado) - Protected */}
              <Route path="/partner/start" element={<AuthGuard><PartnerStart /></AuthGuard>} />
              <Route path="/partner/onboarding" element={<PartnerOnboarding />} />
              <Route path="/partner" element={<AuthGuard requiredRole="partner"><PartnerLayout /></AuthGuard>}>
                <Route index element={<PartnerDashboard />} />
                <Route path="network" element={<PartnerNetwork />} />
                <Route path="referrals" element={<PartnerReferrals />} />
                <Route path="formation" element={<PartnerFormation />} />
                <Route path="clients" element={<PartnerClients />} />
                <Route path="revenue" element={<PartnerRevenue />} />
                <Route path="materials" element={<PartnerMaterials />} />
                <Route path="links" element={<PartnerLinksPage />} />
                <Route path="levels" element={<PartnerLevels />} />
                <Route path="ranking" element={<PartnerRanking />} />
                <Route path="referred-partners" element={<PartnerReferredPartners />} />
                <Route path="support" element={<PartnerSupport />} />
                <Route path="settings" element={<PartnerSettings />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>

              {/* Core (Admin da empresa) - Protected */}
              <Route path="/core/select-role" element={<AuthGuard><CoreSelectRole /></AuthGuard>} />
              <Route path="/core" element={<AuthGuard requiredRole="admin"><CoreLayout /></AuthGuard>}>
                <Route index element={<CoreDashboard />} />
                <Route path="customers" element={<CoreCustomers />} />
                <Route path="partners" element={<CorePartners />} />
                <Route path="subscriptions" element={<CoreSubscriptions />} />
                <Route path="commissions" element={<CoreCommissions />} />
                <Route path="finance" element={<CoreFinance />} />
                <Route path="reports" element={<CoreReports />} />
                <Route path="gamification" element={<CoreGamification />} />
                <Route path="products" element={<CoreProducts />} />
                <Route path="permissions" element={<CorePermissions />} />
                <Route path="settings" element={<CoreSettings />} />
                <Route path="users" element={<CoreUsers />} />
                <Route path="integrations" element={<CoreIntegrations />} />
                 <Route path="notifications" element={<NotificationsPage />} />
                 <Route path="profile" element={<UserProfile />} />
              </Route>

              {/* Admin (All Vita - Super Admin) - Protected */}
              <Route path="/admin" element={<AuthGuard requireTenant={false} requiredRole="super_admin"><AdminLayout /></AuthGuard>}>
                <Route index element={<AdminDashboard />} />
                <Route path="tenants" element={<AdminTenants />} />
                <Route path="tenants/:id" element={<AdminTenantDetail />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="audit" element={<AdminAudit />} />
                <Route path="security" element={<AdminSecurity />} />
                <Route path="finance" element={<AdminFinance />} />
                <Route path="vitacoins" element={<AdminVitacoins />} />
                <Route path="integrations" element={<AdminIntegrations />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="monetization" element={<AdminMonetization />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* Onboarding */}
              <Route path="/onboarding" element={<AuthGuard requireTenant={false}><AdminOnboarding /></AuthGuard>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </HelmetProvider>
</QueryClientProvider>
);

export default App;
