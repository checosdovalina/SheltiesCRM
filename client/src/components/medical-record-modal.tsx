import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertMedicalRecordSchema } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface MedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dogId: string;
  dogName: string;
}

export default function MedicalRecordModal({ 
  open, 
  onOpenChange, 
  dogId, 
  dogName 
}: MedicalRecordModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof insertMedicalRecordSchema>>({
    resolver: zodResolver(insertMedicalRecordSchema),
    defaultValues: {
      dogId: dogId,
      recordDate: new Date(),
      recordType: "revision",
      title: "",
      veterinarian: "",
      description: "",
      medications: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        dogId: dogId,
        recordDate: new Date(),
        recordType: "revision",
        title: "",
        veterinarian: "",
        description: "",
        medications: "",
        notes: "",
      });
    }
  }, [open, dogId, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertMedicalRecordSchema>) => {
      const response = await apiRequest("POST", "/api/medical-records", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "medical-records"] });
      
      toast({
        title: "Registro médico agregado",
        description: "El registro médico ha sido agregado exitosamente.",
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
        description: "No se pudo agregar el registro médico.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertMedicalRecordSchema>) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-medical-record">
        <DialogHeader>
          <DialogTitle>Nuevo Registro Médico - {dogName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recordDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha del Registro</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        data-testid="input-record-date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Registro</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-record-type">
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vacuna">Vacuna</SelectItem>
                        <SelectItem value="revision">Revisión</SelectItem>
                        <SelectItem value="medicamento">Medicamento</SelectItem>
                        <SelectItem value="cirugia">Cirugía</SelectItem>
                        <SelectItem value="emergencia">Emergencia</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Vacuna antirrábica, Revisión anual, etc."
                      data-testid="input-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="veterinarian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veterinario (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del veterinario"
                      data-testid="input-veterinarian"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el procedimiento, síntomas observados..."
                      rows={3}
                      data-testid="textarea-description"
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
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicamentos (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Medicamentos prescritos, dosis, frecuencia..."
                      rows={3}
                      data-testid="textarea-medications"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones, recomendaciones, seguimiento..."
                      rows={3}
                      data-testid="textarea-notes"
                      {...field}
                      value={field.value || ""}
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
                {createMutation.isPending ? "Guardando..." : "Guardar Registro"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
