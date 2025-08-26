import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Dog, Calendar, CreditCard, Camera, FileText, Star } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pets" data-testid="tab-pets">
            <Dog className="w-4 h-4 mr-2" />
            Mis Mascotas
          </TabsTrigger>
          <TabsTrigger value="appointments" data-testid="tab-appointments">
            <Calendar className="w-4 h-4 mr-2" />
            Citas
          </TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">
            <Star className="w-4 h-4 mr-2" />
            Progreso
          </TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">
            <CreditCard className="w-4 h-4 mr-2" />
            Facturación
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
