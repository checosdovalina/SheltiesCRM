import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  Calendar, 
  CalendarDays,
  CreditCard, 
  Home, 
  Users, 
  Menu, 
  X,
  LogOut,
  User,
  ChevronDown,
  Settings,
  Wrench,
  FileText,
  ClipboardList
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoSheltiesSmall from "@assets/logo shelties_1756234743860.png";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      // Fallback - still redirect
      window.location.href = "/";
    }
  };

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: Home, mobileLabel: "Inicio" },
    { path: "/clients", label: "Clientes", icon: Users, mobileLabel: "Clientes" },
    { path: "/services", label: "Servicios", icon: Wrench, mobileLabel: "Servicios" },
    { path: "/protocolos", label: "Protocolos", icon: ClipboardList, mobileLabel: "Protocolos" },
    { path: "/appointments", label: "Citas", icon: Calendar, mobileLabel: "Citas" },
    { path: "/calendar", label: "Calendario", icon: CalendarDays, mobileLabel: "Calendario" },
    { path: "/records", label: "Expedientes", icon: FileText, mobileLabel: "Expedientes" },
    { path: "/billing", label: "Facturación", icon: CreditCard, mobileLabel: "Facturas" },
    { path: "/reports", label: "Reportes", icon: BarChart3, mobileLabel: "Reportes" },
  ];

  const adminItems = [
    { path: "/admin/users", label: "Gestión de Usuarios", icon: Settings, mobileLabel: "Usuarios" },
  ];

  // Filter navigation based on user role
  let filteredNavigation;
  if (user?.role === 'client') {
    filteredNavigation = [{ path: "/portal", label: "Mi Portal", icon: User, mobileLabel: "Portal" }];
  } else if (user?.role === 'teacher') {
    filteredNavigation = [
      { path: "/teacher-portal", label: "Portal Entrenador", icon: User, mobileLabel: "Portal" },
      { path: "/records", label: "Expedientes", icon: FileText, mobileLabel: "Expedientes" },
    ];
  } else if (user?.role === 'admin') {
    filteredNavigation = [...navigationItems, ...adminItems];
  } else {
    filteredNavigation = navigationItems;
  }

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden md:block bg-card shadow-sm">
        {/* Header with logo and user info */}
        <div className="border-b border-border px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={logoSheltiesSmall}
                alt="Shelties"
                className="h-10 w-auto object-contain"
                data-testid="img-navigation-logo"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-app-title">
                  Shelties CRM
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sistema de gestión canina
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary" data-testid="text-user-initials">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground" data-testid="text-user-name">
                    {user?.firstName || user?.email || 'Usuario'}
                  </div>
                  {user?.role && (
                    <div className="text-xs text-muted-foreground" data-testid="text-user-role">
                      {user.role === 'client' ? 'Cliente' : user.role === 'teacher' ? 'Profesor' : 'Admin'}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation menu */}
        <div className="px-6 py-3 bg-muted/30">
          <div className="max-w-7xl mx-auto overflow-x-auto scrollbar-hide">
            <nav className="flex items-center space-x-2 min-w-max">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground hover:bg-background"
                      }`}
                      data-testid={`nav-${item.path.replace('/', '') || 'dashboard'}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden bg-card border-b border-border mobile-safe-area">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <img 
              src={logoSheltiesSmall}
              alt="Shelties"
              className="h-8 w-auto object-contain"
              data-testid="img-mobile-navigation-logo"
            />
            <h1 className="text-lg font-bold text-foreground" data-testid="text-app-title-mobile">
              Shelties
            </h1>
          </div>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="touch-target"
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-2 pb-6 border-b">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {user?.firstName || user?.email || 'Usuario'}
                    </div>
                    {user?.role && (
                      <div className="text-sm text-muted-foreground">
                        {user.role === 'client' ? 'Cliente' : user.role === 'teacher' ? 'Profesor' : 'Admin'}
                      </div>
                    )}
                  </div>
                </div>

                <nav className="flex-1 py-6">
                  {filteredNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start mb-2 touch-target ${
                            isActive 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid={`mobile-nav-${item.path.replace('/', '') || 'dashboard'}`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive touch-target"
                    onClick={handleLogout}
                    data-testid="mobile-button-logout"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden mobile-nav">
        <div className="flex items-center justify-around">
          {filteredNavigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path} className="flex-1">
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center justify-center h-14 w-full border-0 rounded-none ${
                    isActive 
                      ? "text-primary bg-primary/5" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`bottom-nav-${item.path.replace('/', '') || 'dashboard'}`}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] leading-tight">{item.mobileLabel}</span>
                </Button>
              </Link>
            );
          })}
          
          {filteredNavigation.length > 5 && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center justify-center h-14 flex-1 text-muted-foreground hover:text-foreground border-0 rounded-none"
                  data-testid="bottom-nav-more"
                >
                  <Menu className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] leading-tight">Más</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[60vh] rounded-t-xl">
                <div className="pt-2 pb-6">
                  <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                  <div className="grid grid-cols-3 gap-3 px-2">
                    {filteredNavigation.slice(5).map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.path;
                      
                      return (
                        <Link key={item.path} href={item.path}>
                          <Button
                            variant="ghost"
                            className={`w-full flex flex-col items-center justify-center h-20 rounded-xl ${
                              isActive 
                                ? "bg-primary/10 text-primary" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                            data-testid={`more-nav-${item.path.replace('/', '') || 'dashboard'}`}
                          >
                            <Icon className="w-6 h-6 mb-1" />
                            <span className="text-xs">{item.mobileLabel}</span>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </>
  );
}
