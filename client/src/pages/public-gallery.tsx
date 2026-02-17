import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Image, Video, Calendar, ArrowLeft } from "lucide-react";
import type { GalleryDay, GalleryItem } from "@shared/schema";
import logoSheltiesSmall from "@assets/logo shelties_1756234743860.png";

type GalleryDayWithItems = GalleryDay & { items: GalleryItem[] };

export default function PublicGallery() {
  const params = useParams<{ slug: string }>();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery<GalleryDayWithItems>({
    queryKey: ["/api/public/gallery", params.slug],
    enabled: !!params.slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando galería...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Galería no encontrada</h1>
          <p className="text-gray-500">El enlace que seguiste no es válido o la galería ha sido eliminada.</p>
        </div>
      </div>
    );
  }

  const images = data.items.filter((i) => i.mediaType === "image");
  const videos = data.items.filter((i) => i.mediaType === "video");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <img src={logoSheltiesSmall} alt="Instituto Shelties" className="h-10 w-auto" />
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{data.title}</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar className="w-4 h-4" />
              {data.date}
            </div>
          </div>
        </div>
      </header>

      {data.description && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-gray-600">{data.description}</p>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">
        {data.items.length === 0 ? (
          <div className="text-center py-20">
            <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Esta galería aún no tiene contenido.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {data.items.map((item, index) => (
              <div
                key={item.id}
                className="relative group rounded-lg overflow-hidden bg-gray-200 aspect-square cursor-pointer"
                onClick={() => item.mediaType === "image" && setLightboxIndex(index)}
              >
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
                    alt={item.caption || data.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}
                {item.mediaType === "video" && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
                    <Video className="w-3 h-3" /> Video
                  </div>
                )}
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
            onClick={() => setLightboxIndex(null)}
          >
            ×
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white text-4xl hover:text-gray-300 z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              ‹
            </button>
          )}
          {lightboxIndex < data.items.length - 1 && (
            <button
              className="absolute right-4 text-white text-4xl hover:text-gray-300 z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              ›
            </button>
          )}
          <img
            src={data.items[lightboxIndex].fileUrl}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <footer className="text-center py-6 text-gray-400 text-sm">
        Instituto Shelties - Galería
      </footer>
    </div>
  );
}