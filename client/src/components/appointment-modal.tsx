import { useState, useEffect } from "react";
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
import { insertAppointmentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const appointmentFormSchema = insertAppointmentSchema.extend({
  appointmentDate: z.string().min(1, "La fecha es requerida"),
  appointmentTime: z.string().min(1, "La hora es requerida"),
  clientId: z.string().min(1, "Debe seleccionar un cliente"),
  dogId: z.string().min(1, "Debe seleccionar una mascota"),
  serviceId: z.string().min(1, "Debe seleccionar un servicio"),
  teacherId: z.string().optional(),
});

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: any;
  selectedDate?: Date | null;
}

export default function AppointmentModal({ 
  open, 
  onOpenChange, 
  appointment, 
  selectedDate 
}: AppointmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      clientId: "",
      dogId: "",
      serviceId: "",
      appointmentDate: "",
      appointmentTime: "",
      status: "pending",
      notes: "",
      price: "",
      teacherId: "",
    },
  });

  // Reset form when appointment changes or modal opens/closes
  useEffect(() => {
    if (open) {
      if (appointment) {
        const appointmentDate = new Date(appointment.appointmentDate);
        form.reset({
          clientId: appointment.clientId || "",
          dogId: appointment.dogId || "",
          serviceId: appointment.serviceId || "",
          appointmentDate: appointmentDate.toISOString().split('T')[0],
          appointmentTime: appointmentDate.toTimeString().slice(0, 5),
          status: appointment.status || "pending",
          notes: appointment.notes || "",
          price: appointment.price?.toString() || "",
          teacherId: appointment.teacherId || "",
        });
      } else {
        const defaultDate = selectedDate || new Date();
        form.reset({
          clientId: "",
          dogId: "",
          serviceId: "",
          appointmentDate: defaultDate.toISOString().split('T')[0],
          appointmentTime: "09:00",
          status: "pending",
          notes: "",
          price: "",
          teacherId: "",
        });
      }
    }
  }, [appointment, selectedDate, open, form]);

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
    enabled: open,
    retry: false,
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
    enabled: open,
    retry: false,
  });

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["/api/teachers"],
    enabled: open && isAdmin,
    retry: false,
  });

  const selectedClientId = form.watch("clientId");
  const { data: dogs } = useQuery({
    queryKey: ["/api/clients", selectedClientId, "dogs"],
    enabled: !!selectedClientId && open,
    retry: false,
  });

  const selectedServiceId = form.watch("serviceId");
  const selectedService = Array.isArray(services) ? services.find((service: any) => service.id === selectedServiceId) : null;

  // Auto-populate price when service changes
  useEffect(() => {
    if (selectedService && !appointment) {
      form.setValue("price", selectedService.price?.toString() || "");
    }
  }, [selectedService, form, appointment]);

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof appointmentFormSchema>) => {
      const { appointmentDate, appointmentTime, price, teacherId, ...rest } = data;
      const combinedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      
      const appointmentData = {
        ...rest,
        appointmentDate: combinedDateTime.toISOString(),
        price: price ? parseFloat(price) : null,
        teacherId: teacherId && teacherId !== "unassigned" ? teacherId : null,
      };

      const url = appointment ? `/api/appointments/${appointment.id}` : "/api/appointments";
      const method = appointment ? "PUT" : "POST";
      const response = await apiRequest(method, url, appointmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/range"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: appointment ? "Cita actualizada" : "Cita creada",
        description: appointment ? "La cita ha sido actualizada exitosamente." : "La nueva cita ha sido programada exitosamente.",
      });
      
      onOpenChange(false);
      form.reset();
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
        description: appointment ? "No se pudo actualizar la cita." : "No se pudo crear la cita.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof appointmentFormSchema>) => {
    createAppointmentMutation.mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid="modal-appointment">
        <DialogHeader>
          <DialogTitle data-testid="text-appointment-modal-title">
            {appointment ? "Editar Cita" : "Nueva Cita"}
          </DialogTitle>
          <DialogDescription>
            {appointment ? "Modifica los detalles de la cita" : "Programa una nueva cita para el cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-client">
                        <SelectValue placeholder="Seleccionar cliente..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientsLoading ? (
                        <SelectItem value="loading" disabled>Cargando clientes...</SelectItem>
                      ) : Array.isArray(clients) && clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dogId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mascota</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={!selectedClientId}>
                    <FormControl>
                      <SelectTrigger data-testid="select-dog">
                        <SelectValue placeholder="Seleccionar mascota..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!selectedClientId ? (
                        <SelectItem value="no-client" disabled>Primero selecciona un cliente</SelectItem>
                      ) : Array.isArray(dogs) && dogs.map((dog: any) => (
                        <SelectItem key={dog.id} value={dog.id}>
                          {dog.name} {dog.breed ? `(${dog.breed})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicio</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-service">
                        <SelectValue placeholder="Seleccionar servicio..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {servicesLoading ? (
                        <SelectItem value="loading" disabled>Cargando servicios...</SelectItem>
                      ) : Array.isArray(services) && services.map((service: any) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - ${Number(service.price).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAdmin && (
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profesor/Entrenador (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-teacher">
                          <SelectValue placeholder="Seleccionar profesor..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Sin asignar</SelectItem>
                        {teachersLoading ? (
                          <SelectItem value="loading" disabled>Cargando profesores...</SelectItem>
                        ) : Array.isArray(teachers) && teachers.filter(teacher => teacher.id && teacher.id.trim() !== '').map((teacher: any) => (
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
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-appointment-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-appointment-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-appointment-price"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {appointment && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-appointment-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                        <SelectItem value="no_show">No asistió</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre la cita..."
                      rows={3}
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-appointment-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={createAppointmentMutation.isPending}
                data-testid="button-save-appointment"
              >
                {createAppointmentMutation.isPending ? "Guardando..." : (appointment ? "Actualizar Cita" : "Agendar Cita")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-testid="button-cancel-appointment"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
