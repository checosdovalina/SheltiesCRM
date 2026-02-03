import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  User, Dog as DogIcon, Calendar, CreditCard, Camera, FileText, Star, Package, 
  AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, 
  Activity, Stethoscope, GraduationCap, PlayCircle, ClipboardList, Plus, CalendarPlus,
  Video, Image as ImageIcon, File, ExternalLink, Receipt, Eye, Printer
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PaymentModal from "@/components/payment-modal";

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
    queryKey: ["/api/client-portal/packages"],
    enabled: isAuthenticated && user?.role === 'client',
    retry: false,
  });

  const { data: myPayments, isLoading: paymentsLoading } = useQuery<any[]>({
    queryKey: ["/api/client-portal/payments"],
    enabled: isAuthenticated && user?.role === 'client',
    retry: false,
  });

  const [selectedDogForProgress, setSelectedDogForProgress] = useState<string | null>(null);
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});
  const [showRequestAppointment, setShowRequestAppointment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    dogId: '',
    packageId: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });

  const { data: dogProgress, isLoading: progressLoading } = useQuery<any>({
    queryKey: ["/api/client-portal/dogs", selectedDogForProgress, "progress"],
    enabled: isAuthenticated && user?.role === 'client' && !!selectedDogForProgress,
    retry: false,
  });

  const requestAppointmentMutation = useMutation({
    mutationFn: async (data: typeof appointmentForm) => {
      const response = await apiRequest('POST', '/api/client-portal/request-appointment', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cita ha sido enviada. Te confirmaremos pronto.",
      });
      setShowRequestAppointment(false);
      setAppointmentForm({ dogId: '', packageId: '', preferredDate: '', preferredTime: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ["/api/client-portal/appointments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    }
  });

  const handleRequestAppointment = () => {
    if (!appointmentForm.dogId || !appointmentForm.preferredDate) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una mascota y fecha preferida",
        variant: "destructive",
      });
      return;
    }
    requestAppointmentMutation.mutate(appointmentForm);
  };

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
            <DogIcon className="w-4 h-4 mr-2" />
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
                      <DogIcon className="w-5 h-5 text-primary" />
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
                    <DogIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
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
                  const isExpanded = expandedPackages[pkg.id] || false;
                  
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
                              <span className="font-medium">{pkg.usedSessions || 0} de {pkg.totalSessions}</span>
                            </div>
                            <Progress value={progressPercentage} className="h-3" />
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-green-600 font-medium">
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
                                <DogIcon className="w-4 h-4 text-muted-foreground" />
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

                          {/* Sessions History Collapsible */}
                          {pkg.sessions && pkg.sessions.length > 0 && (
                            <Collapsible 
                              open={isExpanded}
                              onOpenChange={(open) => setExpandedPackages(prev => ({...prev, [pkg.id]: open}))}
                            >
                              <CollapsibleTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-between mt-2"
                                  data-testid={`btn-toggle-sessions-${pkg.id}`}
                                >
                                  <span className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" />
                                    Ver historial de sesiones ({pkg.totalSessionsRecorded})
                                  </span>
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                                  {pkg.sessions.map((session: any, idx: number) => (
                                    <div 
                                      key={session.id || idx} 
                                      className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg text-sm"
                                      data-testid={`session-item-${session.id || idx}`}
                                    >
                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <PlayCircle className="w-4 h-4 text-primary" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium">
                                          {session.sessionType === 'training' ? 'Entrenamiento' :
                                           session.sessionType === 'evaluation' ? 'Evaluación' :
                                           session.sessionType === 'follow-up' ? 'Seguimiento' : 'Sesión'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {format(new Date(session.sessionDate), "dd/MM/yyyy", { locale: es })}
                                        </div>
                                      </div>
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Completada
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}

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
            {/* Request Appointment Button */}
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowRequestAppointment(true)}
                className="gap-2"
                data-testid="btn-request-appointment"
              >
                <CalendarPlus className="w-4 h-4" />
                Solicitar Cita
              </Button>
            </div>

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
          <div className="space-y-6">
            {/* Dog Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>Progreso de tu Mascota</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.dogs && profile.dogs.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Selecciona una mascota para ver su progreso detallado:
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {profile.dogs.map((dog: any) => (
                        <Button
                          key={dog.id}
                          variant={selectedDogForProgress === dog.id ? "default" : "outline"}
                          className="h-auto p-4 flex flex-col items-center gap-2"
                          onClick={() => setSelectedDogForProgress(dog.id)}
                          data-testid={`btn-select-dog-${dog.id}`}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                              {dog.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{dog.name}</span>
                          <span className="text-xs text-muted-foreground">{dog.breed}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DogIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay mascotas registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Timeline */}
            {selectedDogForProgress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Línea de Tiempo - {dogProgress?.dog?.name}
                    </span>
                    {dogProgress?.summary && (
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          {dogProgress.summary.totalTrainingSessions} entrenamientos
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <ClipboardList className="w-3 h-3 mr-1" />
                          {dogProgress.summary.totalProgressEntries} notas
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          <Stethoscope className="w-3 h-3 mr-1" />
                          {dogProgress.summary.totalMedicalRecords} médicos
                        </Badge>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          <Camera className="w-3 h-3 mr-1" />
                          {dogProgress.summary.totalEvidence} evidencias
                        </Badge>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progressLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                          <div className="w-10 h-10 bg-muted rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/3"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dogProgress?.timeline && dogProgress.timeline.length > 0 ? (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="relative">
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border"></div>
                        <div className="space-y-6">
                          {dogProgress.timeline.map((item: any, idx: number) => (
                            <div key={idx} className="relative flex gap-4" data-testid={`timeline-item-${idx}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                                item.type === 'training' ? 'bg-blue-100 text-blue-600' :
                                item.type === 'progress' ? 'bg-green-100 text-green-600' :
                                item.type === 'medical' ? 'bg-purple-100 text-purple-600' :
                                item.type === 'evidence' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {item.type === 'training' && <GraduationCap className="w-5 h-5" />}
                                {item.type === 'progress' && <Star className="w-5 h-5" />}
                                {item.type === 'medical' && <Stethoscope className="w-5 h-5" />}
                                {item.type === 'evidence' && <Camera className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 bg-muted/30 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {format(new Date(item.date), "dd 'de' MMMM, yyyy", { locale: es })}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className={
                                    item.type === 'training' ? 'bg-blue-50 text-blue-700' :
                                    item.type === 'progress' ? 'bg-green-50 text-green-700' :
                                    item.type === 'medical' ? 'bg-purple-50 text-purple-700' :
                                    item.type === 'evidence' ? 'bg-orange-50 text-orange-700' :
                                    'bg-gray-50 text-gray-700'
                                  }>
                                    {item.type === 'training' ? 'Entrenamiento' :
                                     item.type === 'progress' ? 'Progreso' : 
                                     item.type === 'medical' ? 'Médico' :
                                     item.type === 'evidence' ? 'Evidencia' : 'Otro'}
                                  </Badge>
                                </div>
                                
                                {/* Training Session Details */}
                                {item.type === 'training' && (
                                  <div className="space-y-2 text-sm">
                                    {item.trainer && (
                                      <p><strong>Entrenador:</strong> {item.trainer}</p>
                                    )}
                                    {item.duration && (
                                      <p><strong>Duración:</strong> {item.duration} minutos</p>
                                    )}
                                    {item.exercises && (
                                      <p><strong>Ejercicios:</strong> {item.exercises}</p>
                                    )}
                                    {item.progress && (
                                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                        <p className="text-green-700 dark:text-green-300">
                                          <strong>Avance:</strong> {item.progress}
                                        </p>
                                      </div>
                                    )}
                                    {item.observations && (
                                      <p className="text-muted-foreground italic">{item.observations}</p>
                                    )}
                                  </div>
                                )}

                                {/* Progress Entry Details */}
                                {item.type === 'progress' && (
                                  <div className="space-y-2 text-sm">
                                    {item.description && (
                                      <p>{item.description}</p>
                                    )}
                                    {item.rating && (
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star 
                                            key={i} 
                                            className={`w-4 h-4 ${i < item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Medical Record Details */}
                                {item.type === 'medical' && (
                                  <div className="space-y-2 text-sm">
                                    {item.veterinarian && (
                                      <p><strong>Veterinario:</strong> {item.veterinarian}</p>
                                    )}
                                    {item.diagnosis && (
                                      <p><strong>Diagnóstico:</strong> {item.diagnosis}</p>
                                    )}
                                    {item.treatment && (
                                      <p><strong>Tratamiento:</strong> {item.treatment}</p>
                                    )}
                                    {item.notes && (
                                      <p className="text-muted-foreground italic">{item.notes}</p>
                                    )}
                                  </div>
                                )}

                                {/* Evidence Details */}
                                {item.type === 'evidence' && (
                                  <div className="space-y-3 text-sm">
                                    {item.evidenceType && (
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          {item.evidenceType === 'photo' && <ImageIcon className="w-3 h-3 mr-1" />}
                                          {item.evidenceType === 'video' && <Video className="w-3 h-3 mr-1" />}
                                          {item.evidenceType === 'document' && <File className="w-3 h-3 mr-1" />}
                                          {item.evidenceType === 'photo' ? 'Foto' :
                                           item.evidenceType === 'video' ? 'Video' :
                                           item.evidenceType === 'document' ? 'Documento' : 'Archivo'}
                                        </Badge>
                                      </div>
                                    )}
                                    {item.description && (
                                      <p>{item.description}</p>
                                    )}
                                    {item.fileUrl && (
                                      <div className="mt-2">
                                        {item.evidenceType === 'photo' ? (
                                          <div className="rounded-lg overflow-hidden border bg-white">
                                            <img 
                                              src={item.fileUrl} 
                                              alt={item.title || 'Evidencia'} 
                                              className="max-w-full max-h-64 object-contain mx-auto"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                  parent.innerHTML = '<div class="p-4 text-center text-muted-foreground"><p>No se pudo cargar la imagen</p></div>';
                                                }
                                              }}
                                            />
                                          </div>
                                        ) : item.evidenceType === 'video' ? (
                                          <div className="rounded-lg overflow-hidden border bg-black">
                                            <video 
                                              src={item.fileUrl} 
                                              controls 
                                              className="max-w-full max-h-64 mx-auto"
                                            >
                                              Tu navegador no soporta el video.
                                            </video>
                                          </div>
                                        ) : (
                                          <a 
                                            href={item.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-primary hover:underline"
                                          >
                                            <ExternalLink className="w-4 h-4" />
                                            Ver archivo
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Sin registros aún
                      </h3>
                      <p className="text-muted-foreground">
                        Aquí aparecerán los entrenamientos, evaluaciones y registros médicos de {dogProgress?.dog?.name || 'tu mascota'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* No dog selected message */}
            {!selectedDogForProgress && profile?.dogs?.length > 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Selecciona una mascota
                  </h3>
                  <p className="text-muted-foreground">
                    Elige una de tus mascotas arriba para ver su línea de tiempo de progreso
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="space-y-4">
            {/* Payment Action Button */}
            <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">¿Realizaste un pago?</h3>
                    <p className="text-sm text-muted-foreground">
                      Envía tu comprobante de pago para registro y verificación
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-accent hover:bg-accent/90"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Enviar Comprobante
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground" data-testid={`invoice-amount-${invoice.id}`}>
                            ${Number(invoice.amount).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceDetail(true);
                          }}
                          data-testid={`button-view-invoice-${invoice.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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

            {/* My Payments Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  Mis Comprobantes de Pago
                </CardTitle>
                <CardDescription>
                  Historial de pagos enviados y su estado de verificación
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-muted rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : myPayments && myPayments.length > 0 ? (
                  <div className="space-y-3">
                    {myPayments.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {payment.receiptImage ? (
                            <a href={payment.receiptImage} target="_blank" rel="noopener noreferrer" className="block">
                              <img 
                                src={payment.receiptImage} 
                                alt="Comprobante" 
                                className="w-12 h-12 object-cover rounded border hover:opacity-80 transition-opacity"
                              />
                            </a>
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <Receipt className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">${Number(payment.amount).toLocaleString('es-MX')}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.submittedAt ? new Date(payment.submittedAt).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'Fecha no disponible'}
                            </p>
                            {payment.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{payment.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                            payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {payment.status === 'approved' ? 'Aprobado' :
                             payment.status === 'rejected' ? 'Rechazado' :
                             'Pendiente'}
                          </Badge>
                          {payment.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">{payment.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No has enviado comprobantes de pago</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Usa el botón "Enviar Comprobante" para registrar tu pago
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Appointment Modal */}
      <Dialog open={showRequestAppointment} onOpenChange={setShowRequestAppointment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-primary" />
              Solicitar Cita
            </DialogTitle>
            <DialogDescription>
              Completa el formulario para solicitar una cita. Te confirmaremos la disponibilidad.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Dog Selection */}
            <div className="space-y-2">
              <Label htmlFor="dog">Mascota *</Label>
              <Select 
                value={appointmentForm.dogId} 
                onValueChange={(value) => setAppointmentForm(prev => ({...prev, dogId: value}))}
              >
                <SelectTrigger data-testid="select-dog">
                  <SelectValue placeholder="Selecciona una mascota" />
                </SelectTrigger>
                <SelectContent>
                  {profile?.dogs?.map((dog: any) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name} - {dog.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Package Selection (optional) */}
            {packages && packages.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="package">Usar paquete (opcional)</Label>
                <Select 
                  value={appointmentForm.packageId} 
                  onValueChange={(value) => setAppointmentForm(prev => ({...prev, packageId: value}))}
                >
                  <SelectTrigger data-testid="select-package">
                    <SelectValue placeholder="Sin paquete" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin paquete</SelectItem>
                    {packages.filter((pkg: any) => pkg.remainingSessions > 0).map((pkg: any) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.packageName} ({pkg.remainingSessions} sesiones restantes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Preferred Date */}
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Fecha preferida *</Label>
              <Input 
                type="date" 
                id="preferredDate"
                value={appointmentForm.preferredDate}
                onChange={(e) => setAppointmentForm(prev => ({...prev, preferredDate: e.target.value}))}
                min={new Date().toISOString().split('T')[0]}
                data-testid="input-preferred-date"
              />
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <Label htmlFor="preferredTime">Hora preferida</Label>
              <Select 
                value={appointmentForm.preferredTime} 
                onValueChange={(value) => setAppointmentForm(prev => ({...prev, preferredTime: value}))}
              >
                <SelectTrigger data-testid="select-preferred-time">
                  <SelectValue placeholder="Selecciona una hora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">08:00 AM</SelectItem>
                  <SelectItem value="09:00">09:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="13:00">01:00 PM</SelectItem>
                  <SelectItem value="14:00">02:00 PM</SelectItem>
                  <SelectItem value="15:00">03:00 PM</SelectItem>
                  <SelectItem value="16:00">04:00 PM</SelectItem>
                  <SelectItem value="17:00">05:00 PM</SelectItem>
                  <SelectItem value="18:00">06:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea 
                id="notes"
                placeholder="¿Hay algo que debamos saber?"
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm(prev => ({...prev, notes: e.target.value}))}
                className="resize-none"
                rows={3}
                data-testid="input-notes"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowRequestAppointment(false)}
              data-testid="btn-cancel-appointment"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleRequestAppointment}
              disabled={requestAppointmentMutation.isPending}
              data-testid="btn-submit-appointment"
            >
              {requestAppointmentMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Solicitud'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        clientId={profile?.client?.id}
        isAdmin={false}
      />

      {/* Invoice Detail Modal */}
      <Dialog open={showInvoiceDetail} onOpenChange={setShowInvoiceDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Factura {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div id="client-invoice-print-content" className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Instituto Shelties</h2>
                  <p className="text-sm text-muted-foreground">Escuela de Entrenamiento Canino</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{selectedInvoice.invoiceNumber}</p>
                  <Badge className={
                    selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    selectedInvoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    selectedInvoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    selectedInvoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedInvoice.status === 'paid' ? 'Pagada' :
                     selectedInvoice.status === 'draft' ? 'Borrador' :
                     selectedInvoice.status === 'sent' ? 'Enviada' :
                     selectedInvoice.status === 'overdue' ? 'Vencida' :
                     selectedInvoice.status === 'cancelled' ? 'Cancelada' : selectedInvoice.status}
                  </Badge>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Fecha de Emisión</h3>
                  <p>{new Date(selectedInvoice.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                </div>
                {selectedInvoice.dueDate && (
                  <div className="text-right">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Fecha de Vencimiento</h3>
                    <p>{new Date(selectedInvoice.dueDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold">Descripción</th>
                      <th className="text-center p-3 text-sm font-semibold w-20">Cant.</th>
                      <th className="text-right p-3 text-sm font-semibold w-28">Precio</th>
                      <th className="text-right p-3 text-sm font-semibold w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">${Number(item.unitPrice).toLocaleString()}</td>
                        <td className="p-3 text-right">${Number(item.totalPrice).toLocaleString()}</td>
                      </tr>
                    )) || (
                      <tr className="border-t">
                        <td className="p-3">{selectedInvoice.notes || 'Servicio'}</td>
                        <td className="p-3 text-center">1</td>
                        <td className="p-3 text-right">${Number(selectedInvoice.amount).toLocaleString()}</td>
                        <td className="p-3 text-right">${Number(selectedInvoice.amount).toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-muted">
                    <tr className="border-t">
                      <td colSpan={3} className="p-3 text-right font-bold">Total:</td>
                      <td className="p-3 text-right font-bold text-lg">${Number(selectedInvoice.amount).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Notas</h3>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInvoiceDetail(false)}
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow && selectedInvoice) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Factura ${selectedInvoice.invoiceNumber}</title>
                        <style>
                          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                          h2 { color: #16a34a; margin: 0; }
                          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
                          .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
                          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
                          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                          th { background: #f3f4f6; text-align: left; padding: 12px; font-size: 14px; }
                          td { padding: 12px; border-top: 1px solid #e5e7eb; }
                          .text-right { text-align: right; }
                          .text-center { text-align: center; }
                          .font-bold { font-weight: bold; }
                          .total-row { background: #f3f4f6; }
                          @media print { body { padding: 20px; } }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div>
                            <h2>Instituto Shelties</h2>
                            <p style="color: #6b7280; font-size: 14px;">Escuela de Entrenamiento Canino</p>
                          </div>
                          <div style="text-align: right;">
                            <p style="font-weight: bold; font-size: 18px;">${selectedInvoice.invoiceNumber}</p>
                            <span class="badge">${selectedInvoice.status === 'paid' ? 'Pagada' : selectedInvoice.status === 'draft' ? 'Borrador' : selectedInvoice.status}</span>
                          </div>
                        </div>
                        <div class="grid">
                          <div>
                            <p style="color: #6b7280; font-size: 12px;">Fecha de Emisión</p>
                            <p>${new Date(selectedInvoice.createdAt).toLocaleDateString('es-ES')}</p>
                          </div>
                          ${selectedInvoice.dueDate ? `
                          <div style="text-align: right;">
                            <p style="color: #6b7280; font-size: 12px;">Fecha de Vencimiento</p>
                            <p>${new Date(selectedInvoice.dueDate).toLocaleDateString('es-ES')}</p>
                          </div>
                          ` : ''}
                        </div>
                        <table>
                          <thead>
                            <tr>
                              <th>Descripción</th>
                              <th class="text-center" style="width: 80px;">Cant.</th>
                              <th class="text-right" style="width: 100px;">Precio</th>
                              <th class="text-right" style="width: 100px;">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>${selectedInvoice.notes || 'Servicio'}</td>
                              <td class="text-center">1</td>
                              <td class="text-right">$${Number(selectedInvoice.amount).toLocaleString()}</td>
                              <td class="text-right">$${Number(selectedInvoice.amount).toLocaleString()}</td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr class="total-row">
                              <td colspan="3" class="text-right font-bold">Total:</td>
                              <td class="text-right font-bold">$${Number(selectedInvoice.amount).toLocaleString()}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
