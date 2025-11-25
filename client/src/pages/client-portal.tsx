import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Dog, Calendar, CreditCard, Camera, FileText, Star, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ClientPortal() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "No autorizado",
        description: "Iniciando sesión nuevamente...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Redirect to main dashboard if user is not a client
  useEffect(() => {
    if (user && user.role !== 'client') {
      toast({
        title: "Acceso denegado",
        description: "Esta sección es solo para clientes.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [user, toast]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/client-portal/profile"],
    enabled: isAuthenticated && user?.role === 'client',
    retry: false,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/client-portal/appointments"],
    enabled: isAuthenticated && user?.role === 'client',
    retry: false,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/client-portal/invoices"],
    enabled: isAuthenticated && user?.role === 'client',
    retry: false,
  });

  const { data: packages, isLoading: packagesLoading } = useQuery<any[]>({
    queryKey: ["/api/clients", profile?.client?.id, "packages"],
    enabled: isAuthenticated && user?.role === 'client' && !!profile?.client?.id,
    retry: false,
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<any[]>({
    queryKey: ["/api/clients", profile?.client?.id, "alerts", "unread"],
    enabled: isAuthenticated && user?.role === 'client' && !!profile?.client?.id,
    retry: false,
  });

  if (isLoading || !isAuthenticated || (user && user.role !== 'client')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-accent/10 text-accent border-accent/20';
      case 'pending': return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      case 'completed': return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-primary/10 text-primary border-primary/20';
      case 'daycare': return 'bg-accent/10 text-accent border-accent/20';
      case 'boarding': return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getServiceTypeText = (type: string) => {
    switch (type) {
      case 'training': return 'Entrenamiento';
      case 'daycare': return 'Kinder';
      case 'boarding': return 'Hospedaje';
      default: return type;
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-accent/10 text-accent border-accent/20';
      case 'sent': return 'bg-primary/10 text-primary border-primary/20';
      case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getInvoiceStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'sent': return 'Enviada';
      case 'overdue': return 'Vencida';
      case 'draft': return 'Borrador';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPackageStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'finishing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getPackageStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'finishing': return 'Por terminar';
      case 'completed': return 'Completado';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  const getPackageStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'finishing': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-portal-title">
          Mi Portal
        </h2>
        <p className="text-muted-foreground">
          Información y seguimiento de tus mascotas en Shelties
        </p>
      </div>

      {/* Profile Overview */}
      {profileLoading ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="w-16 h-16 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : profile ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {profile.client?.firstName?.[0]}{profile.client?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-1" data-testid="text-client-name">
                  {profile.client?.firstName} {profile.client?.lastName}
                </h3>
                <p className="text-muted-foreground mb-2" data-testid="text-client-email">
                  {profile.client?.email}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {profile.client?.phone && (
                    <span data-testid="text-client-phone">📞 {profile.client.phone}</span>
                  )}
                  <span data-testid="text-pets-count">
                    🐕 {profile.dogs?.length || 0} mascota{profile.dogs?.length !== 1 ? 's' : ''} registrada{profile.dogs?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="pets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pets" data-testid="tab-pets">
            <Dog className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Mis Mascotas</span>
            <span className="sm:hidden">Mascotas</span>
          </TabsTrigger>
          <TabsTrigger value="packages" data-testid="tab-packages" className="relative">
            <Package className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Paquetes</span>
            <span className="sm:hidden">Paq.</span>
            {alerts && alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="appointments" data-testid="tab-appointments">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Citas</span>
            <span className="sm:hidden">Citas</span>
          </TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">
            <Star className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Progreso</span>
            <span className="sm:hidden">Prog.</span>
          </TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">
            <CreditCard className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Facturación</span>
            <span className="sm:hidden">Fact.</span>
          </TabsTrigger>
        </TabsList>

        {/* Pets Tab */}
        <TabsContent value="pets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : profile?.dogs?.length > 0 ? (
              profile.dogs.map((dog: any) => (
                <Card key={dog.id} data-testid={`pet-card-${dog.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Dog className="w-5 h-5 text-primary" />
                      <span data-testid={`pet-name-${dog.id}`}>{dog.name}</span>
                    </CardTitle>
                    {dog.breed && (
                      <p className="text-sm text-muted-foreground" data-testid={`pet-breed-${dog.id}`}>
                        {dog.breed}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dog.age && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Edad:</span>
                          <span className="text-foreground" data-testid={`pet-age-${dog.id}`}>
                            {dog.age} año{dog.age !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {dog.weight && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Peso:</span>
                          <span className="text-foreground" data-testid={`pet-weight-${dog.id}`}>
                            {dog.weight} kg
                          </span>
                        </div>
                      )}
                      {dog.notes && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground" data-testid={`pet-notes-${dog.id}`}>
                            {dog.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
                    <Dog className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-pets">
                      No hay mascotas registradas
                    </h3>
                    <p className="text-muted-foreground">
                      Contacta con nosotros para registrar a tu mascota
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages">
          <div className="space-y-6">
            {/* Active Packages Alert Banner */}
            {alerts && alerts.length > 0 && (
              <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Tienes {alerts.length} notificación{alerts.length !== 1 ? 'es' : ''} pendiente{alerts.length !== 1 ? 's' : ''}
                      </h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {alerts.slice(0, 3).map((alert: any) => (
                          <li key={alert.id}>• {alert.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Packages List */}
            {packagesLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-2 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : packages && packages.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {packages.map((pkg: any) => {
                  const progressPercentage = pkg.totalSessions > 0 
                    ? ((pkg.totalSessions - pkg.remainingSessions) / pkg.totalSessions) * 100 
                    : 0;
                  
                  return (
                    <Card key={pkg.id} data-testid={`package-card-${pkg.id}`} className={
                      pkg.status === 'finishing' ? 'border-yellow-300' : 
                      pkg.status === 'expired' ? 'border-red-300' : ''
                    }>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Package className="w-5 h-5 text-primary" />
                              {pkg.packageName}
                            </CardTitle>
                            {pkg.service && (
                              <p className="text-sm text-muted-foreground mt-1">{pkg.service.name}</p>
                            )}
                          </div>
                          <Badge variant="outline" className={getPackageStatusColor(pkg.status)}>
                            {getPackageStatusIcon(pkg.status)}
                            <span className="ml-1">{getPackageStatusText(pkg.status)}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Sessions Progress */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Sesiones utilizadas</span>
                              <span className="font-medium">{pkg.usedSessions} de {pkg.totalSessions}</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-muted-foreground">
                                Restantes: {pkg.remainingSessions}
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round(progressPercentage)}% completado
                              </span>
                            </div>
                          </div>

                          {/* Package Details */}
                          <div className="pt-3 border-t border-border space-y-2">
                            {pkg.dog && (
                              <div className="flex items-center gap-2 text-sm">
                                <Dog className="w-4 h-4 text-muted-foreground" />
                                <span>Mascota: {pkg.dog.name}</span>
                              </div>
                            )}
                            {pkg.expiryDate && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  Expira: {format(new Date(pkg.expiryDate), "dd 'de' MMMM, yyyy", { locale: es })}
                                </span>
                              </div>
                            )}
                            {pkg.purchaseDate && (
                              <div className="text-xs text-muted-foreground">
                                Adquirido: {format(new Date(pkg.purchaseDate), "dd/MM/yyyy", { locale: es })}
                              </div>
                            )}
                          </div>

                          {/* Warning for finishing packages */}
                          {pkg.status === 'finishing' && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mt-3">
                              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Te quedan pocas sesiones. Considera renovar tu paquete.</span>
                              </div>
                            </div>
                          )}

                          {pkg.status === 'completed' && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mt-3">
                              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>Paquete completado. ¡Contáctanos para renovar!</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No tienes paquetes activos
                  </h3>
                  <p className="text-muted-foreground">
                    Contáctanos para adquirir un paquete de sesiones
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <div className="space-y-4">
            {appointmentsLoading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : appointments?.length > 0 ? (
              appointments.map((appointment: any) => (
                <Card key={appointment.id} data-testid={`appointment-card-${appointment.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground" data-testid={`appointment-dog-${appointment.id}`}>
                              {appointment.dog?.name}
                            </h3>
                            <Badge variant="outline" className={getServiceTypeColor(appointment.service?.type)}>
                              {getServiceTypeText(appointment.service?.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1" data-testid={`appointment-service-${appointment.id}`}>
                            {appointment.service?.name}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid={`appointment-datetime-${appointment.id}`}>
                            {new Date(appointment.appointmentDate).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                        {appointment.price && (
                          <span className="text-lg font-semibold text-foreground" data-testid={`appointment-price-${appointment.id}`}>
                            ${Number(appointment.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground" data-testid={`appointment-notes-${appointment.id}`}>
                          <strong>Notas:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-appointments">
                    No hay citas programadas
                  </h3>
                  <p className="text-muted-foreground">
                    Contacta con nosotros para agendar tu próxima cita
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Seguimiento de Progreso</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-progress-coming-soon">
                  Próximamente
                </h3>
                <p className="text-muted-foreground">
                  Aquí podrás ver fotos, videos y notas del progreso de tus mascotas durante el entrenamiento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="space-y-4">
            {invoicesLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 bg-muted rounded w-20"></div>
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : invoices?.length > 0 ? (
              invoices.map((invoice: any) => (
                <Card key={invoice.id} data-testid={`invoice-card-${invoice.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground" data-testid={`invoice-number-${invoice.id}`}>
                              {invoice.invoiceNumber}
                            </h3>
                            <Badge className={getInvoiceStatusColor(invoice.status)}>
                              {getInvoiceStatusText(invoice.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground" data-testid={`invoice-date-${invoice.id}`}>
                            Fecha: {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                          </p>
                          {invoice.dueDate && (
                            <p className="text-sm text-muted-foreground">
                              Vence: {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground" data-testid={`invoice-amount-${invoice.id}`}>
                          ${Number(invoice.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-invoices">
                    No hay facturas disponibles
                  </h3>
                  <p className="text-muted-foreground">
                    Las facturas aparecerán aquí una vez que se generen
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
