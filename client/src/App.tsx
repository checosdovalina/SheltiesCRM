import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Appointments from "@/pages/appointments";
import Calendar from "@/pages/calendar";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import ClientPortal from "@/pages/client-portal";
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

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Navigation />
          <Route path="/" component={Dashboard} />
          <Route path="/clients" component={Clients} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/billing" component={Billing} />
          <Route path="/reports" component={Reports} />
          {user?.role === 'client' && (
            <Route path="/portal" component={ClientPortal} />
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
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
