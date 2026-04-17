import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/components/AuthProvider";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PolicyForm from "./pages/PolicyForm.tsx";
import Simulation from "./pages/Simulation.tsx";
import Profile from "./pages/Profile.tsx";
import Loans from "./pages/Loans.tsx";
import Contributions from "./pages/Contributions.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
            <Route path="/policy" element={<ProtectedRoute adminOnly><PolicyForm /></ProtectedRoute>} />
            <Route path="/simulation" element={<ProtectedRoute adminOnly><Simulation /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute adminOnly><Loans /></ProtectedRoute>} />
            <Route path="/contributions" element={<ProtectedRoute adminOnly><Contributions /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
