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
  AlertTriangle,
  Plus,
  Award,
  Edit,
  CheckSquare
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import type { Appointment, Dog as DogType, Client, Service, InternalNote, TrainingSession } from "@shared/schema";
import TrainingSessionModal from "@/components/training-session-modal";

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
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);

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

  // Training sessions for assigned dogs
  const { data: recentSessions = [], isLoading: sessionsLoading } = useQuery<TrainingSession[]>({
    queryKey: ["/api/teacher/training-sessions"],
    enabled: !!user && user.role === 'teacher',
  });

  // Teacher's assigned tasks
  const { data: teacherTasks = [], isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ["/api/teacher/tasks"],
    enabled: !!user && user.role === 'teacher',
  });

  // Unread tasks count
  const { data: unreadTasksData } = useQuery<{ count: number }>({
    queryKey: ["/api/teacher/tasks/unread"],
    enabled: !!user && user.role === 'teacher',
  });
  
  const unreadTasksCount = unreadTasksData?.count || 0;

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <CardTitle className="text-sm font-medium">Tareas Nuevas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-unread-tasks">
              {unreadTasksCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {tasksLoading ? "..." : teacherTasks.filter((t: any) => t.status === 'pending').length} pendientes total
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="agenda" data-testid="tab-agenda">
            <Calendar className="w-4 h-4 mr-2" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="tasks" data-testid="tab-tasks">
            <CheckSquare className="w-4 h-4 mr-2" />
            Tareas
            {unreadTasksCount > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                {unreadTasksCount}
              </Badge>
            )}
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

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="w-5 h-5 mr-2" />
                Mis Tareas Asignadas
              </CardTitle>
              <CardDescription>
                Tareas y asignaciones pendientes del administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : teacherTasks.length > 0 ? (
                <div className="space-y-3">
                  {teacherTasks.map((task: any) => {
                    const getPriorityColor = (priority: string) => {
                      switch (priority) {
                        case 'urgent': return 'bg-destructive text-destructive-foreground';
                        case 'high': return 'bg-orange-500 text-white';
                        case 'medium': return 'bg-yellow-500 text-white';
                        case 'low': return 'bg-blue-500 text-white';
                        default: return 'bg-muted text-muted-foreground';
                      }
                    };

                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'pending': return 'bg-chart-4/20 text-chart-4';
                        case 'in_progress': return 'bg-blue-500/20 text-blue-600';
                        case 'completed': return 'bg-chart-2/20 text-chart-2';
                        case 'cancelled': return 'bg-destructive/20 text-destructive';
                        default: return 'bg-muted text-muted-foreground';
                      }
                    };

                    const getTypeLabel = (type: string) => {
                      switch (type) {
                        case 'class': return 'Clase';
                        case 'training': return 'Entrenamiento';
                        case 'meeting': return 'Reunión';
                        case 'administrative': return 'Administrativo';
                        default: return 'Otro';
                      }
                    };

                    return (
                      <div 
                        key={task.id} 
                        className={`p-4 border rounded-lg ${!task.isRead ? 'bg-blue-50/50 border-blue-200' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-foreground">{task.title}</h3>
                              {!task.isRead && (
                                <Badge variant="destructive" className="text-xs">
                                  Nuevo
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority === 'urgent' ? 'Urgente' : 
                                 task.priority === 'high' ? 'Alta' :
                                 task.priority === 'medium' ? 'Media' : 'Baja'}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(task.status)}>
                                {task.status === 'pending' ? 'Pendiente' :
                                 task.status === 'in_progress' ? 'En Progreso' :
                                 task.status === 'completed' ? 'Completada' : 'Cancelada'}
                              </Badge>
                              <Badge variant="outline">
                                {getTypeLabel(task.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {format(new Date(task.startDate), "dd/MM/yyyy HH:mm")}
                              </span>
                              {task.endDate && (
                                <span className="text-xs text-muted-foreground">
                                  → {format(new Date(task.endDate), "dd/MM/yyyy HH:mm")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            {task.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  await fetch(`/api/tasks/${task.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({ status: 'in_progress' }),
                                  });
                                  window.location.reload();
                                }}
                              >
                                Iniciar
                              </Button>
                            )}
                            {task.status === 'in_progress' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  await fetch(`/api/tasks/${task.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({ status: 'completed' }),
                                  });
                                  window.location.reload();
                                }}
                              >
                                Completar
                              </Button>
                            )}
                            {!task.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  await fetch(`/api/tasks/${task.id}/read`, {
                                    method: 'PUT',
                                    credentials: 'include',
                                  });
                                  window.location.reload();
                                }}
                              >
                                Marcar leída
                              </Button>
                            )}
                          </div>
                        </div>
                        {task.notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                            <strong className="text-xs text-muted-foreground">Notas:</strong>
                            <p className="mt-1">{task.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes tareas asignadas</p>
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

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Registro de Avances</h3>
              <p className="text-sm text-muted-foreground">Documenta el progreso de entrenamiento con sesiones y evidencias</p>
            </div>
            <Button 
              onClick={() => {
                setSelectedSession(null);
                setSessionModalOpen(true);
              }}
              data-testid="button-new-session"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Sesión
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Training Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Sesiones Recientes
                </CardTitle>
                <CardDescription>
                  Últimas sesiones de entrenamiento registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : recentSessions.length > 0 ? (
                  <div className="space-y-3">
                    {recentSessions.slice(0, 5).map((session: any) => (
                      <div key={session.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{session.objective}</h4>
                            <p className="text-sm text-muted-foreground">
                              {session.dog?.name} • {format(new Date(session.sessionDate), "dd/MM/yyyy HH:mm")}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant={session.rating >= 8 ? "default" : session.rating >= 6 ? "secondary" : "destructive"}>
                                {session.rating}/10
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {session.duration}min
                              </span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setSelectedSession(session);
                              setSessionModalOpen(true);
                            }}
                            data-testid={`button-edit-session-${session.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-sm font-medium mb-2">No hay sesiones registradas</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Comienza registrando tu primera sesión de entrenamiento
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedSession(null);
                        setSessionModalOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primera Sesión
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions & Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Resumen de Progreso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sesiones este mes</span>
                      <Badge variant="outline">{teacherStats.monthlySessions || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Perros en entrenamiento</span>
                      <Badge variant="outline">{assignedDogs.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Promedio de calificación</span>
                      <Badge variant="outline">
                        {recentSessions.length > 0 
                          ? (recentSessions.reduce((acc: number, session: any) => acc + (session.rating || 0), 0) / recentSessions.length).toFixed(1)
                          : "0.0"
                        }/10
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedSession(null);
                      setSessionModalOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Nueva Sesión
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Historial Completo
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generar Reporte
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
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

      {/* Training Session Modal */}
      <TrainingSessionModal 
        open={sessionModalOpen}
        onOpenChange={setSessionModalOpen}
        session={selectedSession}
        assignedDogs={assignedDogs}
      />
    </div>
  );
}