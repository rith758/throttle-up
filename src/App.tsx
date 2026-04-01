import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import EventsPage from "@/pages/EventsPage";
import CreateEventPage from "@/pages/CreateEventPage";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import NetworkPage from "@/pages/NetworkPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
