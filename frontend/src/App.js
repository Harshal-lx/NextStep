import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Opportunities from "@/pages/Opportunities";
import OpportunityDetails from "@/pages/OpportunityDetails";
import Saved from "@/pages/Saved";
import AIMentor from "@/pages/AIMentor";
import CalendarPage from "@/pages/CalendarPage";
import Analytics from "@/pages/Analytics";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute requireOnboarded><Dashboard /></ProtectedRoute>} />
      <Route path="/opportunities" element={<ProtectedRoute requireOnboarded><Opportunities /></ProtectedRoute>} />
      <Route path="/opportunities/:id" element={<ProtectedRoute requireOnboarded><OpportunityDetails /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute requireOnboarded><Saved /></ProtectedRoute>} />
      <Route path="/ai-mentor" element={<ProtectedRoute requireOnboarded><AIMentor /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute requireOnboarded><CalendarPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute requireOnboarded><Analytics /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute requireOnboarded><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute requireOnboarded><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster theme="dark" position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}
