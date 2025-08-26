import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { insertInvoiceSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";
import { Plus, Trash2, Calculator } from "lucide-react";

const invoiceFormSchema = insertInvoiceSchema.extend({
  dueDate: z.string().optional(),
  items: z.array(z.object({
    appointmentId: z.string().optional(),
    serviceId: z.string().optional(),
    description: z.string().min(1, "La descripción es requerida"),
    quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
    unitPrice: z.number().min(0, "El precio debe ser mayor o igual a 0"),
    totalPrice: z.number().min(0, "El total debe ser mayor o igual a 0"),
  })).min(1, "Debe agregar al menos un item"),
});

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: any;
}

export default function BillingModal({ open, onOpenChange, invoice }: BillingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState([{
    appointmentId: "",
    serviceId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
  }]);

  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: "",
      amount: 0,
      status: "draft",
      dueDate: "",
      notes: "",
      items: items,
    },
  });

  // Reset form when invoice changes or modal opens/closes
  useEffect(() => {
    if (open) {
      if (invoice) {
        const dueDateStr = invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "";
        form.reset({
          clientId: invoice.clientId || "",
          amount: Number(invoice.amount) || 0,
          status: invoice.status || "draft",
          dueDate: dueDateStr,
          notes: invoice.notes || "",
          items: invoice.items || items,
        });
        if (invoice.items) {
          setItems(invoice.items);
        }
      } else {
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        form.reset({
          clientId: "",
          amount: 0,
          status: "draft",
          dueDate: defaultDueDate.toISOString().split('T')[0],
          notes: "",
          items: items,
        });
        setItems([{
          appointmentId: "",
          serviceId: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
        }]);
      }
    }
  }, [invoice, open, form]);

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
    enabled: open,
    retry: false,
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
    enabled: open,
    retry: false,
  });

  const selectedClientId = form.watch("clientId");
  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!selectedClientId && open,
    retry: false,
  });

  const clientAppointments = appointments?.filter((apt: any) => 
    apt.client?.id === selectedClientId && apt.status === "completed"
  ) || [];

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof invoiceFormSchema>) => {
      const { dueDate, items: formItems, ...rest } = data;
      
      // Create invoice first
      const invoiceData = {
        ...rest,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      const url = invoice ? `/api/invoices/${invoice.id}` : "/api/invoices";
      const method = invoice ? "PUT" : "POST";
      const response = await apiRequest(method, url, invoiceData);
      const savedInvoice = await response.json();
      
      // Create invoice items if it's a new invoice
      if (!invoice && formItems.length > 0) {
        for (const item of formItems) {
          await apiRequest("POST", "/api/invoice-items", {
            invoiceId: savedInvoice.id,
            appointmentId: item.appointmentId || null,
            serviceId: item.serviceId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          });
        }
      }
      
      return savedInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: invoice ? "Factura actualizada" : "Factura creada",
        description: invoice ? "La factura ha sido actualizada exitosamente." : "La nueva factura ha sido creada exitosamente.",
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
        description: invoice ? "No se pudo actualizar la factura." : "No se pudo crear la factura.",
        variant: "destructive",
      });
    },
  });

  const updateItemPrice = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    setItems(newItems);
    form.setValue('items', newItems);
    
    // Update total invoice amount
    const totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
    form.setValue('amount', totalAmount);
  };

  const updateItemDescription = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].description = value;
    setItems(newItems);
    form.setValue('items', newItems);
  };

  const selectAppointment = (index: number, appointmentId: string) => {
    const appointment = clientAppointments.find((apt: any) => apt.id === appointmentId);
    if (appointment) {
      const newItems = [...items];
      newItems[index].appointmentId = appointmentId;
      newItems[index].serviceId = appointment.service?.id || "";
      newItems[index].description = `${appointment.service?.name} - ${appointment.dog?.name}`;
      newItems[index].unitPrice = Number(appointment.price) || 0;
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
      setItems(newItems);
      form.setValue('items', newItems);
      
      // Update total invoice amount
      const totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      form.setValue('amount', totalAmount);
    }
  };

  const selectService = (index: number, serviceId: string) => {
    const service = services?.find((svc: any) => svc.id === serviceId);
    if (service) {
      const newItems = [...items];
      newItems[index].serviceId = serviceId;
      newItems[index].description = service.name;
      newItems[index].unitPrice = Number(service.price) || 0;
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
      setItems(newItems);
      form.setValue('items', newItems);
      
      // Update total invoice amount
      const totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      form.setValue('amount', totalAmount);
    }
  };

  const addItem = () => {
    const newItems = [...items, {
      appointmentId: "",
      serviceId: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    }];
    setItems(newItems);
    form.setValue('items', newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      form.setValue('items', newItems);
      
      // Update total invoice amount
      const totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      form.setValue('amount', totalAmount);
    }
  };

  const onSubmit = (data: z.infer<typeof invoiceFormSchema>) => {
    createInvoiceMutation.mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-billing">
        <DialogHeader>
          <DialogTitle data-testid="text-billing-modal-title">
            {invoice ? "Editar Factura" : "Nueva Factura"}
          </DialogTitle>
          <DialogDescription>
            {invoice ? "Modifica los detalles de la factura" : "Crea una nueva factura para el cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-invoice-client">
                          <SelectValue placeholder="Seleccionar cliente..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientsLoading ? (
                          <SelectItem value="loading" disabled>Cargando clientes...</SelectItem>
                        ) : clients?.map((client: any) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.firstName} {client.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Vencimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-invoice-due-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Items de la Factura</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  data-testid="button-add-item"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Item
                </Button>
              </div>

              {items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-3">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Cita Completada
                        </label>
                        <Select
                          value={item.appointmentId}
                          onValueChange={(value) => selectAppointment(index, value)}
                          disabled={!selectedClientId}
                        >
                          <SelectTrigger data-testid={`select-appointment-${index}`}>
                            <SelectValue placeholder="Seleccionar cita..." />
                          </SelectTrigger>
                          <SelectContent>
                            {!selectedClientId ? (
                              <SelectItem value="no-client" disabled>
                                Primero selecciona un cliente
                              </SelectItem>
                            ) : clientAppointments.length === 0 ? (
                              <SelectItem value="no-appointments" disabled>
                                No hay citas completadas
                              </SelectItem>
                            ) : (
                              clientAppointments.map((apt: any) => (
                                <SelectItem key={apt.id} value={apt.id}>
                                  {apt.service?.name} - {apt.dog?.name} (${Number(apt.price).toLocaleString()})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          O Servicio Manual
                        </label>
                        <Select
                          value={item.serviceId}
                          onValueChange={(value) => selectService(index, value)}
                        >
                          <SelectTrigger data-testid={`select-service-${index}`}>
                            <SelectValue placeholder="Seleccionar servicio..." />
                          </SelectTrigger>
                          <SelectContent>
                            {servicesLoading ? (
                              <SelectItem value="loading" disabled>Cargando servicios...</SelectItem>
                            ) : services?.map((service: any) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - ${Number(service.price).toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Descripción
                        </label>
                        <Input
                          placeholder="Descripción del item"
                          value={item.description}
                          onChange={(e) => updateItemDescription(index, e.target.value)}
                          data-testid={`input-item-description-${index}`}
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Cantidad
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemPrice(index, 'quantity', parseInt(e.target.value) || 1)}
                          data-testid={`input-item-quantity-${index}`}
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Precio
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItemPrice(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          data-testid={`input-item-price-${index}`}
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Total
                        </label>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" data-testid={`item-total-${index}`}>
                            ${item.totalPrice.toLocaleString()}
                          </Badge>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              data-testid={`button-remove-item-${index}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Total Amount */}
              <div className="flex items-center justify-end space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold text-foreground">Total:</span>
                  <Badge variant="default" className="text-lg px-3 py-1" data-testid="invoice-total">
                    ${totalAmount.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-invoice-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="sent">Enviada</SelectItem>
                        <SelectItem value="paid">Pagada</SelectItem>
                        <SelectItem value="overdue">Vencida</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div></div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales para la factura..."
                      rows={3}
                      {...field}
                      data-testid="textarea-invoice-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={createInvoiceMutation.isPending}
                data-testid="button-save-invoice"
              >
                {createInvoiceMutation.isPending ? "Guardando..." : (invoice ? "Actualizar Factura" : "Crear Factura")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-testid="button-cancel-invoice"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
