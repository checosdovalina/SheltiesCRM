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
import { insertEvidenceSchema } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface EvidenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dogId: string;
  dogName: string;
}

export default function EvidenceModal({ 
  open, 
  onOpenChange, 
  dogId, 
  dogName 
}: EvidenceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof insertEvidenceSchema>>({
    resolver: zodResolver(insertEvidenceSchema),
    defaultValues: {
      dogId: dogId,
      type: "photo",
      title: "",
      description: "",
      fileUrl: "",
      fileName: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        dogId: dogId,
        type: "photo",
        title: "",
        description: "",
        fileUrl: "",
        fileName: "",
      });
    }
  }, [open, dogId, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertEvidenceSchema>) => {
      const response = await apiRequest("POST", "/api/evidence", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "evidence"] });
      
      toast({
        title: "Evidencia agregada",
        description: "La evidencia ha sido agregada exitosamente.",
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
        description: "No se pudo agregar la evidencia.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertEvidenceSchema>) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-evidence">
        <DialogHeader>
          <DialogTitle>Nueva Evidencia - {dogName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Evidencia</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-evidence-type">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="photo">Fotografía</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                      <SelectItem value="note">Nota</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Foto del entrenamiento, Video de progreso, etc."
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe la evidencia..."
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
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del Archivo (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      data-testid="input-file-url"
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
                {createMutation.isPending ? "Guardando..." : "Guardar Evidencia"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
