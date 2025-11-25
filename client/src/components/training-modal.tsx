import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertTrainingSessionSchema } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface TrainingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dogId: string;
  dogName: string;
  plannedProtocolId?: string | null;
  appointmentId?: string | null;
}

export default function TrainingModal({ 
  open, 
  onOpenChange, 
  dogId, 
  dogName,
  plannedProtocolId,
  appointmentId
}: TrainingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: protocols, isLoading: protocolsLoading } = useQuery({
    queryKey: ["/api/protocols"],
    enabled: open,
    retry: false,
  });

  const { data: teachers, isLoading: teachersLoading } = useQuery<any[]>({
    queryKey: ["/api/teachers"],
    enabled: open,
    retry: false,
  });

  const form = useForm<z.infer<typeof insertTrainingSessionSchema>>({
    resolver: zodResolver(insertTrainingSessionSchema),
    defaultValues: {
      dogId: dogId,
      appointmentId: appointmentId || undefined,
      protocolId: plannedProtocolId || undefined,
      sessionDate: new Date(),
      trainer: "",
      objective: "",
      activities: "",
      progress: "",
      behaviorNotes: "",
      nextSteps: "",
      rating: undefined,
      duration: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        dogId: dogId,
        appointmentId: appointmentId || undefined,
        protocolId: plannedProtocolId || undefined,
        sessionDate: new Date(),
        trainer: "",
        objective: "",
        activities: "",
        progress: "",
        behaviorNotes: "",
        nextSteps: "",
        rating: undefined,
        duration: undefined,
      });
    }
  }, [open, dogId, appointmentId, plannedProtocolId, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertTrainingSessionSchema>) => {
      const response = await apiRequest("POST", "/api/training-sessions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "training-sessions"] });
      
      toast({
        title: "Sesión de entrenamiento agregada",
        description: "La sesión ha sido registrada exitosamente.",
      });
      
      onOpenChange(false);
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
        description: "No se pudo agregar la sesión de entrenamiento.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertTrainingSessionSchema>) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-training">
        <DialogHeader>
          <DialogTitle>Nueva Sesión de Entrenamiento - {dogName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sessionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de la Sesión</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        data-testid="input-session-date"
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        data-testid="input-duration"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="trainer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entrenador</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "none" ? "" : value)} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-trainer">
                        <SelectValue placeholder="Seleccionar entrenador..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {teachersLoading ? (
                        <SelectItem value="loading" disabled>Cargando entrenadores...</SelectItem>
                      ) : Array.isArray(teachers) && teachers
                        .filter((teacher: any) => teacher.id && teacher.role === 'teacher')
                        .map((teacher: any) => (
                          <SelectItem key={teacher.id} value={teacher.firstName && teacher.lastName ? `${teacher.firstName} ${teacher.lastName}` : teacher.username}>
                            {teacher.firstName && teacher.lastName ? `${teacher.firstName} ${teacher.lastName}` : teacher.username}
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
              name="protocolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protocolo Aplicado (Opcional)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger data-testid="select-protocol">
                        <SelectValue placeholder={plannedProtocolId ? "Protocolo de la cita seleccionado" : "Seleccionar protocolo..."} />
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

            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo de la Sesión</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Entrenamiento básico de obediencia, etc."
                      data-testid="input-objective"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actividades Realizadas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe las actividades y ejercicios realizados..."
                      rows={3}
                      data-testid="textarea-activities"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progreso Observado (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el progreso y mejoras observadas..."
                      rows={3}
                      data-testid="textarea-progress"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="behaviorNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Comportamiento (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones sobre comportamiento durante la sesión..."
                      rows={3}
                      data-testid="textarea-behavior"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextSteps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próximos Pasos (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Recomendaciones y próximos pasos a trabajar..."
                      rows={3}
                      data-testid="textarea-next-steps"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación de la Sesión (1-10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="8"
                      data-testid="input-rating"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
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
                disabled={createMutation.isPending}
                data-testid="button-save"
              >
                {createMutation.isPending ? "Guardando..." : "Guardar Sesión"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
