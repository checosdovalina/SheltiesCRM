import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText, 
  Dog, 
  Calendar, 
  User, 
  Activity,
  Stethoscope,
  BookOpen,
  Camera
} from "lucide-react";
import { Link } from "wouter";

export default function Records() {
  const [searchTerm, setSearchTerm] = useState("");

  // Get all clients with their dogs
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients-with-dogs"],
  });

  // Filter dogs based on search term
  const filteredDogs = (clients || [])?.flatMap((client: any) => 
    client.dogs?.map((dog: any) => ({
      ...dog,
      clientName: `${client.firstName} ${client.lastName}`,
      clientEmail: client.email,
      clientPhone: client.phone,
    })) || []
  ).filter((dog: any) => 
    dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dog.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dog.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (clientsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expedientes</h1>
            <p className="text-muted-foreground">Gestiona los expedientes médicos y de entrenamiento</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expedientes</h1>
          <p className="text-muted-foreground">Gestiona los expedientes médicos y de entrenamiento</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por mascota, dueño o raza..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-records"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Dog className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{filteredDogs.length}</p>
                <p className="text-sm text-muted-foreground">Mascotas Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">-</p>
                <p className="text-sm text-muted-foreground">Registros Médicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">-</p>
                <p className="text-sm text-muted-foreground">Entrenamientos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">-</p>
                <p className="text-sm text-muted-foreground">Evidencias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDogs.length > 0 ? (
          filteredDogs.map((dog: any) => (
            <Card key={dog.id} className="hover:shadow-lg transition-shadow" data-testid={`dog-record-card-${dog.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  {/* Dog Avatar */}
                  <div className="relative">
                    {dog.imageUrl ? (
                      <img
                        src={dog.imageUrl}
                        alt={dog.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Dog className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">
                        {dog.name[0]?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground mb-1" data-testid={`dog-name-${dog.id}`}>
                      {dog.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground" data-testid={`dog-owner-${dog.id}`}>
                        {dog.clientName}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dog.breed && (
                        <Badge variant="outline" className="text-xs">
                          {dog.breed}
                        </Badge>
                      )}
                      {dog.age && (
                        <Badge variant="outline" className="text-xs">
                          {dog.age} años
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <span className="text-muted-foreground">Activo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground">Registrado</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Link href={`/records/${dog.id}`}>
                    <Button className="w-full" size="sm" data-testid={`button-view-record-${dog.id}`}>
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Expediente
                    </Button>
                  </Link>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/records/${dog.id}?tab=medical`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Stethoscope className="w-3 h-3 mr-1" />
                        Médico
                      </Button>
                    </Link>
                    <Link href={`/records/${dog.id}?tab=training`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Entrenamiento
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Notes Preview */}
                {dog.notes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`dog-notes-${dog.id}`}>
                      <strong>Notas:</strong> {dog.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Dog className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-dogs">
                  {searchTerm ? "No se encontraron mascotas" : "No hay mascotas registradas"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Intenta ajustar los términos de búsqueda"
                    : "Las mascotas aparecerán aquí una vez que se registren clientes con mascotas"
                  }
                </p>
                {!searchTerm && (
                  <Link href="/clients">
                    <Button>
                      <User className="w-4 h-4 mr-2" />
                      Gestionar Clientes
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}