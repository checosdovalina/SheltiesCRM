import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, Edit, Trash2, Package, AlertTriangle, Clock, CheckCircle, 
  XCircle, Eye, Calendar, DollarSign, Users, Play, Zap, GraduationCap, Dog as DogIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const packageSchema = z.object({
  clientId: z.string().min(1, "Selecciona un cliente"),
  dogId: z.string().optional(),
  serviceId: z.string().optional(),
  packageName: z.string().min(1, "El nombre del paquete es requerido"),
  totalSessions: z.string().min(1, "Las sesiones totales son requeridas").regex(/^\d+$/, "Debe ser un número"),
  price: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

type PackageFormData = z.infer<typeof packageSchema>;

const sessionSchema = z.object({
  clientId: z.string().min(1, "Selecciona un cliente"),
  dogId: z.string().optional(),
  sessionDate: z.string().min(1, "La fecha es requerida"),
  sessionType: z.string().optional(),
  notes: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: "Activo", color: "bg-green-500", icon: CheckCircle },
  finishing: { label: "Por terminar", color: "bg-yellow-500", icon: AlertTriangle },
  completed: { label: "Completado", color: "bg-blue-500", icon: CheckCircle },
  expired: { label: "Expirado", color: "bg-red-500", icon: XCircle },
};

export default function Packages() {
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const { toast } = useToast();

  const { data: packages, isLoading } = useQuery<any[]>({
    queryKey: ["/api/packages"],
  });

  const { data: clients } = useQuery<any[]>({
    queryKey: ["/api/clients"],
  });

  const { data: services } = useQuery<any[]>({
    queryKey: ["/api/services"],
  });

  const { data: metrics } = useQuery<any>({
    queryKey: ["/api/packages", "dashboard", "metrics"],
  });

  const { data: packageTemplates } = useQuery<any[]>({
    queryKey: ["/api/package-templates/active"],
  });

  const { data: packageSessions } = useQuery<any[]>({
    queryKey: ["/api/packages", selectedPackage?.id, "sessions"],
    enabled: !!selectedPackage?.id,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const packageForm = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      clientId: "",
      dogId: "",
      serviceId: "",
      packageName: "",
      totalSessions: "",
      price: "",
      expiryDate: "",
      notes: "",
    },
  });

  const sessionForm = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      clientId: "",
      dogId: "",
      sessionDate: new Date().toISOString().split('T')[0],
      sessionType: "",
      notes: "",
    },
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      const packageData = {
        clientId: data.clientId,
        dogId: data.dogId || null,
        serviceId: data.serviceId || null,
        packageName: data.packageName,
        totalSessions: parseInt(data.totalSessions),
        usedSessions: 0,
        remainingSessions: parseInt(data.totalSessions),
        price: data.price ? parseFloat(data.price) : null,
        expiryDate: data.expiryDate || null,
        status: 'active',
        notes: data.notes || null,
      };
      
      const url = editingPackage ? `/api/packages/${editingPackage.id}` : "/api/packages";
      const method = editingPackage ? "PUT" : "POST";
      const response = await apiRequest(method, url, packageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: editingPackage ? "Paquete actualizado" : "Paquete creado",
        description: editingPackage ? "El paquete ha sido actualizado." : "El nuevo paquete ha sido creado.",
      });
      handleClosePackageModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar el paquete.",
        variant: "destructive",
      });
    },
  });

  const consumeSessionMutation = useMutation({
    mutationFn: async (data: SessionFormData) => {
      const sessionData = {
        clientId: data.clientId,
        dogId: data.dogId || null,
        sessionDate: data.sessionDate,
        sessionType: data.sessionType || null,
        notes: data.notes || null,
        status: 'attended',
      };
      
      const response = await apiRequest("POST", `/api/packages/${selectedPackage.id}/consume`, sessionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/packages", selectedPackage?.id, "sessions"] });
      toast({
        title: "Sesión registrada",
        description: "La sesión ha sido consumida del paquete.",
      });
      handleCloseSessionModal();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar la sesión.",
        variant: "destructive",
      });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (packageId: string) => {
      await apiRequest("DELETE", `/api/packages/${packageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: "Paquete eliminado",
        description: "El paquete ha sido eliminado.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el paquete.",
        variant: "destructive",
      });
    },
  });

  const handleClosePackageModal = () => {
    setShowPackageModal(false);
    setEditingPackage(null);
    packageForm.reset();
  };

  const handleCloseSessionModal = () => {
    setShowSessionModal(false);
    sessionForm.reset();
  };

  const handleEditPackage = (pkg: any) => {
    setEditingPackage(pkg);
    packageForm.reset({
      clientId: pkg.clientId,
      dogId: pkg.dogId || "",
      serviceId: pkg.serviceId || "",
      packageName: pkg.packageName,
      totalSessions: pkg.totalSessions.toString(),
      price: pkg.price ? pkg.price.toString() : "",
      expiryDate: pkg.expiryDate ? new Date(pkg.expiryDate).toISOString().split('T')[0] : "",
      notes: pkg.notes || "",
    });
    setShowPackageModal(true);
  };

  const handleViewPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowDetailModal(true);
  };

  const handleConsumeSession = (pkg: any) => {
    setSelectedPackage(pkg);
    sessionForm.reset({
      clientId: pkg.clientId,
      dogId: pkg.dogId || "",
      sessionDate: new Date().toISOString().split('T')[0],
      sessionType: "",
      notes: "",
    });
    setShowSessionModal(true);
  };

  const handleDeletePackage = (packageId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este paquete?")) {
      deletePackageMutation.mutate(packageId);
    }
  };

  const getClientDogs = (clientId: string) => {
    const client = clients?.find((c: any) => c.id === clientId);
    return client?.dogs || [];
  };

  const onSubmitPackage = (data: PackageFormData) => {
    createPackageMutation.mutate(data);
  };

  const onSubmitSession = (data: SessionFormData) => {
    consumeSessionMutation.mutate(data);
  };

  const getProgressColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage <= 20) return "bg-red-500";
    if (percentage <= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-muted-foreground">Cargando paquetes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
            Gestión de Paquetes
          </h1>
          <p className="text-muted-foreground mt-1">
            Control de sesiones y paquetes de servicios
          </p>
        </div>
        <Button 
          onClick={() => setShowPackageModal(true)}
          className="flex items-center gap-2"
          data-testid="button-new-package"
        >
          <Plus className="w-4 h-4" />
          Nuevo Paquete
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paquetes Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activePackages || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Terminar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.finishingPackages || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.completedPackages || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.expiredPackages || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Todos los Paquetes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {packages && packages.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Mascota</TableHead>
                    <TableHead>Sesiones</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg: any) => {
                    const StatusIcon = statusLabels[pkg.status]?.icon || Package;
                    const progressPercentage = pkg.totalSessions > 0 
                      ? ((pkg.totalSessions - pkg.remainingSessions) / pkg.totalSessions) * 100 
                      : 0;
                    
                    return (
                      <TableRow key={pkg.id} data-testid={`row-package-${pkg.id}`}>
                        <TableCell>
                          <div className="font-medium">
                            {pkg.client?.firstName} {pkg.client?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{pkg.client?.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{pkg.packageName}</div>
                          {pkg.service && (
                            <div className="text-sm text-muted-foreground">{pkg.service.name}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {pkg.dog ? (
                            <div className="font-medium">{pkg.dog.name}</div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {pkg.remainingSessions} / {pkg.totalSessions}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Usadas: {pkg.usedSessions}
                          </div>
                        </TableCell>
                        <TableCell className="w-32">
                          <Progress 
                            value={progressPercentage} 
                            className={`h-2 ${getProgressColor(pkg.remainingSessions, pkg.totalSessions)}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusLabels[pkg.status]?.color || 'bg-gray-500'} text-white`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusLabels[pkg.status]?.label || pkg.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {pkg.expiryDate ? (
                            <div className="text-sm">
                              {format(new Date(pkg.expiryDate), 'dd/MM/yyyy', { locale: es })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sin fecha</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {(pkg.status === 'active' || pkg.status === 'finishing') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleConsumeSession(pkg)}
                                title="Consumir sesión"
                                data-testid={`button-consume-${pkg.id}`}
                              >
                                <Play className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewPackage(pkg)}
                              title="Ver detalles"
                              data-testid={`button-view-${pkg.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPackage(pkg)}
                              title="Editar"
                              data-testid={`button-edit-${pkg.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePackage(pkg.id)}
                              title="Eliminar"
                              data-testid={`button-delete-${pkg.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay paquetes</h3>
              <p className="text-muted-foreground mb-4">
                Crea el primer paquete de sesiones para tus clientes
              </p>
              <Button onClick={() => setShowPackageModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Paquete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Package Modal */}
      <Dialog open={showPackageModal} onOpenChange={(open) => {
        setShowPackageModal(open);
        if (!open) setSelectedTemplate(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Editar Paquete" : "Nuevo Paquete"}
            </DialogTitle>
          </DialogHeader>

          {/* Template Selection Section */}
          {!editingPackage && packageTemplates && packageTemplates.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Seleccionar Plantilla (Opcional)
              </h4>
              <ScrollArea className="h-48 border rounded-lg p-3">
                <div className="grid grid-cols-1 gap-2">
                  {packageTemplates.map((template: any) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary hover:bg-primary/5 ${
                        selectedTemplate?.id === template.id ? 'border-primary bg-primary/10' : ''
                      }`}
                      onClick={() => {
                        setSelectedTemplate(template);
                        const totalSessions = (template.sessionsIncluded || 0) + (template.bonusSessions || 0);
                        packageForm.setValue('packageName', template.name);
                        packageForm.setValue('totalSessions', totalSessions.toString());
                        packageForm.setValue('price', template.price?.toString() || '');
                        if (template.validityDays) {
                          const expiryDate = new Date();
                          expiryDate.setDate(expiryDate.getDate() + template.validityDays);
                          packageForm.setValue('expiryDate', expiryDate.toISOString().split('T')[0]);
                        }
                        packageForm.setValue('notes', template.description || '');
                      }}
                      data-testid={`template-${template.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{template.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {template.category === 'clases' && <GraduationCap className="w-3 h-3 mr-1" />}
                            {template.category === 'kinder' && <DogIcon className="w-3 h-3 mr-1" />}
                            {template.category === 'extension' && <Plus className="w-3 h-3 mr-1" />}
                            {template.category === 'clases' ? 'Clases' : 
                             template.category === 'kinder' ? 'Kínder' : 'Extensión'}
                          </Badge>
                        </div>
                        <span className="font-bold text-primary">${Number(template.price).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{template.sessionsIncluded} sesiones</span>
                        {template.bonusSessions > 0 && (
                          <span className="text-green-600">+{template.bonusSessions} bonus</span>
                        )}
                        {template.validityDays && (
                          <span>{template.validityDays} días</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {selectedTemplate && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedTemplate(null);
                    packageForm.reset();
                  }}
                  className="mt-2"
                >
                  Limpiar selección
                </Button>
              )}
            </div>
          )}

          <Form {...packageForm}>
            <form onSubmit={packageForm.handleSubmit(onSubmitPackage)} className="space-y-4">
              <FormField
                control={packageForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-client">
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client: any) => (
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

              {packageForm.watch("clientId") && getClientDogs(packageForm.watch("clientId")).length > 0 && (
                <FormField
                  control={packageForm.control}
                  name="dogId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mascota</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-dog">
                            <SelectValue placeholder="Selecciona una mascota (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getClientDogs(packageForm.watch("clientId")).map((dog: any) => (
                            <SelectItem key={dog.id} value={dog.id}>
                              {dog.name}
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
                control={packageForm.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servicio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-service">
                          <SelectValue placeholder="Selecciona un servicio (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services?.map((service: any) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={packageForm.control}
                name="packageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Paquete *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Paquete 10 sesiones" 
                        {...field} 
                        data-testid="input-package-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={packageForm.control}
                  name="totalSessions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total de Sesiones *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          {...field} 
                          data-testid="input-total-sessions"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={packageForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={packageForm.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Expiración</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-expiry-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={packageForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notas adicionales..." 
                        {...field} 
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClosePackageModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPackageMutation.isPending}>
                  {createPackageMutation.isPending ? "Guardando..." : (editingPackage ? "Actualizar" : "Crear Paquete")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Consume Session Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Sesión Consumida</DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="font-medium">{selectedPackage.packageName}</div>
              <div className="text-sm text-muted-foreground">
                {selectedPackage.client?.firstName} {selectedPackage.client?.lastName}
              </div>
              <div className="text-sm font-medium text-primary mt-1">
                Sesiones restantes: {selectedPackage.remainingSessions} / {selectedPackage.totalSessions}
              </div>
            </div>
          )}
          <Form {...sessionForm}>
            <form onSubmit={sessionForm.handleSubmit(onSubmitSession)} className="space-y-4">
              <FormField
                control={sessionForm.control}
                name="sessionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de la Sesión *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-session-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sessionForm.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Sesión</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-session-type">
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="training">Entrenamiento</SelectItem>
                        <SelectItem value="evaluation">Evaluación</SelectItem>
                        <SelectItem value="follow-up">Seguimiento</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sessionForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observaciones de la sesión..." 
                        {...field} 
                        data-testid="input-session-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseSessionModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={consumeSessionMutation.isPending}>
                  {consumeSessionMutation.isPending ? "Registrando..." : "Registrar Sesión"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Package Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Paquete</DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                  <p className="font-medium">
                    {selectedPackage.client?.firstName} {selectedPackage.client?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paquete</label>
                  <p className="font-medium">{selectedPackage.packageName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mascota</label>
                  <p className="font-medium">{selectedPackage.dog?.name || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <Badge className={`${statusLabels[selectedPackage.status]?.color || 'bg-gray-500'} text-white mt-1`}>
                    {statusLabels[selectedPackage.status]?.label || selectedPackage.status}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Progreso de Sesiones</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedPackage.usedSessions} de {selectedPackage.totalSessions} usadas
                  </span>
                </div>
                <Progress 
                  value={(selectedPackage.usedSessions / selectedPackage.totalSessions) * 100} 
                  className="h-3"
                />
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-green-600">Restantes: {selectedPackage.remainingSessions}</span>
                  {selectedPackage.expiryDate && (
                    <span className="text-muted-foreground">
                      Expira: {format(new Date(selectedPackage.expiryDate), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Historial de Sesiones</h4>
                {packageSessions && packageSessions.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {packageSessions.map((session: any) => (
                      <div key={session.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            {format(new Date(session.sessionDate), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </div>
                          {session.sessionType && (
                            <div className="text-sm text-muted-foreground">{session.sessionType}</div>
                          )}
                        </div>
                        <Badge variant="outline">{session.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay sesiones registradas
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
