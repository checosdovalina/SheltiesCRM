import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Dog, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TeacherClasses() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [progressNotes, setProgressNotes] = useState('');

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
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<any[]>({
    queryKey: ["/api/teacher/appointments"],
    enabled: isAuthenticated && (user?.role === 'teacher' || user?.role === 'admin'),
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status, notes }: { appointmentId: string; status: string; notes?: string }) => {
      const response = await apiRequest('PUT', `/api/appointments/${appointmentId}`, { 
        status,
        notes: notes || undefined
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "La cita ha sido actualizada exitosamente",
      });
      setShowCompleteModal(false);
      setSelectedAppointment(null);
      setProgressNotes('');
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/appointments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la cita",
        variant: "destructive",
      });
    }
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

  if (user?.role !== 'teacher' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">Esta página es solo para profesores</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAppointments = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime() && apt.status !== 'cancelled';
  });

  const upcomingAppointments = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() > today.getTime() && apt.status !== 'cancelled';
  });

  const pastAppointments = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() < today.getTime() || apt.status === 'completed';
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Confirmada</Badge>;
      case 'pending':
        return <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20">Pendiente</Badge>;
      case 'completed':
        return <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">Completada</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const AppointmentCard = ({ apt, showActions = true }: { apt: any; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow" data-testid={`class-card-${apt.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {new Date(apt.appointmentDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </span>
          </div>
          {getStatusBadge(apt.status)}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(apt.appointmentDate).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {apt.client?.firstName} {apt.client?.lastName}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Dog className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {apt.dog?.name} {apt.dog?.breed ? `(${apt.dog.breed})` : ''}
          </span>
        </div>

        {apt.service?.name && (
          <div className="text-xs text-muted-foreground mb-3 p-2 bg-muted rounded">
            Servicio: {apt.service.name}
          </div>
        )}

        {apt.notes && (
          <div className="text-xs text-muted-foreground mb-3 p-2 bg-muted rounded">
            <FileText className="w-3 h-3 inline mr-1" />
            {apt.notes}
          </div>
        )}

        {showActions && apt.status !== 'completed' && apt.status !== 'cancelled' && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                setSelectedAppointment(apt);
                setShowCompleteModal(true);
              }}
              data-testid={`button-complete-${apt.id}`}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Completar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                updateStatusMutation.mutate({
                  appointmentId: apt.id,
                  status: 'cancelled'
                });
              }}
              data-testid={`button-cancel-${apt.id}`}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            Mis Clases
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus clases y citas asignadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoy</p>
                <p className="text-2xl font-bold">{todayAppointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximas</p>
                <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
              </div>
              <Clock className="w-8 h-8 text-accent" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">{pastAppointments.filter(a => a.status === 'completed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-chart-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="today" data-testid="tab-today">
              Hoy ({todayAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Próximas ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">
              Historial ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : todayAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayAppointments
                  .sort((a: any, b: any) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                  .map((apt: any) => (
                    <AppointmentCard key={apt.id} apt={apt} />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes clases programadas para hoy</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingAppointments
                  .sort((a: any, b: any) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                  .map((apt: any) => (
                    <AppointmentCard key={apt.id} apt={apt} />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes clases próximas programadas</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : pastAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastAppointments
                  .sort((a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                  .map((apt: any) => (
                    <AppointmentCard key={apt.id} apt={apt} showActions={false} />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes historial de clases</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar Clase</DialogTitle>
            <DialogDescription>
              Agrega notas sobre el progreso de la clase
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedAppointment.client?.firstName} {selectedAppointment.client?.lastName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment.dog?.name} - {new Date(selectedAppointment.appointmentDate).toLocaleString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas de progreso (opcional)</label>
                <Textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Describe el progreso de la clase, ejercicios realizados, observaciones..."
                  className="min-h-[100px]"
                  data-testid="input-progress-notes"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCompleteModal(false);
                    setProgressNotes('');
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    updateStatusMutation.mutate({
                      appointmentId: selectedAppointment.id,
                      status: 'completed',
                      notes: progressNotes ? `${selectedAppointment.notes || ''}\n\n[Notas del profesor]: ${progressNotes}` : selectedAppointment.notes
                    });
                  }}
                  disabled={updateStatusMutation.isPending}
                  data-testid="button-confirm-complete"
                >
                  {updateStatusMutation.isPending ? 'Guardando...' : 'Marcar como Completada'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
