import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProtocolSchema, type Protocol } from "@shared/schema";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

const formSchema = insertProtocolSchema.extend({
  steps: z.array(z.object({
    title: z.string().min(1, "Título del paso es requerido"),
    description: z.string().optional(),
    duration: z.string().optional(),
  })).min(1, "Debe haber al menos un paso"),
});

type FormData = z.infer<typeof formSchema>;

interface ProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol?: Protocol | null;
}

export function ProtocolModal({ isOpen, onClose, protocol }: ProtocolModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [steps, setSteps] = useState<Array<{ title: string; description?: string; duration?: string }>>([
    { title: "", description: "", duration: "" }
  ]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "obediencia_basica",
      objectives: "",
      description: "",
      duration: "",
      isActive: true,
      steps: [{ title: "", description: "", duration: "" }],
    },
  });

  useEffect(() => {
    if (protocol) {
      const protocolSteps = protocol.steps as Array<{ title: string; description?: string; duration?: string }> || [{ title: "", description: "", duration: "" }];
      setSteps(protocolSteps);
      form.reset({
        name: protocol.name,
        category: protocol.category,
        objectives: protocol.objectives || "",
        description: protocol.description || "",
        duration: protocol.duration || "",
        isActive: protocol.isActive,
        steps: protocolSteps,
      });
    } else {
      setSteps([{ title: "", description: "", duration: "" }]);
      form.reset({
        name: "",
        category: "obediencia_basica",
        objectives: "",
        description: "",
        duration: "",
        isActive: true,
        steps: [{ title: "", description: "", duration: "" }],
      });
    }
  }, [protocol, form]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("/api/protocols", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({
        title: "Protocolo creado",
        description: "El protocolo se ha creado correctamente",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el protocolo",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => apiRequest(`/api/protocols/${protocol?.id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({
        title: "Protocolo actualizado",
        description: "El protocolo se ha actualizado correctamente",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el protocolo",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      steps: steps.filter(step => step.title.trim() !== ""),
    };

    if (protocol) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const addStep = () => {
    setSteps([...steps, { title: "", description: "", duration: "" }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
      form.setValue("steps", newSteps);
    }
  };

  const updateStep = (index: number, field: "title" | "description" | "duration", value: string) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {protocol ? "Editar Protocolo" : "Nuevo Protocolo"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Protocolo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Obediencia Básica Nivel 1" {...field} data-testid="input-protocol-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-protocol-category">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="obediencia_basica">Obediencia Básica</SelectItem>
                        <SelectItem value="comportamiento">Comportamiento</SelectItem>
                        <SelectItem value="socializacion">Socialización</SelectItem>
                        <SelectItem value="agilidad">Agilidad</SelectItem>
                        <SelectItem value="terapia">Terapia</SelectItem>
                        <SelectItem value="rescate">Rescate</SelectItem>
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
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivos</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Objetivos del protocolo..." 
                      className="min-h-[80px]"
                      {...field}
                      data-testid="textarea-protocol-objectives"
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
                      placeholder="Descripción general del protocolo..." 
                      className="min-h-[80px]"
                      {...field}
                      data-testid="textarea-protocol-description"
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
                  <FormLabel>Duración Estimada</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 4 semanas, 8 sesiones" {...field} data-testid="input-protocol-duration" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Pasos del Protocolo</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  data-testid="button-add-step"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Paso
                </Button>
              </div>

              {steps.map((step, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <FormLabel>Paso {index + 1}: Título</FormLabel>
                        <Input
                          placeholder="Título del paso"
                          value={step.title}
                          onChange={(e) => updateStep(index, "title", e.target.value)}
                          data-testid={`input-step-title-${index}`}
                        />
                      </div>
                      <div>
                        <FormLabel>Descripción</FormLabel>
                        <Textarea
                          placeholder="Descripción del paso (opcional)"
                          value={step.description || ""}
                          onChange={(e) => updateStep(index, "description", e.target.value)}
                          className="min-h-[60px]"
                          data-testid={`textarea-step-description-${index}`}
                        />
                      </div>
                      <div>
                        <FormLabel>Duración</FormLabel>
                        <Input
                          placeholder="Ej: 10 minutos"
                          value={step.duration || ""}
                          onChange={(e) => updateStep(index, "duration", e.target.value)}
                          data-testid={`input-step-duration-${index}`}
                        />
                      </div>
                    </div>
                    {steps.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-step-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-protocol"
              >
                {protocol ? "Actualizar" : "Crear"} Protocolo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
