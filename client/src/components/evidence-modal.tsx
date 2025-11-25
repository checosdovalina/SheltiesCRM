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
import { Upload, X, FileImage, FileVideo, FileText, Loader2 } from "lucide-react";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

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
      setSelectedFile(null);
      setUploadedUrl("");
    }
  }, [open, dogId, form]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadedUrl(data.url);
      form.setValue("fileUrl", data.url);
      form.setValue("fileName", file.name);
      
      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente.",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo. Intente de nuevo.",
        variant: "destructive",
      });
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedUrl("");
    form.setValue("fileUrl", "");
    form.setValue("fileName", "");
  };

  const getFileIcon = () => {
    const type = form.watch("type");
    switch (type) {
      case "photo":
        return <FileImage className="h-8 w-8 text-blue-500" />;
      case "video":
        return <FileVideo className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

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

            <div className="space-y-2">
              <FormLabel>Archivo</FormLabel>
              
              {!selectedFile && !uploadedUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    data-testid="input-file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-10 w-10 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Haz clic para seleccionar un archivo
                    </span>
                    <span className="text-xs text-gray-400">
                      Imágenes, videos o documentos (max 10MB)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    ) : (
                      getFileIcon()
                    )}
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">
                        {selectedFile?.name || "Archivo subido"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isUploading ? "Subiendo..." : "Listo para guardar"}
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      data-testid="button-remove-file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

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
                disabled={createMutation.isPending || isUploading}
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
