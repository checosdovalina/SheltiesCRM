import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, CheckSquare, User, X } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppointmentModal from "@/components/appointment-modal";
import TaskModal from "@/components/task-modal";

export default function CalendarPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const isAdmin = user?.role === 'admin';

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

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Fetch teachers
  const { data: teachers = [] } = useQuery<any[]>({
    queryKey: ["/api/teachers"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments/range", startOfMonth.toISOString(), endOfMonth.toISOString()],
    queryFn: async () => {
      const response = await fetch(
        `/api/appointments/range?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks/range", startOfMonth.toISOString(), endOfMonth.toISOString()],
    queryFn: async () => {
      const response = await fetch(
        `/api/tasks/range?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: isAuthenticated,
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

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    if (!appointments) return [];
    let filtered = appointments.filter((apt: any) => {
      const aptDate = new Date(apt.appointmentDate);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
    
    // Filter by teacher if selected
    if (selectedTeacher !== 'all') {
      filtered = filtered.filter((apt: any) => apt.assignedTo === selectedTeacher);
    }
    
    return filtered;
  };

  const getTasksForDate = (date: Date) => {
    if (!tasks) return [];
    let filtered = tasks.filter((task: any) => {
      const taskDate = new Date(task.startDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
    
    // Filter by teacher if selected
    if (selectedTeacher !== 'all') {
      filtered = filtered.filter((task: any) => task.assignedTo === selectedTeacher);
    }
    
    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-accent/20 text-accent';
      case 'pending': return 'bg-chart-4/20 text-chart-4';
      case 'completed': return 'bg-chart-2/20 text-chart-2';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTaskColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/20 text-destructive';
      case 'high': return 'bg-orange-500/20 text-orange-600';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600';
      case 'low': return 'bg-blue-500/20 text-blue-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const days = getDaysInMonth(currentDate);

  const selectedTeacherData = teachers.find((t: any) => t.id === selectedTeacher);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground" data-testid="text-calendar-title">
              Calendario
            </h2>
            <p className="text-muted-foreground">Visualiza y gestiona citas y tareas programadas</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAppointmentModal(true)}
              data-testid="button-add-appointment"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cita
            </Button>
            {isAdmin && (
              <Button 
                onClick={() => setShowTaskModal(true)}
                variant="secondary"
                data-testid="button-add-task"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Nueva Tarea
              </Button>
            )}
          </div>
        </div>
        
        {/* Teacher Filter - Only for admins */}
        {isAdmin && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filtrar por Profesor:</span>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger className="w-[250px]" data-testid="select-teacher-filter">
                      <SelectValue placeholder="Seleccionar profesor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los profesores</SelectItem>
                      {teachers.map((teacher: any) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTeacher !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTeacher('all')}
                      data-testid="button-clear-teacher-filter"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {selectedTeacher !== 'all' && selectedTeacherData && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      Mostrando agenda de: {selectedTeacherData.firstName} {selectedTeacherData.lastName}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize" data-testid="text-current-month">
                  {getMonthName(currentDate)}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousMonth}
                    data-testid="button-prev-month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextMonth}
                    data-testid="button-next-month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 gap-px bg-border">
                {/* Day headers */}
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="bg-muted p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="bg-background p-2 h-24"></div>;
                  }
                  
                  const dayAppointments = getAppointmentsForDate(day);
                  const dayTasks = getTasksForDate(day);
                  const totalItems = dayAppointments.length + dayTasks.length;
                  const isToday = day.toDateString() === today.toDateString();
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`bg-background p-1 h-24 cursor-pointer hover:bg-muted/50 transition-colors ${
                        isToday ? 'ring-2 ring-primary' : ''
                      } ${isSelected ? 'bg-primary/10' : ''}`}
                      onClick={() => setSelectedDate(day)}
                      data-testid={`calendar-day-${day.getDate()}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-primary' : 'text-foreground'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 1).map((apt: any) => (
                          <div
                            key={apt.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(apt.status)}`}
                            title={`${apt.client?.firstName} ${apt.client?.lastName} - ${apt.service?.name}`}
                          >
                            {new Date(apt.appointmentDate).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} {apt.client?.firstName}
                          </div>
                        ))}
                        {dayTasks.slice(0, totalItems > 1 ? 1 : 2).map((task: any) => (
                          <div
                            key={task.id}
                            className={`text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 ${getTaskColor(task.priority)}`}
                            title={`${task.title} - ${task.assignedTeacher?.firstName} ${task.assignedTeacher?.lastName}`}
                          >
                            <CheckSquare className="w-3 h-3" />
                            {new Date(task.startDate).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} {task.title.substring(0, 8)}
                          </div>
                        ))}
                        {totalItems > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{totalItems - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Details */}
          {selectedDate && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg" data-testid="text-selected-date">
                    {selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                  {selectedTeacher !== 'all' && selectedTeacherData && (
                    <CardDescription>
                      Agenda de {selectedTeacherData.firstName} {selectedTeacherData.lastName}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="space-y-2">
                      <div className="animate-pulse h-4 bg-muted rounded"></div>
                      <div className="animate-pulse h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getAppointmentsForDate(selectedDate).length > 0 || getTasksForDate(selectedDate).length > 0 ? (
                        <>
                          {getAppointmentsForDate(selectedDate).map((apt: any) => (
                            <div 
                              key={apt.id} 
                              className="p-3 border border-border rounded-lg" 
                              data-testid={`selected-appointment-${apt.id}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {new Date(apt.appointmentDate).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <Badge variant="outline" className={getStatusColor(apt.status)}>
                                  {apt.status === 'confirmed' ? 'Confirmada' : 
                                   apt.status === 'pending' ? 'Pendiente' :
                                   apt.status === 'completed' ? 'Completada' :
                                   apt.status === 'cancelled' ? 'Cancelada' : apt.status}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                {apt.client?.firstName} {apt.client?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {apt.dog?.name} - {apt.service?.name}
                              </p>
                            </div>
                          ))}
                          {getTasksForDate(selectedDate).map((task: any) => (
                            <div 
                              key={task.id} 
                              className="p-3 border border-border rounded-lg bg-muted/30"
                              data-testid={`selected-task-${task.id}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <CheckSquare className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {new Date(task.startDate).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <Badge variant="outline" className={getTaskColor(task.priority)}>
                                  {task.priority === 'urgent' ? 'Urgente' : 
                                   task.priority === 'high' ? 'Alta' :
                                   task.priority === 'medium' ? 'Media' : 'Baja'}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                {task.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {task.type === 'class' ? 'Clase' :
                                 task.type === 'training' ? 'Entrenamiento' :
                                 task.type === 'meeting' ? 'Reunión' :
                                 task.type === 'administrative' ? 'Administrativo' : 'Otro'}
                              </p>
                            </div>
                          ))}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-appointments-selected">
                          {selectedTeacher !== 'all' ? 
                            `${selectedTeacherData?.firstName} no tiene citas ni tareas este día` : 
                            'No hay citas programadas para este día'}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Time Slots - Only when teacher is selected */}
              {isAdmin && selectedTeacher !== 'all' && selectedTeacherData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Espacios Disponibles
                    </CardTitle>
                    <CardDescription>
                      Horarios libres de {selectedTeacherData.firstName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(() => {
                        const dayAppts = getAppointmentsForDate(selectedDate);
                        const dayTsks = getTasksForDate(selectedDate);
                        const workHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]; // 8 AM to 7 PM
                        
                        const occupiedHours = new Set();
                        dayAppts.forEach((apt: any) => {
                          const hour = new Date(apt.appointmentDate).getHours();
                          occupiedHours.add(hour);
                        });
                        dayTsks.forEach((task: any) => {
                          const hour = new Date(task.startDate).getHours();
                          occupiedHours.add(hour);
                        });

                        const freeSlots = workHours.filter(hour => !occupiedHours.has(hour));
                        
                        if (freeSlots.length === 0) {
                          return (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No hay espacios disponibles este día
                            </p>
                          );
                        }

                        return freeSlots.map(hour => (
                          <div 
                            key={hour}
                            className="flex items-center justify-between p-2 rounded bg-chart-2/10 border border-chart-2/20"
                          >
                            <span className="text-sm text-chart-2 font-medium">
                              {hour.toString().padStart(2, '0')}:00 - {(hour + 1).toString().padStart(2, '0')}:00
                            </span>
                            <Badge variant="outline" className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                              Disponible
                            </Badge>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen del Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de citas</span>
                  <Badge variant="secondary" data-testid="metric-total-appointments">
                    {appointmentsLoading ? "..." : appointments?.length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confirmadas</span>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    {appointmentsLoading ? "..." : appointments?.filter((apt: any) => apt.status === 'confirmed').length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pendientes</span>
                  <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                    {appointmentsLoading ? "..." : appointments?.filter((apt: any) => apt.status === 'pending').length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completadas</span>
                  <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                    {appointmentsLoading ? "..." : appointments?.filter((apt: any) => apt.status === 'completed').length || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leyenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-accent/20"></div>
                  <span className="text-sm text-muted-foreground">Confirmada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-chart-4/20"></div>
                  <span className="text-sm text-muted-foreground">Pendiente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-chart-2/20"></div>
                  <span className="text-sm text-muted-foreground">Completada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-destructive/20"></div>
                  <span className="text-sm text-muted-foreground">Cancelada</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal 
        open={showAppointmentModal} 
        onOpenChange={setShowAppointmentModal}
        selectedDate={selectedDate}
      />

      {/* Task Modal */}
      <TaskModal 
        open={showTaskModal} 
        onOpenChange={setShowTaskModal}
        selectedDate={selectedDate}
      />
    </div>
  );
}
