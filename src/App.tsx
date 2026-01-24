import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { OfflineBanner } from "@/components/OfflineBanner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { DesktopModeIndicator } from "@/components/DesktopModeIndicator";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import InvoicesPage from "./pages/InvoicesPage";
import InventoryPage from "./pages/InventoryPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import VendorsPage from "./pages/VendorsPage";
import PrivacyCenterPage from "./pages/PrivacyCenterPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import PricingPage from "./pages/PricingPage";
import HealthCheckPage from "./pages/HealthCheckPage";
import SystemStatusPage from "./pages/SystemStatusPage";
import EvidenceVaultPage from "./pages/EvidenceVaultPage";
import InspectionModePage from "./pages/InspectionModePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineBanner />
        <PWAInstallPrompt />
        <DesktopModeIndicator />
        <BrowserRouter>
          <AuthProvider>
            <BusinessProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/vendors" element={<VendorsPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/privacy" element={<PrivacyCenterPage />} />
                  <Route path="/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/evidence-vault" element={<EvidenceVaultPage />} />
                  <Route path="/inspection-mode" element={<InspectionModePage />} />
                  <Route path="/health" element={<HealthCheckPage />} />
                  <Route path="/system-status" element={<SystemStatusPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BusinessProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
