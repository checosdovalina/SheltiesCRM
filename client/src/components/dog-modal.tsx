import { useEffect, useState } from "react";
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
import { insertDogSchema, Dog } from "@shared/schema";
import { PetTypeSelector } from "./PetTypeSelector";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { ImageUploader } from "@/components/ImageUploader";
import { Camera, X } from "lucide-react";
import type { UploadResult } from "@uppy/core";

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

  const form = useForm<z.infer<typeof insertDogSchema>>({
    resolver: zodResolver(insertDogSchema),
    defaultValues: {
      clientId: clientId,
      petTypeId: "",
      name: "",
      breed: "",
      age: undefined,
      weight: "",
      notes: "",
      imageUrl: "",
    },
  });

  // Reset form when dog changes or modal opens/closes
  useEffect(() => {
    if (open) {
      if (dog) {
        form.reset({
          clientId: clientId,
          petTypeId: dog.petTypeId || "",
          name: dog.name || "",
          breed: dog.breed || "",
          age: dog.age || undefined,
          weight: dog.weight || "",
          notes: dog.notes || "",
          imageUrl: dog.imageUrl || "",
        });
        setUploadedImageUrl(dog.imageUrl || "");
      } else {
        form.reset({
          clientId: clientId,
          petTypeId: "",
          name: "",
          breed: "",
          age: undefined,
          weight: "",
          notes: "",
          imageUrl: "",
        });
        setUploadedImageUrl("");
      }
    }
  }, [dog, open, form, clientId]);

  const handleImageUpload = async () => {
    try {
      const response = await fetch("/api/dogs/upload-image", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }
      
      const { uploadURL } = await response.json();
      return {
        method: "PUT" as const,
        url: uploadURL,
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo preparar la subida de imagen",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleImageComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      if (uploadedFile.uploadURL) {
        // Extract the image path from the upload URL to create the serving URL
        const url = new URL(uploadedFile.uploadURL);
        const pathParts = url.pathname.split('/');
        const bucketName = pathParts[1];
        const imagePath = pathParts.slice(2).join('/');
        
        // Create the serving URL using our API endpoint
        const imageUrl = `/dog-images/${imagePath}`;
        setUploadedImageUrl(imageUrl);
        form.setValue("imageUrl", imageUrl);
        toast({
          title: "Imagen subida",
          description: "La foto de la mascota se ha subido correctamente",
        });
      }
    }
  };

  const removeImage = () => {
    setUploadedImageUrl("");
    form.setValue("imageUrl", "");
  };

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
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: dog ? "Mascota actualizada" : "Mascota registrada",
        description: dog 
          ? "La información de la mascota ha sido actualizada exitosamente." 
          : "La nueva mascota ha sido registrada exitosamente.",
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
        description: dog ? "No se pudo actualizar la mascota." : "No se pudo registrar la mascota.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: z.infer<typeof insertDogSchema>) {
    createDogMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-dog-modal">
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
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
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

            {/* Image Upload Section */}
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
                      <ImageUploader
                        onGetUploadParameters={handleImageUpload}
                        onComplete={handleImageComplete}
                        buttonClassName="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Subir Foto
                      </ImageUploader>
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