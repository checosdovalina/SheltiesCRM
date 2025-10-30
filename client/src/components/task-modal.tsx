import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertTaskSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const taskFormSchema = insertTaskSchema.extend({
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  startTime: z.string().min(1, "La hora de inicio es requerida"),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
});

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: any;
  selectedDate?: Date | null;
}

export default function TaskModal({ 
  open, 
  onOpenChange, 
  task, 
  selectedDate 
}: TaskModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "other",
      assignedTo: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      status: "pending",
      priority: "medium",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        const startDate = new Date(task.startDate);
        const endDate = task.endDate ? new Date(task.endDate) : null;
        
        const startTimeString = task.startDate.split('T')[1].substring(0, 5);
        const endTimeString = endDate ? task.endDate.split('T')[1].substring(0, 5) : "";
        
        form.reset({
          title: task.title || "",
          description: task.description || "",
          type: task.type || "other",
          assignedTo: task.assignedTeacher?.id || "",
          startDate: startDate.toISOString().split('T')[0],
          startTime: startTimeString,
          endDate: endDate ? endDate.toISOString().split('T')[0] : "",
          endTime: endTimeString,
          status: task.status || "pending",
          priority: task.priority || "medium",
          notes: task.notes || "",
        });
      } else {
        const defaultDate = selectedDate || new Date();
        form.reset({
          title: "",
          description: "",
          type: "other",
          assignedTo: "",
          startDate: defaultDate.toISOString().split('T')[0],
          startTime: "09:00",
          endDate: "",
          endTime: "",
          status: "pending",
          priority: "medium",
          notes: "",
        });
      }
    }
  }, [task, selectedDate, open, form]);

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["/api/teachers"],
    enabled: open && isAdmin,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { startDate, startTime, endDate, endTime, ...rest } = data;
      
      const startDateTime = new Date(`${startDate}T${startTime}:00`);
      const endDateTime = endDate && endTime ? new Date(`${endDate}T${endTime}:00`) : null;
      
      return apiRequest("/api/tasks", "POST", {
        ...rest,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime?.toISOString() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/range"] });
      toast({
        title: "Tarea creada",
        description: "La tarea ha sido creada exitosamente.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la tarea",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { startDate, startTime, endDate, endTime, ...rest } = data;
      
      const startDateTime = new Date(`${startDate}T${startTime}:00`);
      const endDateTime = endDate && endTime ? new Date(`${endDate}T${endTime}:00`) : null;
      
      return apiRequest(`/api/tasks/${task.id}`, "PUT", {
        ...rest,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime?.toISOString() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/range"] });
      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada exitosamente.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la tarea",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/tasks/${task.id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/range"] });
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada exitosamente.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la tarea",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof taskFormSchema>) => {
    if (task) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (confirm("¿Está seguro de que desea eliminar esta tarea?")) {
      deleteMutation.mutate();
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">
            {task ? "Editar Tarea" : "Nueva Tarea"}
          </DialogTitle>
          <DialogDescription>
            {task 
              ? "Actualiza los detalles de la tarea asignada." 
              : "Crea una nueva tarea para asignar a un profesor."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Ej: Clase de obediencia básica" 
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ""}
                      placeholder="Descripción detallada de la tarea"
                      rows={3}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="class">Clase</SelectItem>
                        <SelectItem value="training">Entrenamiento</SelectItem>
                        <SelectItem value="meeting">Reunión</SelectItem>
                        <SelectItem value="administrative">Administrativo</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignar a *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={teachersLoading}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-teacher">
                          <SelectValue placeholder="Seleccionar profesor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(teachers || []).map((teacher: any) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.firstName} {teacher.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date" 
                        data-testid="input-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Inicio *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="time" 
                        data-testid="input-start-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Fin</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date" 
                        data-testid="input-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Fin</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="time" 
                        data-testid="input-end-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="in_progress">En Progreso</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ""}
                      placeholder="Notas o instrucciones adicionales"
                      rows={2}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              {task && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete"
                >
                  {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                </Button>
              )}
              
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Guardando..."
                    : task
                    ? "Actualizar"
                    : "Crear"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
