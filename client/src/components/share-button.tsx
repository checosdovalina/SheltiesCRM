import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { SiWhatsapp, SiFacebook, SiX } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  variant?: "outline" | "default" | "ghost";
  size?: "default" | "sm" | "icon";
  label?: string;
  className?: string;
}

export function ShareButton({
  url,
  title,
  text = "",
  variant = "outline",
  size = "default",
  label = "Compartir",
  className = "",
}: ShareButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullText = text ? `${text}\n${url}` : url;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url });
        return;
      } catch {
        // user cancelled or not supported — fall through to popover
      }
    }
    setOpen((v) => !v);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Enlace copiado al portapapeles" });
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text || title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Button variant={variant} size={size} onClick={handleShare}>
        <Share2 className={`w-4 h-4 ${size !== "icon" ? "mr-2" : ""}`} />
        {size !== "icon" && label}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white border rounded-xl shadow-lg p-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-2 pb-2 border-b">
              <span className="text-sm font-medium text-gray-700">Compartir en</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-50 text-green-700 transition-colors w-full text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                <SiWhatsapp className="w-4 h-4 flex-shrink-0" />
                WhatsApp
              </a>

              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700 transition-colors w-full text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                <SiFacebook className="w-4 h-4 flex-shrink-0" />
                Facebook
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800 transition-colors w-full text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                <SiX className="w-4 h-4 flex-shrink-0" />
                X (Twitter)
              </a>

              <button
                onClick={copyLink}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors w-full text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Copy className="w-4 h-4 flex-shrink-0" />}
                {copied ? "¡Copiado!" : "Copiar enlace"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
