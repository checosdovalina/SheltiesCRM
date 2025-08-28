import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  TrendingUp,
  Clock,
  Dog,
  Bell,
  BookOpen,
  Target,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment, Dog as DogType, Client, Service, InternalNote } from "@shared/schema";

// Types for the teacher portal
interface AppointmentWithRelations extends Appointment {
  dog?: DogType & { client?: Client };
  client?: Client;
  service?: Service;
}

interface DogWithRelations extends DogType {
  client?: Client;
}

interface TeacherStats {
  monthlySessions: number;
  weeklyGrowth: number;
}

export default function TeacherPortal() {
  const { user, isLoading: authLoading } = useAuth();

  // Today's appointments query
  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useQuery<AppointmentWithRelations[]>({
    queryKey: ["/api/teacher/appointments/today"],
    enabled: !!user && user.role === 'teacher',
  });

  // Assigned dogs query
  const { data: assignedDogs = [], isLoading: dogsLoading } = useQuery<DogWithRelations[]>({
    queryKey: ["/api/teacher/assigned-dogs"],
    enabled: !!user && user.role === 'teacher',
  });

  // Recent notes and alerts
  const { data: recentNotes = [], isLoading: notesLoading } = useQuery<InternalNote[]>({
    queryKey: ["/api/teacher/notes/recent"],
    enabled: !!user && user.role === 'teacher',
  });

  // Personal stats
  const { data: teacherStats = { monthlySessions: 0, weeklyGrowth: 0 }, isLoading: statsLoading } = useQuery<TeacherStats>({
    queryKey: ["/api/teacher/stats"],
    enabled: !!user && user.role === 'teacher',
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'teacher') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder al portal del entrenador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-portal-title">
            Portal del Entrenador
          </h1>
          <p className="text-muted-foreground capitalize" data-testid="text-portal-date">
            {today}
          </p>
          <p className="text-sm text-muted-foreground">
            Bienvenido/a, {user.firstName || user.email}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-today-appointments">
              {appointmentsLoading ? "..." : todayAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.filter(app => app.status === 'confirmed').length} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perros Asignados</CardTitle>
            <Dog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-assigned-dogs">
              {dogsLoading ? "..." : assignedDogs.length}
            </div>
            <p className="text-xs text-muted-foreground">
              En entrenamiento activo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Este Mes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-monthly-sessions">
              {statsLoading ? "..." : teacherStats.monthlySessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{statsLoading ? "..." : teacherStats.weeklyGrowth || 0}% vs semana pasada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600" data-testid="text-pending-alerts">
              {notesLoading ? "..." : recentNotes.filter(note => note.isUrgent && !note.isRead).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agenda" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="agenda" data-testid="tab-agenda">
            <Calendar className="w-4 h-4 mr-2" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="dogs" data-testid="tab-dogs">
            <Users className="w-4 h-4 mr-2" />
            Mis Perros
          </TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">
            <BookOpen className="w-4 h-4 mr-2" />
            Avances
          </TabsTrigger>
          <TabsTrigger value="communication" data-testid="tab-communication">
            <MessageSquare className="w-4 h-4 mr-2" />
            Comunicación
          </TabsTrigger>
          <TabsTrigger value="attendance" data-testid="tab-attendance">
            <CheckCircle className="w-4 h-4 mr-2" />
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">
            <TrendingUp className="w-4 h-4 mr-2" />
            Reportes
          </TabsTrigger>
        </TabsList>

        {/* Agenda Tab */}
        <TabsContent value="agenda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Agenda Personal - {today}
              </CardTitle>
              <CardDescription>
                Tus citas, entrenamientos y sesiones programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(appointment.appointmentDate), "HH:mm")}
                        </div>
                        <div>
                          <div className="font-medium">
                            {appointment.dog?.name} - {appointment.service?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Cliente: {appointment.client?.firstName} {appointment.client?.lastName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                          {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes citas programadas para hoy</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Dogs Tab */}
        <TabsContent value="dogs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Perros Asignados
              </CardTitle>
              <CardDescription>
                Expedientes de los perros que entrenas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dogsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : assignedDogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedDogs.map((dog) => (
                    <Card key={dog.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          {dog.imageUrl ? (
                            <img 
                              src={dog.imageUrl} 
                              alt={dog.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                              <Dog className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium">{dog.name}</h3>
                            <p className="text-sm text-muted-foreground">{dog.breed}</p>
                            <p className="text-xs text-muted-foreground">
                              {dog.client?.firstName} {dog.client?.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Ver Expediente
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Dog className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes perros asignados actualmente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs placeholder */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Avances</CardTitle>
              <CardDescription>En desarrollo - Próximamente disponible</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Comunicación Interna</CardTitle>
              <CardDescription>En desarrollo - Próximamente disponible</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Control de Asistencia</CardTitle>
              <CardDescription>En desarrollo - Próximamente disponible</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Personales</CardTitle>
              <CardDescription>En desarrollo - Próximamente disponible</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}