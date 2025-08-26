import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Search, Plus, FileText, Mail, Filter, Eye } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import BillingModal from "@/components/billing-modal";
import { apiRequest } from "@/lib/queryClient";

export default function Billing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showBillingModal, setShowBillingModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "No autorizado",
        description: "Iniciando sesión nuevamente...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"],
    enabled: isAuthenticated,
    retry: false,
  });

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/invoices/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Factura actualizada",
        description: "El estado de la factura ha sido actualizado exitosamente.",
      });
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
        description: "No se pudo actualizar la factura.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const filteredInvoices = invoices?.filter((invoice: any) => {
    const matchesSearch = 
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-accent/10 text-accent border-accent/20';
      case 'sent': return 'bg-primary/10 text-primary border-primary/20';
      case 'draft': return 'bg-muted text-muted-foreground border-muted';
      case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled': return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'sent': return 'Enviada';
      case 'draft': return 'Borrador';
      case 'overdue': return 'Vencida';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const handleStatusUpdate = (invoiceId: string, newStatus: string) => {
    updateInvoiceStatusMutation.mutate({
      id: invoiceId,
      status: newStatus
    });
  };

  const handleSendInvoice = (invoice: any) => {
    // Mock email sending functionality
    toast({
      title: "Factura enviada",
      description: `La factura ${invoice.invoiceNumber} ha sido enviada por correo electrónico a ${invoice.client?.email}.`,
    });
    
    // Update status to sent
    handleStatusUpdate(invoice.id, 'sent');
  };

  const sortedInvoices = [...filteredInvoices].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalRevenue = invoices?.reduce((sum: number, invoice: any) => 
    invoice.status === 'paid' ? sum + Number(invoice.amount) : sum, 0) || 0;

  const pendingRevenue = invoices?.reduce((sum: number, invoice: any) => 
    invoice.status === 'sent' ? sum + Number(invoice.amount) : sum, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground" data-testid="text-billing-title">
            Facturación
          </h2>
          <p className="text-muted-foreground">Gestiona facturas y cobros a clientes</p>
        </div>
        <Button 
          onClick={() => setShowBillingModal(true)}
          data-testid="button-create-invoice"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Cobrados</p>
                <p className="text-2xl font-bold text-accent" data-testid="metric-total-revenue">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendiente de Cobro</p>
                <p className="text-2xl font-bold text-primary" data-testid="metric-pending-revenue">
                  ${pendingRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Facturas Totales</p>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-total-invoices">
                  {invoices?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por número de factura o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-invoices"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="sent">Enviada</SelectItem>
            <SelectItem value="paid">Pagada</SelectItem>
            <SelectItem value="overdue">Vencida</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {invoicesLoading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-6 bg-muted rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : sortedInvoices.length > 0 ? (
          sortedInvoices.map((invoice: any) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow" data-testid={`invoice-card-${invoice.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Invoice Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground" data-testid={`invoice-number-${invoice.id}`}>
                          {invoice.invoiceNumber}
                        </h3>
                        <Badge variant="outline" className={getStatusColor(invoice.status)}>
                          {getStatusText(invoice.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`invoice-client-${invoice.id}`}>
                        {invoice.client?.firstName} {invoice.client?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fecha: {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                      </p>
                      {invoice.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Vence: {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground" data-testid={`invoice-amount-${invoice.id}`}>
                        ${Number(invoice.amount).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-view-${invoice.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {(invoice.status === 'draft' || invoice.status === 'sent') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendInvoice(invoice)}
                          data-testid={`button-send-${invoice.id}`}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          {invoice.status === 'draft' ? 'Enviar' : 'Reenviar'}
                        </Button>
                      )}
                      
                      <Select
                        value={invoice.status}
                        onValueChange={(value) => handleStatusUpdate(invoice.id, value)}
                      >
                        <SelectTrigger className="w-[120px]" data-testid={`select-status-${invoice.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="sent">Enviada</SelectItem>
                          <SelectItem value="paid">Pagada</SelectItem>
                          <SelectItem value="overdue">Vencida</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-invoices">
                {searchTerm || statusFilter !== "all" 
                  ? "No se encontraron facturas" 
                  : "No hay facturas creadas"
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primera factura"
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setShowBillingModal(true)} data-testid="button-first-invoice">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Factura
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Billing Modal */}
      <BillingModal 
        open={showBillingModal} 
        onOpenChange={setShowBillingModal}
      />
    </div>
  );
}
