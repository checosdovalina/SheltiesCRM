import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Shield, Plus, FileText, TrendingDown, TrendingUp, ClipboardList, Dog } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppointmentModal from "@/components/appointment-modal";
import ClientModal from "@/components/client-modal";
import BillingModal from "@/components/billing-modal";
import ExpenseModal from "@/components/expense-modal";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  // Redirect clients to their dedicated portal
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'client') {
      setLocation('/client-portal');
      return;
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

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

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    enabled: isAuthenticated && isAdmin,
    retry: false,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: isAuthenticated && isAdmin,
    retry: false,
  });

  // Teacher-specific: fetch appointments assigned to this teacher
  const { data: teacherAppointments, isLoading: teacherAppointmentsLoading } = useQuery({
    queryKey: ["/api/appointments/teacher", user?.id],
    enabled: isAuthenticated && isTeacher && !!user?.id,
    retry: false,
  });

  const { data: financialSummary, isLoading: financialLoading } = useQuery({
    queryKey: ["/api/reports/financial", new Date().getFullYear(), new Date().getMonth() + 1],
    queryFn: async () => {
      const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      
      const response = await fetch(
        `/api/reports/financial?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        { credentials: "include" }
      );
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: isAuthenticated && isAdmin,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Calculate upcoming appointments based on role
  const allAppointments = isTeacher ? teacherAppointments : appointments;
  const upcomingAppointments = Array.isArray(allAppointments) 
    ? allAppointments.filter((apt: any) => new Date(apt.appointmentDate) > new Date()).slice(0, 3)
    : [];

  // Calculate today's appointments for teacher
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  const todaysAppointments = Array.isArray(allAppointments)
    ? allAppointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= todayStart && aptDate <= todayEnd;
      })
    : [];

  // Unique dogs the teacher is working with today
  const uniqueDogsToday = Array.isArray(todaysAppointments)
    ? Array.from(new Set(todaysAppointments.map((apt: any) => apt.dogId))).length
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-accent/10 text-accent';
      case 'pending': return 'bg-chart-4/10 text-chart-4';
      case 'completed': return 'bg-chart-2/10 text-chart-2';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">Dashboard</h2>
        <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
          Resumen general de actividades de Shelties
        </p>
      </div>

      {/* Metrics Cards - Different for Admin vs Teacher */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Citas Hoy - visible to both */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isTeacher ? "Mis Citas Hoy" : "Citas Hoy"}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-appointments-today">
                  {isTeacher 
                    ? (teacherAppointmentsLoading ? "..." : todaysAppointments.length)
                    : (metricsLoading ? "..." : (metrics as any)?.appointmentsToday || 0)
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-accent mt-2">
              {isTeacher ? "Sesiones programadas" : "+2 más que ayer"}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Admin sees Revenue, Teacher sees Dogs Today */}
        {isAdmin ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos del Mes</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="metric-monthly-revenue">
                    {metricsLoading ? "..." : `$${Number((metrics as any)?.monthlyRevenue || 0).toLocaleString()}`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
              </div>
              <p className="text-xs text-accent mt-2">+15% vs mes anterior</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Perros Hoy</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="metric-dogs-today">
                    {teacherAppointmentsLoading ? "..." : uniqueDogsToday}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Dog className="w-6 h-6 text-accent" />
                </div>
              </div>
              <p className="text-xs text-accent mt-2">Mascotas a entrenar</p>
            </CardContent>
          </Card>
        )}

        {/* Card 3: Admin sees Active Clients, Teacher sees Pending */}
        {isAdmin ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clientes Activos</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="metric-active-clients">
                    {metricsLoading ? "..." : (metrics as any)?.activeClients || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-chart-2" />
                </div>
              </div>
              <p className="text-xs text-accent mt-2">+8 nuevos este mes</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="metric-pending">
                    {teacherAppointmentsLoading ? "..." : 
                      todaysAppointments.filter((apt: any) => apt.status === 'pending' || apt.status === 'confirmed').length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-chart-2" />
                </div>
              </div>
              <p className="text-xs text-accent mt-2">Por completar hoy</p>
            </CardContent>
          </Card>
        )}

        {/* Card 4: Admin sees Boarding, Teacher sees Completed */}
        {isAdmin ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Perros en Hospedaje</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="metric-dogs-boarding">
                    {metricsLoading ? "..." : (metrics as any)?.dogsBoarding || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-chart-4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Capacidad: 30 espacios</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="metric-completed">
                    {teacherAppointmentsLoading ? "..." : 
                      todaysAppointments.filter((apt: any) => apt.status === 'completed').length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-chart-4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Sesiones de hoy</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Appointments */}
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle>{isTeacher ? "Mis Próximas Citas" : "Próximas Citas"}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                data-testid="button-view-all-appointments"
                onClick={() => setLocation(isTeacher ? '/mis-clases' : '/appointments')}
              >
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {(isTeacher ? teacherAppointmentsLoading : appointmentsLoading) ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment: any) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg"
                    data-testid={`appointment-${appointment.id}`}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {appointment.client?.firstName?.[0]}{appointment.client?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {appointment.client?.firstName} {appointment.client?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Perro: {appointment.dog?.name} ({appointment.dog?.breed})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.service?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {new Date(appointment.appointmentDate).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4" data-testid="text-no-appointments">
                {isTeacher ? "No tienes citas próximas asignadas" : "No hay citas próximas programadas"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Different for Admin vs Teacher */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {isAdmin ? (
                <>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto bg-primary/10 hover:bg-primary/20 border-primary/20"
                    onClick={() => setShowAppointmentModal(true)}
                    data-testid="button-new-appointment"
                  >
                    <Plus className="w-8 h-8 text-primary mb-2" />
                    <span className="text-sm font-medium text-foreground">Nueva Cita</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto bg-accent/10 hover:bg-accent/20 border-accent/20"
                    onClick={() => setShowClientModal(true)}
                    data-testid="button-new-client"
                  >
                    <Users className="w-8 h-8 text-accent mb-2" />
                    <span className="text-sm font-medium text-foreground">Nuevo Cliente</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/20"
                    onClick={() => setShowBillingModal(true)}
                    data-testid="button-generate-invoice"
                  >
                    <FileText className="w-8 h-8 text-chart-2 mb-2" />
                    <span className="text-sm font-medium text-foreground">Generar Factura</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto bg-chart-4/10 hover:bg-chart-4/20 border-chart-4/20"
                    onClick={() => setShowExpenseModal(true)}
                    data-testid="button-register-expense"
                  >
                    <TrendingDown className="w-8 h-8 text-chart-4 mb-2" />
                    <span className="text-sm font-medium text-foreground">Registrar Gasto</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto bg-primary/10 hover:bg-primary/20 border-primary/20"
                    onClick={() => setLocation('/mis-clases')}
                    data-testid="button-my-classes"
                  >
                    <ClipboardList className="w-8 h-8 text-primary mb-2" />
                    <span className="text-sm font-medium text-foreground">Mis Clases</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto bg-accent/10 hover:bg-accent/20 border-accent/20"
                    onClick={() => setLocation('/calendar')}
                    data-testid="button-calendar"
                  >
                    <Calendar className="w-8 h-8 text-accent mb-2" />
                    <span className="text-sm font-medium text-foreground">Calendario</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/20"
                    onClick={() => setLocation('/expedientes')}
                    data-testid="button-expedientes"
                  >
                    <FileText className="w-8 h-8 text-chart-2 mb-2" />
                    <span className="text-sm font-medium text-foreground">Expedientes</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto bg-chart-4/10 hover:bg-chart-4/20 border-chart-4/20"
                    onClick={() => setLocation('/protocols')}
                    data-testid="button-protocols"
                  >
                    <Dog className="w-8 h-8 text-chart-4 mb-2" />
                    <span className="text-sm font-medium text-foreground">Protocolos</span>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin-only: Financial Summary Section */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Financial Summary */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle>Resumen Financiero - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</CardTitle>
                <select className="text-sm border border-border rounded-md px-3 py-1 bg-background">
                  <option>Este mes</option>
                  <option>Último trimestre</option>
                  <option>Este año</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {financialLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="grid grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="text-center">
                        <div className="h-8 bg-muted rounded mb-2"></div>
                        <div className="h-4 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent" data-testid="financial-total-income">
                        ${Number(financialSummary?.totalIncome || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-destructive" data-testid="financial-total-expenses">
                        ${Number(financialSummary?.totalExpenses || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Gastos Totales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary" data-testid="financial-net-profit">
                        ${Number(financialSummary?.netProfit || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Ganancia Neta</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {financialSummary?.serviceBreakdown?.map((service: any, index: number) => {
                      const maxRevenue = Math.max(...(financialSummary.serviceBreakdown?.map((s: any) => Number(s.revenue)) || [0]));
                      const percentage = maxRevenue > 0 ? (Number(service.revenue) / maxRevenue) * 100 : 0;
                      
                      return (
                        <div key={service.serviceName || index}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-foreground">{service.serviceName}</span>
                            <span className="text-sm text-muted-foreground">
                              ${Number(service.revenue).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity placeholder */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground" data-testid="text-activity-placeholder">
                  La actividad reciente se mostrará aquí
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Teacher-only: Today's Schedule */}
      {isTeacher && (
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle>Mi Agenda de Hoy</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/mis-clases')}
              >
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {teacherAppointmentsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : todaysAppointments.length > 0 ? (
              <div className="space-y-3">
                {todaysAppointments.map((appointment: any) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg border-l-4 border-primary"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Dog className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {appointment.dog?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.client?.firstName} {appointment.client?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.service?.name || 'Sin servicio asignado'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {new Date(appointment.appointmentDate).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No tienes citas programadas para hoy
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AppointmentModal 
        open={showAppointmentModal} 
        onOpenChange={setShowAppointmentModal} 
      />
      <ClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal} 
      />
      <BillingModal 
        open={showBillingModal} 
        onOpenChange={setShowBillingModal} 
      />
      <ExpenseModal 
        open={showExpenseModal} 
        onOpenChange={setShowExpenseModal} 
      />
    </div>
  );
}
