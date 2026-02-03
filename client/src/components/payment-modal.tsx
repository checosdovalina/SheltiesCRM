import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Camera, Loader2, X, Receipt, Upload } from "lucide-react";

const paymentFormSchema = z.object({
  amount: z.string().min(1, "El monto es requerido"),
  paymentMethod: z.enum(["transfer", "cash", "card", "other"]),
  invoiceId: z.string().optional(),
  notes: z.string().optional(),
  receiptImage: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  invoiceId?: string;
  isAdmin?: boolean;
}

export default function PaymentModal({ 
  open, 
  onOpenChange, 
  clientId,
  invoiceId,
  isAdmin = false
}: PaymentModalProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "transfer",
      invoiceId: invoiceId || "",
      notes: "",
      receiptImage: "",
    },
  });

  const { data: clients } = useQuery<any[]>({
    queryKey: ["/api/clients"],
    enabled: open && isAdmin,
  });

  const { data: invoices } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
    enabled: open && isAdmin,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData & { clientId?: string }) => {
      const endpoint = isAdmin ? "/api/payments" : "/api/client-portal/payments";
      const response = await apiRequest("POST", endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pago registrado",
        description: isAdmin 
          ? "El pago ha sido registrado exitosamente." 
          : "Tu comprobante de pago ha sido enviado para revisión.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/client-portal/payments"] });
      form.reset();
      setReceiptPreview(null);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el pago",
        variant: "destructive",
      });
    },
  });

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

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede ser mayor a 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch("/api/payments/upload-receipt", {
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
        const imagePath = pathParts.slice(2).join('/');
        imageUrl = `/objects/uploads/${imagePath}`;
      }

      form.setValue("receiptImage", imageUrl);
      setReceiptPreview(imageUrl);
      
      toast({
        title: "Comprobante subido",
        description: "La imagen del comprobante se ha subido correctamente",
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
      setIsUploading(false);
    }
  };

  const removeReceipt = () => {
    form.setValue("receiptImage", "");
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: PaymentFormData) => {
    createPaymentMutation.mutate({
      ...data,
      clientId: clientId,
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "transfer": return "Transferencia";
      case "cash": return "Efectivo";
      case "card": return "Tarjeta";
      case "other": return "Otro";
      default: return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            {isAdmin ? "Registrar Pago" : "Enviar Comprobante de Pago"}
          </DialogTitle>
          <DialogDescription>
            {isAdmin 
              ? "Registra un pago recibido de un cliente"
              : "Sube tu comprobante de pago para validación"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isAdmin && (
              <FormField
                control={form.control}
                name="invoiceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factura (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar factura" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin factura asociada</SelectItem>
                        {invoices?.filter((inv: any) => inv.status !== 'paid').map((invoice: any) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} - ${invoice.amount} ({invoice.client?.firstName} {invoice.client?.lastName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        className="pl-7"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Comprobante de Pago</FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              
              {receiptPreview ? (
                <div className="relative border rounded-lg p-2">
                  <img 
                    src={receiptPreview} 
                    alt="Comprobante" 
                    className="w-full h-40 object-contain rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={removeReceipt}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed flex flex-col items-center justify-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Haz clic para subir comprobante
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG hasta 10MB
                      </span>
                    </>
                  )}
                </Button>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional sobre el pago..." 
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createPaymentMutation.isPending || isUploading}
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  isAdmin ? "Registrar Pago" : "Enviar Comprobante"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
