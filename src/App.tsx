import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import ServiceArea from "./pages/ServiceArea";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import MarketplaceLaundries from "./pages/MarketplaceLaundries";
import OrderTracking from "./pages/OrderTracking";
import LaundryDashboard from "./pages/LaundryDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import LaundryOnboarding from "./pages/LaundryOnboarding";
import RiderOnboarding from "./pages/RiderOnboarding";
import AdminOnboardingApprovals from "./pages/AdminOnboardingApprovals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/service-area" element={<ServiceArea />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/marketplace/laundries" element={<MarketplaceLaundries />} />
            <Route path="/marketplace/orders/:orderId/tracking" element={<OrderTracking />} />
            <Route path="/marketplace/laundry-dashboard" element={<LaundryDashboard />} />
            <Route path="/marketplace/rider-dashboard" element={<RiderDashboard />} />
            <Route path="/marketplace/onboarding/laundry-house" element={<LaundryOnboarding />} />
            <Route path="/marketplace/onboarding/rider" element={<RiderOnboarding />} />
            <Route path="/_saakwa/internal/admin-onboarding-approvals" element={<AdminOnboardingApprovals />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
