import { useState, useCallback, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PetType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PetTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const PetTypeSelector = memo(function PetTypeSelector({ 
  value, 
  onValueChange, 
  placeholder = "Selecciona tipo de mascota" 
}: PetTypeSelectorProps) {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: petTypes, isLoading } = useQuery<PetType[]>({
    queryKey: ['/api/pet-types'],
  });

  const createPetTypeMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('POST', '/api/pet-types', { name });
      return await response.json() as PetType;
    },
    onSuccess: (newPetType: PetType) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pet-types'] });
      onValueChange(newPetType.id);
      setShowAddNew(false);
      setNewTypeName("");
      toast({
        title: "Éxito",
        description: `Tipo de mascota "${newPetType.name}" creado exitosamente`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el tipo de mascota. Es posible que ya exista.",
        variant: "destructive",
      });
    },
  });

  const handleAddNewType = useCallback(() => {
    if (newTypeName.trim()) {
      createPetTypeMutation.mutate(newTypeName.trim());
    }
  }, [newTypeName, createPetTypeMutation]);

  const handleShowAddNew = useCallback(() => {
    setShowAddNew(true);
  }, []);

  const handleCancelAddNew = useCallback(() => {
    setShowAddNew(false);
    setNewTypeName("");
  }, []);

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500" data-testid="text-loading">
        Cargando tipos de mascotas...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange} data-testid="select-pet-type">
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {petTypes?.map((petType) => (
            <SelectItem key={petType.id} value={petType.id}>
              {petType.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!showAddNew ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShowAddNew}
          className="w-full"
          data-testid="button-add-new-type"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar nuevo tipo de mascota
        </Button>
      ) : (
        <div className="flex gap-2" data-testid="form-add-new-type">
          <Input
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="Nombre del nuevo tipo"
            data-testid="input-new-pet-type-name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddNewType();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddNewType}
            disabled={!newTypeName.trim() || createPetTypeMutation.isPending}
            data-testid="button-save-new-type"
          >
            {createPetTypeMutation.isPending ? "..." : "✓"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancelAddNew}
            data-testid="button-cancel-new-type"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
});
