import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Search, User, Dog, Filter } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppointmentModal from "@/components/appointment-modal";
import { apiRequest } from "@/lib/queryClient";

export default function Appointments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

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

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: isAuthenticated,
    retry: false,
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/appointments/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Cita actualizada",
        description: "El estado de la cita ha sido actualizado exitosamente.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Has sido desconectado. Iniciando sesión nuevamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo actualizar la cita.",
        variant: "destructive",
      });
    },
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

  const filteredAppointments = appointments?.filter((appointment: any) => {
    const matchesSearch = 
      appointment.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.client?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.dog?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-accent/10 text-accent border-accent/20';
      case 'pending': return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      case 'completed': return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'no_show': return 'bg-muted text-muted-foreground border-muted';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'No asistió';
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

  const handleStatusUpdate = (appointmentId: string, newStatus: string) => {
    updateAppointmentMutation.mutate({
      id: appointmentId,
      data: { status: newStatus }
    });
  };

  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground" data-testid="text-appointments-title">Citas</h2>
          <p className="text-muted-foreground">Gestiona todas las citas programadas</p>
        </div>
        <Button 
          onClick={() => setShowAppointmentModal(true)}
          data-testid="button-add-appointment"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por cliente, mascota o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-appointments"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
            <SelectItem value="no_show">No asistió</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointmentsLoading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-6 bg-muted rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : sortedAppointments.length > 0 ? (
          sortedAppointments.map((appointment: any) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow" data-testid={`appointment-card-${appointment.id}`}>
              <CardContent className="p-4 sm:p-6">
                {/* Mobile Layout - Stack everything vertically */}
                <div className="block sm:hidden space-y-4">
                  {/* Client and Dog Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {appointment.client?.firstName?.[0]}{appointment.client?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground text-sm" data-testid={`appointment-client-${appointment.id}`}>
                          {appointment.client?.firstName} {appointment.client?.lastName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dog className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground" data-testid={`appointment-dog-${appointment.id}`}>
                          {appointment.dog?.name} ({appointment.dog?.breed})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Service Info */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={getServiceTypeColor(appointment.service?.type)}>
                      {getServiceTypeText(appointment.service?.type)}
                    </Badge>
                    <span className="text-sm text-muted-foreground" data-testid={`appointment-service-${appointment.id}`}>
                      {appointment.service?.name}
                    </span>
                  </div>

                  {/* Date, Time and Price */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span data-testid={`appointment-date-${appointment.id}`}>
                        {new Date(appointment.appointmentDate).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span data-testid={`appointment-time-${appointment.id}`}>
                        {new Date(appointment.appointmentDate).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status and Price */}
                  <div className="flex items-center justify-between gap-3">
                    <Select
                      value={appointment.status}
                      onValueChange={(value) => handleStatusUpdate(appointment.id, value)}
                    >
                      <SelectTrigger className="w-[120px]" data-testid={`select-status-${appointment.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                        <SelectItem value="no_show">No asistió</SelectItem>
                      </SelectContent>
                    </Select>

                    {appointment.price && (
                      <div className="text-right">
                        <p className="font-semibold text-foreground" data-testid={`appointment-price-${appointment.id}`}>
                          ${Number(appointment.price).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Layout - Original horizontal layout */}
                <div className="hidden sm:flex sm:items-center gap-4">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {appointment.client?.firstName?.[0]}{appointment.client?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground" data-testid={`appointment-client-${appointment.id}`}>
                          {appointment.client?.firstName} {appointment.client?.lastName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Dog className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground" data-testid={`appointment-dog-${appointment.id}`}>
                          {appointment.dog?.name} ({appointment.dog?.breed})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={getServiceTypeColor(appointment.service?.type)}>
                          {getServiceTypeText(appointment.service?.type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground" data-testid={`appointment-service-${appointment.id}`}>
                          {appointment.service?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="flex flex-col space-y-2 items-end">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span data-testid={`appointment-date-${appointment.id}`}>
                        {new Date(appointment.appointmentDate).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span data-testid={`appointment-time-${appointment.id}`}>
                        {new Date(appointment.appointmentDate).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status and Price */}
                  <div className="flex flex-col items-end space-y-2">
                    <Select
                      value={appointment.status}
                      onValueChange={(value) => handleStatusUpdate(appointment.id, value)}
                    >
                      <SelectTrigger className="w-[140px]" data-testid={`select-status-${appointment.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                        <SelectItem value="no_show">No asistió</SelectItem>
                      </SelectContent>
                    </Select>

                    {appointment.price && (
                      <div className="text-right">
                        <p className="font-semibold text-foreground" data-testid={`appointment-price-${appointment.id}`}>
                          ${Number(appointment.price).toLocaleString()}
                        </p>
                      </div>
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
                {searchTerm || statusFilter !== "all" 
                  ? "No se encontraron citas" 
                  : "No hay citas programadas"
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza programando la primera cita"
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setShowAppointmentModal(true)} data-testid="button-first-appointment">
                  <Plus className="w-4 h-4 mr-2" />
                  Programar Primera Cita
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Appointment Modal */}
      <AppointmentModal 
        open={showAppointmentModal} 
        onOpenChange={setShowAppointmentModal}
        appointment={editingAppointment}
      />
    </div>
  );
}
