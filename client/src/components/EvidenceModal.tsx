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
import { Camera, Upload, File } from "lucide-react";

const evidenceSchema = z.object({
  dogId: z.string().min(1, "Dog ID es requerido"),
  type: z.enum(["photo", "video", "document", "note"], {
    required_error: "Tipo de evidencia es requerido",
  }),
  title: z.string().min(1, "Título es requerido"),
  description: z.string().optional(),
});

type EvidenceFormData = z.infer<typeof evidenceSchema> & {
  file?: File;
};

interface EvidenceModalProps {
  dogId: string;
  trigger: React.ReactNode;
}

export function EvidenceModal({ dogId, trigger }: EvidenceModalProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EvidenceFormData>({
    resolver: zodResolver(evidenceSchema),
    defaultValues: {
      dogId,
      type: "photo",
      title: "",
      description: "",
    },
  });

  const selectedType = form.watch("type");

  const createEvidence = useMutation({
    mutationFn: async (data: EvidenceFormData) => {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let mimeType = null;

      // Upload file if provided
      if (data.file) {
        setUploading(true);
        try {
          // Get upload URL
          const uploadResponse = await apiRequest("POST", "/api/objects/upload");
          const { uploadURL } = await uploadResponse.json();

          // Upload file
          const uploadResult = await fetch(uploadURL, {
            method: "PUT",
            body: data.file as File,
            headers: {
              "Content-Type": (data.file as File).type,
            },
          });

          if (!uploadResult.ok) {
            throw new Error("Error al subir el archivo");
          }

          fileUrl = uploadURL.split("?")[0]; // Remove query parameters
          fileName = (data.file as File).name;
          fileSize = (data.file as File).size;
          mimeType = (data.file as File).type;
        } catch (error) {
          console.error("Upload error:", error);
          throw new Error("Error al subir el archivo");
        } finally {
          setUploading(false);
        }
      }

      // Create evidence record
      const payload = {
        dogId: data.dogId,
        type: data.type,
        title: data.title,
        description: data.description,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
      };

      const response = await apiRequest("POST", "/api/evidence", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "evidence"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId, "record"] });
      toast({
        title: "Evidencia creada",
        description: "La evidencia se ha guardado exitosamente.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la evidencia.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EvidenceFormData) => {
    // For note type, file is optional
    if (data.type === "note" || data.file) {
      createEvidence.mutate(data);
    } else {
      toast({
        title: "Archivo requerido",
        description: "Debes seleccionar un archivo para este tipo de evidencia.",
        variant: "destructive",
      });
    }
  };

  const getAcceptedFileTypes = () => {
    switch (selectedType) {
      case "photo":
        return "image/*";
      case "video":
        return "video/*";
      case "document":
        return ".pdf,.doc,.docx,.txt";
      default:
        return "*";
    }
  };

  const getFileTypeLabel = () => {
    switch (selectedType) {
      case "photo":
        return "Imagen (JPG, PNG, etc.)";
      case "video":
        return "Video (MP4, MOV, etc.)";
      case "document":
        return "Documento (PDF, DOC, TXT)";
      case "note":
        return "Sin archivo (solo nota)";
      default:
        return "Cualquier archivo";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Nueva Evidencia
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo de Evidencia */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Evidencia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-evidence-type">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="photo">📸 Fotografía</SelectItem>
                      <SelectItem value="video">🎥 Video</SelectItem>
                      <SelectItem value="document">📄 Documento</SelectItem>
                      <SelectItem value="note">📝 Nota</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Progreso en entrenamiento, Radiografía, etc."
                      {...field}
                      data-testid="input-evidence-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Archivo */}
            {selectedType !== "note" && (
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Archivo</FormLabel>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {getFileTypeLabel()}
                      </div>
                      <FormControl>
                        <Input
                          type="file"
                          accept={getAcceptedFileTypes()}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file);
                          }}
                          data-testid="input-evidence-file"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el contenido, contexto o importancia de esta evidencia..."
                      rows={3}
                      {...field}
                      data-testid="textarea-evidence-description"
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
                disabled={createEvidence.isPending || uploading}
                data-testid="button-save-evidence"
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 animate-spin" />
                    Subiendo...
                  </div>
                ) : createEvidence.isPending ? (
                  "Guardando..."
                ) : (
                  "Guardar Evidencia"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}