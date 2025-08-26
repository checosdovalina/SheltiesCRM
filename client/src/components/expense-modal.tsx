import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertExpenseSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const expenseFormSchema = insertExpenseSchema.extend({
  expenseDate: z.string().min(1, "La fecha es requerida"),
  amount: z.string().min(1, "El monto es requerido").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "El monto debe ser un número mayor a 0",
  }),
});

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: any;
}

export default function ExpenseModal({ open, onOpenChange, expense }: ExpenseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: "other",
      description: "",
      amount: "",
      expenseDate: "",
      receipt: "",
    },
  });

  // Reset form when expense changes or modal opens/closes
  useEffect(() => {
    if (open) {
      if (expense) {
        const expenseDate = new Date(expense.expenseDate).toISOString().split('T')[0];
        form.reset({
          category: expense.category || "other",
          description: expense.description || "",
          amount: expense.amount?.toString() || "",
          expenseDate: expenseDate,
          receipt: expense.receipt || "",
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        form.reset({
          category: "other",
          description: "",
          amount: "",
          expenseDate: today,
          receipt: "",
        });
      }
    }
  }, [expense, open, form]);

  const createExpenseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof expenseFormSchema>) => {
      const { expenseDate, amount, ...rest } = data;
      
      const expenseData = {
        ...rest,
        amount: parseFloat(amount),
        expenseDate: new Date(expenseDate).toISOString(),
      };

      const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses";
      const method = expense ? "PUT" : "POST";
      const response = await apiRequest(method, url, expenseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/financial"] });
      
      toast({
        title: expense ? "Gasto actualizado" : "Gasto registrado",
        description: expense ? "El gasto ha sido actualizado exitosamente." : "El nuevo gasto ha sido registrado exitosamente.",
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
        description: expense ? "No se pudo actualizar el gasto." : "No se pudo registrar el gasto.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof expenseFormSchema>) => {
    createExpenseMutation.mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'supplies': return 'Suministros';
      case 'utilities': return 'Servicios Públicos';
      case 'salaries': return 'Salarios';
      case 'rent': return 'Alquiler';
      case 'marketing': return 'Marketing';
      case 'maintenance': return 'Mantenimiento';
      case 'other': return 'Otros';
      default: return category;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid="modal-expense">
        <DialogHeader>
          <DialogTitle data-testid="text-expense-modal-title">
            {expense ? "Editar Gasto" : "Registrar Gasto"}
          </DialogTitle>
          <DialogDescription>
            {expense ? "Modifica los detalles del gasto" : "Registra un nuevo gasto en el sistema"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-expense-category">
                        <SelectValue placeholder="Seleccionar categoría..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="supplies">Suministros</SelectItem>
                      <SelectItem value="utilities">Servicios Públicos</SelectItem>
                      <SelectItem value="salaries">Salarios</SelectItem>
                      <SelectItem value="rent">Alquiler</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="other">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descripción detallada del gasto"
                      {...field}
                      data-testid="input-expense-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        data-testid="input-expense-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-expense-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="receipt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recibo/Comprobante (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="URL o ruta del comprobante"
                      {...field}
                      data-testid="input-expense-receipt"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview of expense details */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium text-foreground">Resumen del Gasto</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="ml-2 text-foreground" data-testid="preview-category">
                    {getCategoryLabel(form.watch("category"))}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Monto:</span>
                  <span className="ml-2 font-semibold text-foreground" data-testid="preview-amount">
                    ${form.watch("amount") ? Number(form.watch("amount")).toLocaleString() : "0"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="ml-2 text-foreground" data-testid="preview-date">
                    {form.watch("expenseDate") ? 
                      new Date(form.watch("expenseDate")).toLocaleDateString('es-ES') : 
                      "No seleccionada"
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={createExpenseMutation.isPending}
                data-testid="button-save-expense"
              >
                {createExpenseMutation.isPending ? "Guardando..." : (expense ? "Actualizar Gasto" : "Registrar Gasto")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-testid="button-cancel-expense"
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
