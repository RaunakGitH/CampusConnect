import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import AddListing from "./pages/AddListing";
import Dashboard from "./pages/Dashboard";
import Partners from "./pages/Partners";
import SubscriptionPage from "./pages/SubscriptionPage";
import PriceAlerts from "./pages/PriceAlerts";
import NotFound from "./pages/NotFound";
import Saved from "./pages/Saved";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterOwner from "./pages/RegisterOwner";
import CampusBot from "./components/CampusBot";
import AdminPanel from "./pages/AdminPanel";
import RelocationChecklist from "./pages/RelocationChecklist";
import RoommateFinder from "./pages/RoommateFinder";
import MoversPackers from "./pages/MoversPackers";
import Rentals from "./pages/Rentals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/"             element={<Index />} />
            <Route path="/listings"     element={<Listings />} />
            <Route path="/listing/:id"  element={<ListingDetail />} />
            <Route path="/listings/new" element={<AddListing />} />
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/partners"     element={<Partners />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/alerts"       element={<PriceAlerts />} />
            <Route path="/saved"        element={<Saved />} />
            {/* ── FIX: Standalone login/register pages were missing ── */}
            <Route path="/login"        element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/register/owner"  element={<RegisterOwner />} />
            <Route path="/admin"                element={<AdminPanel />} />
            <Route path="/relocation-checklist" element={<RelocationChecklist />} />
            <Route path="/roommates"            element={<RoommateFinder />} />
            <Route path="/movers-packers"        element={<MoversPackers />} />
            <Route path="/rentals"               element={<Rentals />} />
            <Route path="*"                     element={<NotFound />} />
          </Routes>
          <CampusBot />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
