import { useEffect, useState, useCallback, useMemo } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { insertDogSchema } from "@shared/schema";
import { PetTypeSelector } from "./PetTypeSelector";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { SimpleImageUploader } from "@/components/SimpleImageUploader";
import { X } from "lucide-react";

interface DogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  dog?: any;
}

export default function DogModal({ open, onOpenChange, clientId, clientName, dog }: DogModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const defaultValues = useMemo(() => ({
    clientId: clientId,
    petTypeId: "",
    name: "",
    breed: "",
    age: undefined as number | undefined,
    weight: "",
    notes: "",
    imageUrl: "",
  }), [clientId]);

  const form = useForm<z.infer<typeof insertDogSchema>>({
    resolver: zodResolver(insertDogSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      if (dog) {
        const dogValues = {
          clientId: clientId,
          petTypeId: dog.petTypeId || "",
          name: dog.name || "",
          breed: dog.breed || "",
          age: dog.age || undefined,
          weight: dog.weight || "",
          notes: dog.notes || "",
          imageUrl: dog.imageUrl || "",
        };
        form.reset(dogValues);
        setUploadedImageUrl(dog.imageUrl || "");
      } else {
        form.reset(defaultValues);
        setUploadedImageUrl("");
      }
    }
  }, [open, dog, clientId, defaultValues, form]);

  const handleImageUploaded = useCallback((imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    form.setValue("imageUrl", imageUrl, { shouldValidate: false, shouldDirty: true });
  }, [form]);

  const removeImage = useCallback(() => {
    setUploadedImageUrl("");
    form.setValue("imageUrl", "", { shouldValidate: false, shouldDirty: true });
  }, [form]);

  const createDogMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertDogSchema>) => {
      const url = dog ? `/api/dogs/${dog.id}` : "/api/dogs";
      const method = dog ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "dogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients-with-dogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: dog ? "Mascota actualizada" : "Mascota registrada",
        description: dog 
          ? "La información de la mascota ha sido actualizada exitosamente." 
          : "La nueva mascota ha sido registrada exitosamente.",
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
        description: dog ? "No se pudo actualizar la mascota." : "No se pudo registrar la mascota.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = useCallback((data: z.infer<typeof insertDogSchema>) => {
    createDogMutation.mutate(data);
  }, [createDogMutation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md max-h-[90vh] overflow-y-auto" 
        data-testid="dialog-dog-modal"
      >
        <DialogHeader>
          <DialogTitle data-testid="text-dog-modal-title">
            {dog ? "Editar Mascota" : `Agregar Mascota a ${clientName}`}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la mascota</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Buddy, Luna, Max..." 
                      {...field}
                      data-testid="input-dog-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="petTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Mascota</FormLabel>
                  <FormControl>
                    <PetTypeSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecciona el tipo de mascota"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raza (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Labrador, Golden Retriever, Mestizo..." 
                      {...field}
                      value={field.value || ""}
                      data-testid="input-dog-breed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad (años)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ej: 3"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : parseInt(value, 10));
                        }}
                        data-testid="input-dog-age"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: 25.5"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-dog-weight"
                      />
                    </FormControl>
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
                  <FormLabel>Notas adicionales (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional sobre la mascota, comportamiento, alergias, etc..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                      data-testid="input-dog-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Foto de la mascota (opcional)</FormLabel>
                  <div className="space-y-4">
                    {uploadedImageUrl ? (
                      <div className="relative inline-block">
                        <img
                          src={uploadedImageUrl}
                          alt="Foto de la mascota"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                          data-testid="dog-image-preview"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeImage}
                          data-testid="button-remove-image"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <SimpleImageUploader
                        onImageUploaded={handleImageUploaded}
                        buttonClassName="w-full"
                        isUploading={isUploading}
                        onUploadingChange={setIsUploading}
                      />
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-dog-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createDogMutation.isPending}
                data-testid="button-dog-save"
              >
                {createDogMutation.isPending
                  ? "Guardando..." 
                  : dog 
                    ? "Actualizar" 
                    : "Agregar Mascota"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
