import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertTrainingSessionSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Upload, Plus } from "lucide-react";

const trainingSessionFormSchema = insertTrainingSessionSchema.extend({
  sessionDate: z.string().min(1, "La fecha es requerida"),
  sessionTime: z.string().min(1, "La hora es requerida"),
});

interface TrainingSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: any;
  dogId?: string;
  assignedDogs?: any[];
}

export default function TrainingSessionModal({
  open,
  onOpenChange,
  session,
  dogId,
  assignedDogs = []
}: TrainingSessionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof trainingSessionFormSchema>>({
    resolver: zodResolver(trainingSessionFormSchema),
    defaultValues: {
      dogId: "",
      appointmentId: "",
      objective: "",
      activities: "",
      progress: "",
      behaviorNotes: "",
      nextSteps: "",
      rating: 5,
      duration: 60,
      sessionDate: "",
      sessionTime: "",
    },
  });

  // Reset form when session changes or modal opens/closes
  useEffect(() => {
    if (open) {
      if (session) {
        const sessionDate = new Date(session.sessionDate);
        form.reset({
          dogId: session.dogId || "",
          appointmentId: session.appointmentId || "",
          objective: session.objective || "",
          activities: session.activities || "",
          progress: session.progress || "",
          behaviorNotes: session.behaviorNotes || "",
          nextSteps: session.nextSteps || "",
          rating: session.rating || 5,
          duration: session.duration || 60,
          sessionDate: sessionDate.toISOString().split('T')[0],
          sessionTime: sessionDate.toTimeString().slice(0, 5),
        });
      } else {
        const now = new Date();
        form.reset({
          dogId: dogId || "",
          appointmentId: "",
          objective: "",
          activities: "",
          progress: "",
          behaviorNotes: "",
          nextSteps: "",
          rating: 5,
          duration: 60,
          sessionDate: now.toISOString().split('T')[0],
          sessionTime: now.toTimeString().slice(0, 5),
        });
      }
    }
  }, [session, dogId, open, form]);

  const createSessionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof trainingSessionFormSchema>) => {
      const { sessionDate, sessionTime, ...rest } = data;
      const combinedDateTime = new Date(`${sessionDate}T${sessionTime}`);
      
      const sessionData = {
        ...rest,
        sessionDate: combinedDateTime.toISOString(),
      };

      const url = session ? `/api/training-sessions/${session.id}` : "/api/training-sessions";
      const method = session ? "PUT" : "POST";
      const response = await apiRequest(method, url, sessionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      
      toast({
        title: session ? "Sesión actualizada" : "Sesión creada",
        description: session ? "La sesión de entrenamiento ha sido actualizada." : "Nueva sesión de entrenamiento registrada exitosamente.",
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
        description: session ? "No se pudo actualizar la sesión." : "No se pudo crear la sesión.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof trainingSessionFormSchema>) => {
    createSessionMutation.mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/teacher/evidence/upload-url");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-training-session">
        <DialogHeader>
          <DialogTitle data-testid="text-training-session-modal-title">
            {session ? "Editar Sesión de Entrenamiento" : "Nueva Sesión de Entrenamiento"}
          </DialogTitle>
          <DialogDescription>
            {session ? "Modifica los detalles de la sesión" : "Registra una nueva sesión de entrenamiento"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dogId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perro</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-dog">
                        <SelectValue placeholder="Seleccionar perro..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assignedDogs.map((dog: any) => (
                        <SelectItem key={dog.id} value={dog.id}>
                          {dog.name} - {dog.client.firstName} {dog.client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sessionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-session-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sessionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-session-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo de la sesión</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="¿Qué se quiere lograr en esta sesión?"
                      {...field}
                      data-testid="input-session-objective"
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
                  <FormLabel>Actividades realizadas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe las actividades y ejercicios realizados..."
                      rows={3}
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-session-activities"
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
                  <FormLabel>Progreso observado</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="¿Qué progreso se observó durante la sesión?"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-session-progress"
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
                  <FormLabel>Notas de comportamiento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones sobre el comportamiento del perro..."
                      rows={3}
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-behavior-notes"
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
                  <FormLabel>Próximos pasos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="¿Qué se debe trabajar en la próxima sesión?"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-next-steps"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calificación de la sesión (1-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-session-rating"
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
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-session-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Evidencias multimedia</h4>
              <div className="flex gap-2">
                <ObjectUploader
                  maxNumberOfFiles={5}
                  maxFileSize={50 * 1024 * 1024} // 50MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={(result) => {
                    toast({
                      title: "Archivos subidos",
                      description: `Se subieron ${result.successful.length} archivos correctamente.`,
                    });
                  }}
                  buttonClassName="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir fotos/videos
                </ObjectUploader>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={createSessionMutation.isPending}
                data-testid="button-save-session"
              >
                {createSessionMutation.isPending ? "Guardando..." : (session ? "Actualizar Sesión" : "Crear Sesión")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-testid="button-cancel-session"
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