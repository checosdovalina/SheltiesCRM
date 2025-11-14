import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ProtocolModal } from "@/components/protocol-modal";
import type { Protocol } from "@shared/schema";
import { Plus, FileText, Search, Edit, Trash2, Clock, Target, CheckCircle2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Protocols() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [protocolToDelete, setProtocolToDelete] = useState<Protocol | null>(null);

  const { data: protocols = [], isLoading } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (protocol: Protocol) => 
      apiRequest(`/api/protocols/${protocol.id}`, "PUT", { isActive: !protocol.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({
        title: "Estado actualizado",
        description: "El estado del protocolo se ha actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del protocolo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/protocols/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({
        title: "Protocolo eliminado",
        description: "El protocolo se ha eliminado correctamente",
      });
      setProtocolToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el protocolo",
        variant: "destructive",
      });
    },
  });

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || protocol.category === selectedCategory;
    const matchesActive = !showActiveOnly || protocol.isActive;
    return matchesSearch && matchesCategory && matchesActive;
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      obediencia_basica: "Obediencia Básica",
      comportamiento: "Comportamiento",
      socializacion: "Socialización",
      agilidad: "Agilidad",
      terapia: "Terapia",
      rescate: "Rescate",
      otro: "Otro",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      obediencia_basica: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      comportamiento: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
      socializacion: "bg-green-500/10 text-green-700 dark:text-green-300",
      agilidad: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
      terapia: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
      rescate: "bg-red-500/10 text-red-700 dark:text-red-300",
      otro: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
    };
    return colors[category] || colors.otro;
  };

  const handleEdit = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProtocol(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProtocol(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Gestión de Protocolos
            </h1>
            <p className="text-muted-foreground mt-1">
              Crea y gestiona protocolos de entrenamiento para diferentes objetivos
            </p>
          </div>
          <Button onClick={handleCreate} data-testid="button-create-protocol">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Protocolo
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar protocolos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-protocols"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-filter-category">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="obediencia_basica">Obediencia Básica</SelectItem>
              <SelectItem value="comportamiento">Comportamiento</SelectItem>
              <SelectItem value="socializacion">Socialización</SelectItem>
              <SelectItem value="agilidad">Agilidad</SelectItem>
              <SelectItem value="terapia">Terapia</SelectItem>
              <SelectItem value="rescate">Rescate</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 bg-muted/50 px-4 rounded-md">
            <Switch
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
              data-testid="switch-active-only"
            />
            <span className="text-sm whitespace-nowrap">Solo activos</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProtocols.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {searchTerm || selectedCategory !== "all" || showActiveOnly
                  ? "No se encontraron protocolos con los filtros aplicados"
                  : "No hay protocolos registrados. ¡Crea el primero!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProtocols.map((protocol) => (
              <Card key={protocol.id} className={protocol.isActive ? "" : "opacity-60"}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {protocol.name}
                        {protocol.isActive ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <Badge className={getCategoryColor(protocol.category)} variant="secondary">
                          {getCategoryLabel(protocol.category)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {protocol.objectives && (
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {protocol.objectives}
                      </p>
                    </div>
                  )}
                  {protocol.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{protocol.duration}</p>
                    </div>
                  )}
                  {protocol.steps && Array.isArray(protocol.steps) && (
                    <div>
                      <p className="text-sm font-medium mb-1">Pasos del protocolo:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {(protocol.steps as Array<{ title: string }>).slice(0, 3).map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary font-semibold">{idx + 1}.</span>
                            <span className="line-clamp-1">{step.title}</span>
                          </li>
                        ))}
                        {protocol.steps.length > 3 && (
                          <li className="text-xs text-muted-foreground italic">
                            +{protocol.steps.length - 3} pasos más...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(protocol)}
                      data-testid={`button-edit-${protocol.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate(protocol)}
                      disabled={toggleActiveMutation.isPending}
                      data-testid={`button-toggle-${protocol.id}`}
                    >
                      {protocol.isActive ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProtocolToDelete(protocol)}
                      className="text-destructive hover:text-destructive ml-auto"
                      data-testid={`button-delete-${protocol.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProtocolModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        protocol={selectedProtocol}
      />

      <AlertDialog open={!!protocolToDelete} onOpenChange={() => setProtocolToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar protocolo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el protocolo "{protocolToDelete?.name}".
              Los protocolos asignados a citas existentes no se verán afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => protocolToDelete && deleteMutation.mutate(protocolToDelete.id)}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
