import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen } from "lucide-react";

const trainingSessionSchema = z.object({
  dogId: z.string().min(1, "Dog ID es requerido"),
  sessionDate: z.string().min(1, "Fecha es requerida"),
  trainer: z.string().optional(),
  objective: z.string().min(1, "Objetivo es requerido"),
  activities: z.string().optional(),
  progress: z.string().optional(),
  behaviorNotes: z.string().optional(),
  nextSteps: z.string().optional(),
  rating: z.number().min(1).max(10).optional(),
  duration: z.number().min(1).optional(),
});

type TrainingSessionFormData = z.infer<typeof trainingSessionSchema>;

interface TrainingSessionModalProps {
  dogId: string;
  trigger: React.ReactNode;
}

export function TrainingSessionModal({ dogId, trigger }: TrainingSessionModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TrainingSessionFormData>({
    resolver: zodResolver(trainingSessionSchema),
    defaultValues: {
      dogId,
      sessionDate: new Date().toISOString().split('T')[0],
      trainer: "",
      objective: "",
      activities: "",
      progress: "",
      behaviorNotes: "",
      nextSteps: "",
      duration: 60,
    },
  });

  const createTrainingSession = useMutation({
    mutationFn: async (data: TrainingSessionFormData) => {
      const payload = {
        ...data,
        sessionDate: new Date(data.sessionDate).toISOString(),
        rating: data.rating || null,
        duration: data.duration || null,
      };
      const response = await apiRequest("POST", `/api/training-sessions`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "training-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "record"] });
      toast({
        title: "Sesión de entrenamiento creada",
        description: "La sesión se ha guardado exitosamente.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la sesión de entrenamiento.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TrainingSessionFormData) => {
    createTrainingSession.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Nueva Sesión de Entrenamiento
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <FormField
                control={form.control}
                name="sessionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de la Sesión</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        data-testid="input-session-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duración */}
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
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        data-testid="input-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Entrenador */}
            <FormField
              control={form.control}
              name="trainer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entrenador</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nombre del entrenador"
                      {...field}
                      data-testid="input-trainer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Objetivo */}
            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo de la Sesión</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Entrenamiento básico de obediencia"
                      {...field}
                      data-testid="input-objective"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actividades */}
            <FormField
              control={form.control}
              name="activities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actividades Realizadas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe las actividades y ejercicios realizados..."
                      rows={3}
                      {...field}
                      data-testid="textarea-activities"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Progreso */}
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progreso Observado</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el progreso y mejoras observadas..."
                      rows={2}
                      {...field}
                      data-testid="textarea-progress"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas de Comportamiento */}
            <FormField
              control={form.control}
              name="behaviorNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Comportamiento</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones sobre el comportamiento durante la sesión..."
                      rows={2}
                      {...field}
                      data-testid="textarea-behavior"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Próximos Pasos */}
            <FormField
              control={form.control}
              name="nextSteps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próximos Pasos</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Recomendaciones y objetivos para la siguiente sesión..."
                      rows={2}
                      {...field}
                      data-testid="textarea-next-steps"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Calificación */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación de la Sesión (1-10)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                    <FormControl>
                      <SelectTrigger data-testid="select-rating">
                        <SelectValue placeholder="Selecciona una calificación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} {i + 1 <= 3 ? "⭐" : i + 1 <= 6 ? "⭐⭐" : i + 1 <= 8 ? "⭐⭐⭐" : "⭐⭐⭐⭐"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createTrainingSession.isPending}
                data-testid="button-save-training-session"
              >
                {createTrainingSession.isPending ? "Guardando..." : "Guardar Sesión"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}