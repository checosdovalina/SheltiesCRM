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
import { CalendarIcon, Stethoscope } from "lucide-react";

const medicalRecordSchema = z.object({
  dogId: z.string().min(1, "Dog ID es requerido"),
  recordDate: z.string().min(1, "Fecha es requerida"),
  recordType: z.string().min(1, "Tipo de registro es requerido"),
  title: z.string().min(1, "Título es requerido"),
  description: z.string().optional(),
  veterinarian: z.string().optional(),
  medications: z.string().optional(),
  notes: z.string().optional(),
});

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;

interface MedicalRecordModalProps {
  dogId: string;
  trigger: React.ReactNode;
}

export function MedicalRecordModal({ dogId, trigger }: MedicalRecordModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      dogId,
      recordDate: new Date().toISOString().split('T')[0],
      recordType: "",
      title: "",
      description: "",
      veterinarian: "",
      medications: "",
      notes: "",
    },
  });

  const createMedicalRecord = useMutation({
    mutationFn: async (data: MedicalRecordFormData) => {
      const payload = {
        ...data,
        recordDate: new Date(data.recordDate).toISOString(),
      };
      return apiRequest(`/api/medical-records`, "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "medical-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "record"] });
      toast({
        title: "Registro médico creado",
        description: "El registro médico se ha guardado exitosamente.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el registro médico.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MedicalRecordFormData) => {
    createMedicalRecord.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Nuevo Registro Médico
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <FormField
                control={form.control}
                name="recordDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha del Registro</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        data-testid="input-record-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de Registro */}
              <FormField
                control={form.control}
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Registro</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-record-type">
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="medical">Consulta Médica</SelectItem>
                        <SelectItem value="vaccination">Vacunación</SelectItem>
                        <SelectItem value="allergy">Alergia</SelectItem>
                        <SelectItem value="surgery">Cirugía</SelectItem>
                        <SelectItem value="checkup">Revisión General</SelectItem>
                        <SelectItem value="emergency">Emergencia</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Revisión anual, Vacuna antirrábica, etc."
                      {...field}
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Veterinario */}
            <FormField
              control={form.control}
              name="veterinarian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veterinario</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nombre del veterinario"
                      {...field}
                      data-testid="input-veterinarian"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el procedimiento, síntomas, observaciones..."
                      rows={3}
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medicaciones */}
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Medicamentos prescritos, dosis, frecuencia..."
                      rows={2}
                      {...field}
                      data-testid="textarea-medications"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones, recomendaciones, seguimiento..."
                      rows={2}
                      {...field}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
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
                disabled={createMedicalRecord.isPending}
                data-testid="button-save-medical-record"
              >
                {createMedicalRecord.isPending ? "Guardando..." : "Guardar Registro"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}