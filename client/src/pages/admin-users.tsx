import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Users, UserCheck, UserX, Edit } from "lucide-react";
import type { User } from "@shared/schema";

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function AdminUsers() {
  const [isCreating, setIsCreating] = useState(false);
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    email: "",
    firstName: "",
    lastName: "",
    role: "client"
  });

  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsCreating(false);
      setCreateUserData({ email: "", firstName: "", lastName: "", role: "client" });
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el usuario.",
        variant: "destructive",
      });
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update role');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado.",
      });
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el rol.",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createUserData.email || !createUserData.firstName || !createUserData.lastName) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(createUserData);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'teacher': return 'secondary';
      case 'client': return 'default';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'teacher': return 'Profesor';
      case 'client': return 'Cliente';
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <div className="page-content">
        <div className="mobile-container">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="mobile-container">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Gestión de Usuarios
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra usuarios del sistema, asigna roles y permisos.
          </p>
        </div>

        {/* Create User Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Crear Nuevo Usuario</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isCreating ? (
              <Button 
                onClick={() => setIsCreating(true)}
                className="w-full md:w-auto"
                data-testid="button-create-user"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Usuario
              </Button>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={createUserData.email}
                      onChange={(e) => setCreateUserData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="usuario@ejemplo.com"
                      required
                      className="mobile-form-input"
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol *</Label>
                    <Select 
                      value={createUserData.role} 
                      onValueChange={(value) => setCreateUserData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger className="mobile-form-input" data-testid="select-role">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="teacher">Profesor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={createUserData.firstName}
                      onChange={(e) => setCreateUserData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Juan"
                      required
                      className="mobile-form-input"
                      data-testid="input-firstName"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={createUserData.lastName}
                      onChange={(e) => setCreateUserData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Pérez"
                      required
                      className="mobile-form-input"
                      data-testid="input-lastName"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    disabled={createUserMutation.isPending}
                    className="mobile-btn"
                    data-testid="button-submit-user"
                  >
                    {createUserMutation.isPending ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreating(false);
                      setCreateUserData({ email: "", firstName: "", lastName: "", role: "client" });
                    }}
                    className="mobile-btn"
                    data-testid="button-cancel-user"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5" />
              <span>Usuarios del Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role || 'client')}>
                          {getRoleLabel(user.role || 'client')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={user.role || 'client'}
                          onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <Edit className="w-3 h-3 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Cliente</SelectItem>
                            <SelectItem value="teacher">Profesor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No hay usuarios registrados</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}