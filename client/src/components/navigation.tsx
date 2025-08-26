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
  User
} from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/clients", label: "Clientes", icon: Users },
    { path: "/appointments", label: "Citas", icon: Calendar },
    { path: "/calendar", label: "Calendario", icon: Calendar },
    { path: "/billing", label: "Facturación", icon: CreditCard },
    { path: "/reports", label: "Reportes", icon: BarChart3 },
  ];

  // Filter navigation based on user role
  const filteredNavigation = user?.role === 'client' 
    ? [{ path: "/portal", label: "Mi Portal", icon: User }]
    : navigationItems;

  return (
    <nav className="bg-card border-b border-border px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">
              Shelties CRM
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 ml-8">
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

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span data-testid="text-user-name">
              {user?.firstName || user?.email || 'Usuario'}
            </span>
            {user?.role && (
              <span className="px-2 py-1 bg-muted rounded text-xs" data-testid="text-user-role">
                {user.role === 'client' ? 'Cliente' : 'Admin'}
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

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border mt-3 pt-3">
          <div className="flex flex-col space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.path.replace('/', '') || 'dashboard'}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <div className="border-t border-border pt-3 mt-3">
              <div className="px-3 py-2 text-sm text-muted-foreground" data-testid="mobile-user-info">
                {user?.firstName || user?.email || 'Usuario'} 
                {user?.role && ` (${user.role === 'client' ? 'Cliente' : 'Admin'})`}
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
                data-testid="mobile-button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
