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
  plannedProtocolId: z.string().optional(),
});

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: any;
  selectedDate?: Date | null;
  selectedTimeSlot?: number | null;
  selectedTeacherId?: string | null;
}

export default function AppointmentModal({ 
  open, 
  onOpenChange, 
  appointment, 
  selectedDate,
  selectedTimeSlot,
  selectedTeacherId
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
      plannedProtocolId: "",
    },
  });

  // Reset form when appointment changes or modal opens/closes
  useEffect(() => {
    if (open) {
      if (appointment) {
        const appointmentDate = new Date(appointment.appointmentDate);
        
        // Extract IDs from nested objects
        const clientId = appointment.clientId || appointment.client?.id || "";
        const dogId = appointment.dogId || appointment.dog?.id || "";
        const serviceId = appointment.serviceId || appointment.service?.id || "";
        const teacherId = appointment.teacherId || appointment.teacher?.id || "";
        const plannedProtocolId = appointment.plannedProtocolId || "";
        
        // Extract time directly from ISO string to avoid timezone conversion issues
        const isoString = appointment.appointmentDate;
        const timeString = isoString.split('T')[1].substring(0, 5); // Extract HH:MM from ISO string
        
        const formData = {
          clientId,
          dogId,
          serviceId,
          appointmentDate: appointmentDate.toISOString().split('T')[0],
          appointmentTime: timeString,
          status: appointment.status || "pending",
          notes: appointment.notes || "",
          price: appointment.price?.toString() || "",
          teacherId,
          plannedProtocolId,
        };
        form.reset(formData);
      } else {
        const defaultDate = selectedDate || new Date();
        const defaultTime = selectedTimeSlot !== null && selectedTimeSlot !== undefined
          ? `${selectedTimeSlot.toString().padStart(2, '0')}:00`
          : "09:00";
        form.reset({
          clientId: "",
          dogId: "",
          serviceId: "",
          appointmentDate: defaultDate.toISOString().split('T')[0],
          appointmentTime: defaultTime,
          status: "pending",
          notes: "",
          price: "",
          teacherId: selectedTeacherId || "",
          plannedProtocolId: "",
        });
      }
    }
  }, [appointment, selectedDate, selectedTimeSlot, selectedTeacherId, open, form]);

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
    enabled: open,
    retry: false,
  });

  const { data: protocols, isLoading: protocolsLoading } = useQuery({
    queryKey: ["/api/protocols"],
    enabled: open,
    retry: false,
  });

  const selectedClientId = form.watch("clientId");
  const { data: dogs } = useQuery({
    queryKey: ["/api/clients", selectedClientId, "dogs"],
    enabled: !!selectedClientId && open,
    retry: false,
  });

  // Fetch packages for selected client to filter services
  const { data: clientPackages } = useQuery<any[]>({
    queryKey: ["/api/clients", selectedClientId, "packages"],
    enabled: !!selectedClientId && open,
    retry: false,
  });

  // Filter services based on client's active packages
  const filteredServices = (() => {
    if (!Array.isArray(services)) return [];
    
    // If client has active packages with specific services, filter
    if (clientPackages && clientPackages.length > 0) {
      const activePackages = clientPackages.filter((pkg: any) => 
        pkg.status === 'active' && pkg.remainingSessions > 0
      );
      
      if (activePackages.length > 0) {
        // Get only packages that have a serviceId defined
        const packagesWithService = activePackages.filter((pkg: any) => pkg.serviceId);
        
        if (packagesWithService.length > 0) {
          // If there are packages with specific services, filter to those services
          const packageServiceIds = packagesWithService.map((pkg: any) => pkg.serviceId);
          return services.filter((service: any) => 
            packageServiceIds.includes(service.id)
          );
        }
        // If packages exist but none have serviceId, show all services
        return services;
      }
    }
    
    // If no active packages, show all services
    return services;
  })();

  // Additional effect to load dogs when editing appointment with different client
  useEffect(() => {
    if (appointment && appointment.clientId && open) {
      // Force refetch dogs for the appointment's client if it's different from selected
      const currentClientId = form.getValues("clientId");
      if (currentClientId && currentClientId !== selectedClientId) {
        // This will be handled by the query above when clientId updates
      }
    }
  }, [appointment, open, form, selectedClientId]);

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
      const { appointmentDate, appointmentTime, price, teacherId, plannedProtocolId, ...rest } = data;
      const combinedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      
      const appointmentData = {
        ...rest,
        appointmentDate: combinedDateTime.toISOString(), // Send as ISO string
        price: price && price.trim() !== "" ? price : null, // Keep as string
        teacherId: teacherId && teacherId !== "unassigned" ? teacherId : null,
        plannedProtocolId: plannedProtocolId && plannedProtocolId !== "none" ? plannedProtocolId : null,
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
                      ) : Array.isArray(clients) && clients
                          .filter(client => client.id && client.id.trim() !== '')
                          .map((client: any) => (
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
                      ) : Array.isArray(dogs) && dogs
                          .filter(dog => dog.id && dog.id.trim() !== '')
                          .map((dog: any) => (
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
                  <FormLabel>
                    Servicio
                    {clientPackages && clientPackages.filter((p: any) => p.status === 'active' && p.remainingSessions > 0).length > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">(Filtrado por paquetes activos)</span>
                    )}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClientId}>
                    <FormControl>
                      <SelectTrigger data-testid="select-service">
                        <SelectValue placeholder={!selectedClientId ? "Primero selecciona un cliente..." : "Seleccionar servicio..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!selectedClientId ? (
                        <SelectItem value="no-client" disabled>Primero selecciona un cliente</SelectItem>
                      ) : servicesLoading ? (
                        <SelectItem value="loading" disabled>Cargando servicios...</SelectItem>
                      ) : filteredServices.length === 0 ? (
                        <SelectItem value="no-services" disabled>No hay servicios disponibles</SelectItem>
                      ) : filteredServices
                          .filter((service: any) => service.id && service.id.trim() !== '')
                          .map((service: any) => (
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
              <>
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
                          ) : Array.isArray(teachers) && teachers
                            .filter(teacher => teacher.id && teacher.id.trim() !== '')
                            .map((teacher: any) => (
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

                <FormField
                  control={form.control}
                  name="plannedProtocolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protocolo Planificado (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-protocol">
                            <SelectValue placeholder="Seleccionar protocolo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin protocolo</SelectItem>
                          {protocolsLoading ? (
                            <SelectItem value="loading" disabled>Cargando protocolos...</SelectItem>
                          ) : Array.isArray(protocols) && protocols
                            .filter((protocol: any) => protocol.id && protocol.id.trim() !== '' && protocol.isActive)
                            .map((protocol: any) => (
                              <SelectItem key={protocol.id} value={protocol.id}>
                                {protocol.name} ({protocol.category})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
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
