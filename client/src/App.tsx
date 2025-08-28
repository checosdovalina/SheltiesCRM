import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Services from "@/pages/services";
import Appointments from "@/pages/appointments";
import Calendar from "@/pages/calendar";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import Records from "@/pages/records";
import RecordDetail from "@/pages/record-detail";
import ClientPortal from "@/pages/client-portal";
import TeacherPortal from "@/pages/teacher-portal";
import Users from "@/pages/users";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/landing" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/clients" component={Clients} />
          <Route path="/services" component={Services} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/billing" component={Billing} />
          <Route path="/reports" component={Reports} />
          <Route path="/records" component={Records} />
          <Route path="/records/:dogId" component={RecordDetail} />
          {user?.role === 'client' && (
            <Route path="/portal" component={ClientPortal} />
          )}
          {user?.role === 'teacher' && (
            <Route path="/teacher-portal" component={TeacherPortal} />
          )}
          {user?.role === 'admin' && (
            <Route path="/admin/users" component={Users} />
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
