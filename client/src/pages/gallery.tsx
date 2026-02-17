import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Share2, Image, Video, Upload, Copy, ExternalLink, Calendar, Eye } from "lucide-react";
import type { GalleryDay, GalleryItem } from "@shared/schema";

function generateSlug() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export default function Gallery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdminOrTeacher = user?.role === "admin" || user?.role === "teacher";
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<GalleryDay | null>(null);
  const [uploadingDay, setUploadingDay] = useState<number | null>(null);

  const [newDay, setNewDay] = useState({ title: "", description: "", date: new Date().toISOString().split("T")[0] });

  const { data: galleryDays = [], isLoading } = useQuery<GalleryDay[]>({
    queryKey: ["/api/gallery-days"],
  });

  const createDayMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; date: string }) => {
      const res = await apiRequest("POST", "/api/gallery-days", {
        ...data,
        shareSlug: generateSlug(),
        createdById: user?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery-days"] });
      setCreateOpen(false);
      setNewDay({ title: "", description: "", date: new Date().toISOString().split("T")[0] });
      toast({ title: "Día de galería creado" });
    },
  });

  const deleteDayMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/gallery-days/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery-days"] });
      setSelectedDay(null);
      toast({ title: "Día de galería eliminado" });
    },
  });

  const copyShareLink = (slug: string) => {
    const url = `${window.location.origin}/galeria/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Enlace copiado", description: "El enlace público ha sido copiado al portapapeles" });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (selectedDay) {
    return (
      <GalleryDayDetail
        day={selectedDay}
        onBack={() => setSelectedDay(null)}
        isAdminOrTeacher={!!isAdminOrTeacher}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Galería</h1>
          <p className="text-muted-foreground">Fotos y videos organizados por día</p>
        </div>
        {isAdminOrTeacher && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Nuevo Día</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Día de Galería</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={newDay.title}
                    onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                    placeholder="Ej: Clase de obediencia básica"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha</label>
                  <Input
                    type="date"
                    value={newDay.date}
                    onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Textarea
                    value={newDay.description}
                    onChange={(e) => setNewDay({ ...newDay, description: e.target.value })}
                    placeholder="Descripción opcional del día..."
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createDayMutation.mutate(newDay)}
                  disabled={!newDay.title || !newDay.date || createDayMutation.isPending}
                >
                  {createDayMutation.isPending ? "Creando..." : "Crear Día"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {galleryDays.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay días en la galería</h3>
            <p className="text-muted-foreground">
              {isAdminOrTeacher
                ? "Crea un nuevo día para empezar a subir fotos y videos."
                : "Aún no se han publicado fotos o videos."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryDays.map((day) => (
            <GalleryDayCard
              key={day.id}
              day={day}
              isAdminOrTeacher={!!isAdminOrTeacher}
              onView={() => setSelectedDay(day)}
              onDelete={() => {
                if (confirm("¿Estás seguro de eliminar este día y todas sus fotos/videos?")) {
                  deleteDayMutation.mutate(day.id);
                }
              }}
              onCopyLink={() => copyShareLink(day.shareSlug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryDayCard({
  day,
  isAdminOrTeacher,
  onView,
  onDelete,
  onCopyLink,
}: {
  day: GalleryDay;
  isAdminOrTeacher: boolean;
  onView: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
}) {
  const { data: items = [] } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery-days", day.id, "items"],
  });

  const coverImage = items.find((i) => i.mediaType === "image")?.fileUrl || day.coverImageUrl;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative h-48 bg-muted" onClick={onView}>
        {coverImage ? (
          <img src={coverImage} alt={day.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex items-center gap-2 text-white/80 text-xs">
            <Calendar className="w-3 h-3" />
            {day.date}
          </div>
          <h3 className="text-white font-semibold text-sm mt-1 line-clamp-1">{day.title}</h3>
        </div>
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {items.length} {items.length === 1 ? "archivo" : "archivos"}
        </div>
      </div>
      <CardContent className="p-3">
        {day.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{day.description}</p>
        )}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="w-3 h-3 mr-1" /> Ver
          </Button>
          <Button variant="outline" size="sm" onClick={onCopyLink} title="Copiar enlace público">
            <Share2 className="w-3 h-3" />
          </Button>
          {isAdminOrTeacher && (
            <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive" title="Eliminar">
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GalleryDayDetail({
  day,
  onBack,
  isAdminOrTeacher,
}: {
  day: GalleryDay;
  onBack: () => void;
  isAdminOrTeacher: boolean;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const { data: items = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery-days", day.id, "items"],
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/gallery-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery-days", day.id, "items"] });
      toast({ title: "Archivo eliminado" });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const mediaType = file.type.startsWith("video/") ? "video" : "image";

        const uploadRes = await fetch("/api/gallery/upload", { method: "POST", credentials: "include" });
        const uploadData = await uploadRes.json();

        let fileUrl = "";

        if (uploadData.useLocalUpload) {
          const formData = new FormData();
          formData.append("file", file);
          const localRes = await fetch(uploadData.uploadURL, {
            method: "POST",
            body: formData,
            credentials: "include",
          });
          const localData = await localRes.json();
          fileUrl = localData.url;
        } else {
          await fetch(uploadData.uploadURL, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });
          const urlParts = new URL(uploadData.uploadURL);
          fileUrl = urlParts.pathname;
        }

        await apiRequest("POST", "/api/gallery-items", {
          dayId: day.id,
          mediaType,
          fileUrl,
          sortOrder: items.length + i,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/gallery-days", day.id, "items"] });
      toast({ title: `${files.length} archivo(s) subido(s)` });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Error al subir archivos", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/galeria/${day.shareSlug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Enlace copiado", description: url });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>← Volver</Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{day.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            {day.date}
          </div>
        </div>
        <Button variant="outline" onClick={copyShareLink}>
          <Share2 className="w-4 h-4 mr-2" /> Compartir
        </Button>
        <Button variant="outline" onClick={() => window.open(`/galeria/${day.shareSlug}`, "_blank")}>
          <ExternalLink className="w-4 h-4 mr-2" /> Ver público
        </Button>
      </div>

      {day.description && (
        <p className="text-muted-foreground mb-6">{day.description}</p>
      )}

      {isAdminOrTeacher && (
        <div className="mb-6">
          <label className="cursor-pointer">
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {uploading ? "Subiendo archivos..." : "Haz clic para subir fotos o videos"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Puedes seleccionar múltiples archivos</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay archivos en este día</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden bg-muted aspect-square">
              {item.mediaType === "video" ? (
                <video
                  src={item.fileUrl}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <img
                  src={item.fileUrl}
                  alt={item.caption || ""}
                  className="w-full h-full object-cover"
                />
              )}
              {item.mediaType === "video" && (
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
                  <Video className="w-3 h-3" /> Video
                </div>
              )}
              {isAdminOrTeacher && (
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar este archivo?")) {
                      deleteItemMutation.mutate(item.id);
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}