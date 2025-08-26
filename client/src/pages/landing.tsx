import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, DollarSign, TrendingUp, Star, Shield, Heart } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="bg-card border-b border-border px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Shelties CRM</h1>
          </div>
          <Button onClick={handleLogin} data-testid="button-login">
            Iniciar Sesión
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Sistema de Gestión para 
            <span className="text-primary block mt-2">Entrenamiento Canino</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Administra clientes, citas, facturación y seguimiento de progreso para tu negocio de entrenamiento canino con Shelties CRM.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
              Comenzar Ahora
            </Button>
            <Button variant="outline" size="lg" data-testid="button-learn-more">
              Conocer Más
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Todo lo que necesitas para tu negocio
            </h3>
            <p className="text-lg text-muted-foreground">
              Herramientas completas para gestionar tu centro de entrenamiento canino
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CalendarDays className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Gestión de Citas</CardTitle>
                <CardDescription>
                  Programa y gestiona citas de entrenamiento, kinder canino y hospedaje
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-accent mb-4" />
                <CardTitle>Control de Clientes</CardTitle>
                <CardDescription>
                  Mantén registro detallado de clientes y sus mascotas con historial completo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="w-12 h-12 text-chart-2 mb-4" />
                <CardTitle>Facturación Integrada</CardTitle>
                <CardDescription>
                  Genera facturas automáticamente y envía recibos por correo electrónico
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-chart-4 mb-4" />
                <CardTitle>Reportes Financieros</CardTitle>
                <CardDescription>
                  Controla ingresos, gastos y rentabilidad con reportes detallados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Star className="w-12 h-12 text-chart-1 mb-4" />
                <CardTitle>Seguimiento de Progreso</CardTitle>
                <CardDescription>
                  Documenta el progreso de cada mascota con fotos y videos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Portal del Cliente</CardTitle>
                <CardDescription>
                  Los clientes pueden ver el historial y progreso de sus mascotas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Servicios Especializados
            </h3>
            <p className="text-lg text-muted-foreground">
              Gestiona todos tus servicios desde una sola plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Entrenamiento Individual</CardTitle>
                <CardDescription>
                  Sesiones personalizadas de entrenamiento para cada perro según sus necesidades específicas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-8">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl mb-2">Kinder Canino</CardTitle>
                <CardDescription>
                  Socialización y actividades grupales para cachorros y perros jóvenes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-8">
              <CardHeader>
                <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-chart-2" />
                </div>
                <CardTitle className="text-xl mb-2">Hospedaje</CardTitle>
                <CardDescription>
                  Cuidado profesional y alojamiento seguro para mascotas mientras sus dueños viajan
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-foreground mb-6">
            ¿Listo para optimizar tu negocio?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Únete a Shelties CRM y lleva la gestión de tu centro de entrenamiento canino al siguiente nivel.
          </p>
          <Button size="lg" onClick={handleLogin} data-testid="button-start-now">
            Comenzar Ahora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">S</span>
            </div>
            <span className="font-semibold text-foreground">Shelties CRM</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Shelties CRM. Sistema de gestión para entrenamiento canino.
          </p>
        </div>
      </footer>
    </div>
  );
}
