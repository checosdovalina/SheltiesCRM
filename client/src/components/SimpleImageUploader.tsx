import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  buttonClassName?: string;
  isUploading?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function SimpleImageUploader({
  onImageUploaded,
  buttonClassName,
  isUploading: externalIsUploading,
  onUploadingChange,
}: SimpleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede ser mayor a 5MB",
        variant: "destructive",
      });
      return;
    }

    onUploadingChange?.(true);

    try {
      const response = await fetch("/api/dogs/upload-image", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener la URL de subida");
      }

      const { uploadURL, useLocalUpload } = await response.json();

      let imageUrl: string;

      if (useLocalUpload) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch(uploadURL, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("No se pudo subir la imagen");
        }

        const result = await uploadResponse.json();
        imageUrl = result.url;
      } else {
        const uploadResponse = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("No se pudo subir la imagen");
        }

        const url = new URL(uploadURL);
        const pathParts = url.pathname.split('/');
        const imagePath = pathParts.slice(3).join('/');
        imageUrl = `/objects/${imagePath}`;
      }

      onImageUploaded(imageUrl);
      
      toast({
        title: "Imagen subida",
        description: "La foto de la mascota se ha subido correctamente",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo subir la imagen",
        variant: "destructive",
      });
    } finally {
      onUploadingChange?.(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={externalIsUploading}
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={buttonClassName}
        disabled={externalIsUploading}
      >
        {externalIsUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <Camera className="w-4 h-4 mr-2" />
            Subir Foto
          </>
        )}
      </Button>
    </div>
  );
}
