import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Plus, Mail, Phone, MapPin, Edit, Trash2, Dog } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import ClientModal from "@/components/client-modal";
import DogModal from "@/components/dog-modal";
import { apiRequest } from "@/lib/queryClient";

export default function Clients() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [showDogModal, setShowDogModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editingDog, setEditingDog] = useState<any>(null);

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

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Get dogs count for each client
  const { data: dogsData } = useQuery({
    queryKey: ["/api/clients-with-dogs"],
    queryFn: async () => {
      if (!clients || clients.length === 0) return {};
      const dogsCount: Record<string, number> = {};
      
      await Promise.all(
        clients.map(async (client: any) => {
          try {
            const response = await fetch(`/api/clients/${client.id}/dogs`, {
              credentials: "include",
            });
            if (response.ok) {
              const dogs = await response.json();
              dogsCount[client.id] = dogs.length;
            } else {
              dogsCount[client.id] = 0;
            }
          } catch {
            dogsCount[client.id] = 0;
          }
        })
      );
      
      return dogsCount;
    },
    enabled: !!clients && clients.length > 0,
    retry: false,
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      await apiRequest("DELETE", `/api/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente.",
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
        description: "No se pudo eliminar el cliente.",
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

  const filteredClients = Array.isArray(clients) 
    ? clients.filter((client: any) => 
        client.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setShowClientModal(true);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${clientName}?`)) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const handleModalClose = () => {
    setShowClientModal(false);
    setEditingClient(null);
  };

  const handleAddPet = (client: any) => {
    setSelectedClient(client);
    setEditingDog(null);
    setShowDogModal(true);
  };

  const handleDogModalClose = () => {
    setShowDogModal(false);
    setSelectedClient(null);
    setEditingDog(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground" data-testid="text-clients-title">Clientes</h2>
          <p className="text-muted-foreground">Gestiona tu base de clientes y sus mascotas</p>
        </div>
        <Button 
          onClick={() => setShowClientModal(true)}
          data-testid="button-add-client"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar clientes por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-clients"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientsLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredClients.length > 0 ? (
          filteredClients.map((client: any) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow" data-testid={`client-card-${client.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {client.firstName?.[0]}{client.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg" data-testid={`client-name-${client.id}`}>
                        {client.firstName} {client.lastName}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Cliente Activo
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClient(client)}
                      data-testid={`button-edit-${client.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id, `${client.firstName} ${client.lastName}`)}
                      data-testid={`button-delete-${client.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.email && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span data-testid={`client-email-${client.id}`}>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span data-testid={`client-phone-${client.id}`}>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="break-words" data-testid={`client-address-${client.id}`}>
                      {client.address}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Mascotas registradas:</span>
                    <Badge variant="secondary">
                      {dogsData?.[client.id] || 0}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddPet(client)}
                    data-testid={`button-add-pet-${client.id}`}
                  >
                    <Dog className="w-4 h-4 mr-2" />
                    Agregar Mascota
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-clients">
                  {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Intenta buscar con otros términos"
                    : "Comienza agregando tu primer cliente"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowClientModal(true)} data-testid="button-first-client">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Cliente
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Client Modal */}
      <ClientModal 
        open={showClientModal} 
        onOpenChange={handleModalClose}
        client={editingClient}
      />
      
      {/* Dog Modal */}
      {selectedClient && (
        <DogModal
          open={showDogModal}
          onOpenChange={handleDogModalClose}
          clientId={selectedClient.id}
          clientName={`${selectedClient.firstName} ${selectedClient.lastName}`}
          dog={editingDog}
        />
      )}
    </div>
  );
}
