import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Heart, Trophy, Users, Clock, Star, Shield, CheckCircle, Bone, Award } from "lucide-react";
import { Link } from "wouter";
import logoSheltiesImage from "@assets/logo-shelties-2_1756234700564.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={logoSheltiesImage} 
              alt="Instituto Shelties" 
              className="h-12 w-auto object-contain"
              data-testid="img-logo-shelties"
            />
          </div>
          <Link href="/login">
            <Button data-testid="button-login" className="gap-2">
              <Shield className="w-4 h-4" />
              Acceder a Mi Cuenta
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Award className="w-4 h-4" />
                Instituto de Entrenamiento Canino
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Transforma a tu mascota en su
              <span className="text-primary block mt-2">mejor versión</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              En Instituto Shelties ofrecemos servicios profesionales de entrenamiento, socialización y cuidado para tu compañero canino.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="gap-2" data-testid="button-get-started">
                  <GraduationCap className="w-5 h-5" />
                  Comenzar Ahora
                </Button>
              </Link>
              <Button variant="outline" size="lg" data-testid="button-contact">
                Contactar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Products Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Programas especializados para cada etapa y necesidad de tu mascota
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors" data-testid="card-service-training">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">Entrenamiento Personalizado</CardTitle>
                <CardDescription className="text-base">
                  Sesiones individuales adaptadas a las necesidades específicas de tu perro. Obediencia básica, avanzada y corrección de conductas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Evaluación inicial gratuita</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Plan personalizado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Seguimiento continuo</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors" data-testid="card-service-kinder">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl mb-2">Kinder Canino</CardTitle>
                <CardDescription className="text-base">
                  Socialización y actividades grupales para cachorros y perros jóvenes. Aprenden a convivir y jugar de forma saludable.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm">Grupos reducidos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm">Supervisión profesional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm">Ambiente seguro</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors" data-testid="card-service-boarding">
              <CardHeader>
                <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-chart-2" />
                </div>
                <CardTitle className="text-2xl mb-2">Hospedaje Premium</CardTitle>
                <CardDescription className="text-base">
                  Cuidado profesional y alojamiento de lujo para tu mascota. Tu perro en las mejores manos mientras viajas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-chart-2" />
                    <span className="text-sm">Atención 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-chart-2" />
                    <span className="text-sm">Instalaciones modernas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-chart-2" />
                    <span className="text-sm">Actualizaciones diarias</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Beneficios para ti y tu mascota
            </h2>
            <p className="text-lg text-muted-foreground">
              Todo lo que necesitas para el bienestar de tu compañero canino
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6" data-testid="card-benefit-trainers">
              <CardHeader className="pb-4">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg">Entrenadores Certificados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Profesionales con certificación internacional y años de experiencia
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6" data-testid="card-benefit-tracking">
              <CardHeader className="pb-4">
                <Star className="w-12 h-12 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg">Seguimiento de Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acceso a portal digital con fotos, videos y reportes de avance
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6" data-testid="card-benefit-flexible">
              <CardHeader className="pb-4">
                <Clock className="w-12 h-12 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg">Horarios Flexibles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Agenda citas que se adapten a tu estilo de vida
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6" data-testid="card-benefit-guarantee">
              <CardHeader className="pb-4">
                <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg">Garantía de Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Métodos probados que transforman el comportamiento canino
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products/Packages Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Paquetes y Productos
            </h2>
            <p className="text-lg text-muted-foreground">
              Opciones diseñadas para cada necesidad y presupuesto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden" data-testid="card-package-basic">
              <CardHeader className="pb-4">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                  BÁSICO
                </div>
                <CardTitle className="text-2xl">Paquete Inicial</CardTitle>
                <CardDescription>Para comenzar el entrenamiento</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$XXX</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">4 sesiones de entrenamiento al mes</span>
                </div>
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Evaluación inicial</span>
                </div>
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Acceso al portal del cliente</span>
                </div>
                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full" variant="outline" data-testid="button-select-basic">
                      Seleccionar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-primary border-2 shadow-lg" data-testid="card-package-premium">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
                POPULAR
              </div>
              <CardHeader className="pb-4">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                  PREMIUM
                </div>
                <CardTitle className="text-2xl">Paquete Completo</CardTitle>
                <CardDescription>Lo mejor para tu mascota</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$XXX</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">8 sesiones de entrenamiento al mes</span>
                </div>
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Acceso ilimitado a Kinder Canino</span>
                </div>
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Reportes detallados con fotos/videos</span>
                </div>
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Descuento en hospedaje (20%)</span>
                </div>
                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full" data-testid="button-select-premium">
                      Seleccionar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden" data-testid="card-package-vip">
              <CardHeader className="pb-4">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                  VIP
                </div>
                <CardTitle className="text-2xl">Paquete Elite</CardTitle>
                <CardDescription>Experiencia premium total</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$XXX</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Entrenamiento ilimitado</span>
                </div>
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Kinder Canino ilimitado</span>
                </div>
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Sesiones a domicilio disponibles</span>
                </div>
                <div className="flex items-start gap-2">
                  <Bone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Hospedaje con descuento (30%)</span>
                </div>
                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full" variant="outline" data-testid="button-select-vip">
                      Seleccionar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para comenzar el viaje con tu mascota?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a cientos de familias felices que confían en Instituto Shelties para el cuidado y entrenamiento de sus mascotas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-start-journey">
                <GraduationCap className="w-5 h-5" />
                Comenzar Ahora
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 hover:bg-primary-foreground/10" data-testid="button-schedule-visit">
              Agendar Visita
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <img 
                src={logoSheltiesImage} 
                alt="Instituto Shelties" 
                className="h-12 w-auto object-contain mb-4"
              />
              <p className="text-sm text-muted-foreground">
                Instituto de entrenamiento y cuidado canino con más de 10 años de experiencia transformando vidas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Servicios</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Entrenamiento Personalizado</li>
                <li>Kinder Canino</li>
                <li>Hospedaje Premium</li>
                <li>Consultas Online</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Contacto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contacto@shelties.com</li>
                <li>+52 (XXX) XXX-XXXX</li>
                <li>Lun - Sáb: 8:00 - 20:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Instituto Shelties. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
