import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  Calendar, 
  CreditCard, 
  Home, 
  Users, 
  Menu, 
  X,
  LogOut,
  User,
  ChevronDown,
  Settings
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
    { path: "/appointments", label: "Citas", icon: Calendar, mobileLabel: "Citas" },
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
  } else if (user?.role === 'admin') {
    filteredNavigation = [...navigationItems, ...adminItems];
  } else {
    filteredNavigation = navigationItems;
  }

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden md:block bg-card border-b border-border px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src={logoSheltiesSmall}
                alt="Shelties"
                className="h-8 w-auto object-contain"
                data-testid="img-navigation-logo"
              />
              <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">
                Shelties CRM
              </h1>
            </div>
            
            <div className="flex items-center space-x-1 ml-8">
              <nav className="flex space-x-1">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`px-3 py-2 text-sm font-medium ${
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        data-testid={`nav-${item.path.replace('/', '') || 'dashboard'}`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span data-testid="text-user-name">
                {user?.firstName || user?.email || 'Usuario'}
              </span>
              {user?.role && (
                <span className="px-2 py-1 bg-muted rounded text-xs" data-testid="text-user-role">
                  {user.role === 'client' ? 'Cliente' : user.role === 'teacher' ? 'Profesor' : 'Admin'}
                </span>
              )}
            </div>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground" data-testid="text-user-initials">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
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
        <div className="flex items-center">
          {filteredNavigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path} className="mobile-nav-item">
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center justify-center h-12 w-full border-0 ${
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`bottom-nav-${item.path.replace('/', '') || 'dashboard'}`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.mobileLabel}</span>
                </Button>
              </Link>
            );
          })}
          
          {filteredNavigation.length > 4 && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center justify-center h-12 w-full text-muted-foreground hover:text-foreground border-0 mobile-nav-item"
                  data-testid="bottom-nav-more"
                >
                  <Menu className="w-5 h-5 mb-1" />
                  <span className="text-xs">Más</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <div className="grid grid-cols-2 gap-4 p-4">
                  {filteredNavigation.slice(4).map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start touch-target ${
                            isActive 
                              ? "bg-primary/10 text-primary" 
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          data-testid={`more-nav-${item.path.replace('/', '') || 'dashboard'}`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </>
  );
}
