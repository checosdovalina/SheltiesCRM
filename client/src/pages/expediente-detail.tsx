import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Dog,
  User,
  Calendar,
  Weight,
  Edit,
  FileText,
  Activity,
  Heart,
  Stethoscope,
  Brain,
  Eye,
  Accessibility,
} from "lucide-react";

interface DogWithClient {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: string;
  imageUrl?: string;
  notes?: string;
  clientId: string;
  petTypeId: string;
  
  // Objetivos
  problemDescription?: string;
  trainingObjectives?: string;
  
  // Antecedentes
  acquisitionSource?: string;
  arrivalAge?: string;
  canineFamily?: string;
  
  // Rutina
  dailyRoutine?: string;
  feedingSchedule?: string;
  
  // Salud
  veterinarian?: string;
  vaccines?: string;
  diseases?: string;
  diseasePredisposition?: string;
  
  // Comportamiento
  fears?: string;
  aggression?: string;
  hyperactivity?: string;
  destruction?: string;
  reactivity?: string;
  anxiety?: string;
  hypersensitivity?: string;
  otherBehaviors?: string;
  
  // Observaciones
  posture?: string;
  eyeShape?: string;
  bodyMovement?: string;
  physicalTemp?: string;
  teethCondition?: string;
  smell?: string;
  muscleTension?: string;
  touchReactive?: string;
  salivating?: boolean;
  sweatingPaws?: boolean;
  shedding?: boolean;
  
  // Movimiento
  balance?: string;
  gait?: string;
  speed?: string;
  coordination?: string;
  
  // Correa
  leashComfort?: string;
  leashPulling?: boolean;
  leashReactive?: boolean;
  leashAggressive?: boolean;
  
  // Interacción
  calmingSignals?: string;
  reactionToStrangers?: string;
  reactionToOtherDogs?: string;
  
  ownerDisposition?: string;
  
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

const InfoField = ({ label, value }: { label: string; value?: string | number | boolean }) => {
  if (!value && value !== false && value !== 0) return null;
  
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base">
        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
      </p>
    </div>
  );
};

export default function ExpedienteDetail() {
  const [, params] = useRoute("/expediente/:id");
  const dogId = params?.id;

  const { data: dog, isLoading } = useQuery<DogWithClient>({
    queryKey: ["/api/dogs", dogId],
    enabled: !!dogId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/records">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No se encontró el expediente</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-expediente-detail">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/records">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-expediente-title">
              Expediente: {dog.name}
            </h1>
            <p className="text-muted-foreground">
              Cliente: {dog.client.firstName} {dog.client.lastName}
            </p>
          </div>
        </div>
        <Link href="/records">
          <Button variant="outline" data-testid="button-edit-dog">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Main Content with Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-6">
              <TabsTrigger value="basico" data-testid="tab-basico">
                <Dog className="h-4 w-4 mr-2" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="objetivos" data-testid="tab-objetivos">
                <FileText className="h-4 w-4 mr-2" />
                Objetivos
              </TabsTrigger>
              <TabsTrigger value="historia" data-testid="tab-historia">
                <Calendar className="h-4 w-4 mr-2" />
                Historia
              </TabsTrigger>
              <TabsTrigger value="rutina" data-testid="tab-rutina">
                <Activity className="h-4 w-4 mr-2" />
                Rutina
              </TabsTrigger>
              <TabsTrigger value="salud" data-testid="tab-salud">
                <Stethoscope className="h-4 w-4 mr-2" />
                Salud
              </TabsTrigger>
              <TabsTrigger value="comportamiento" data-testid="tab-comportamiento">
                <Brain className="h-4 w-4 mr-2" />
                Comportamiento
              </TabsTrigger>
              <TabsTrigger value="observaciones" data-testid="tab-observaciones">
                <Eye className="h-4 w-4 mr-2" />
                Observaciones
              </TabsTrigger>
              <TabsTrigger value="movimiento" data-testid="tab-movimiento">
                <Accessibility className="h-4 w-4 mr-2" />
                Movimiento
              </TabsTrigger>
            </TabsList>

            {/* Básico Tab */}
            <TabsContent value="basico" className="space-y-6" data-testid="content-basico">
              <div className="flex gap-6">
                {dog.imageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={dog.imageUrl}
                      alt={dog.name}
                      className="w-48 h-48 object-cover rounded-lg"
                      data-testid="img-dog"
                    />
                  </div>
                )}
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <InfoField label="Nombre" value={dog.name} />
                  <InfoField label="Raza" value={dog.breed} />
                  <InfoField label="Edad (años)" value={dog.age} />
                  <InfoField label="Peso" value={dog.weight} />
                  <div className="col-span-2">
                    <InfoField label="Notas" value={dog.notes} />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Información del Cliente</h3>
                <div className="grid grid-cols-2 gap-6">
                  <InfoField label="Nombre" value={`${dog.client.firstName} ${dog.client.lastName}`} />
                  <InfoField label="Email" value={dog.client.email} />
                  <InfoField label="Teléfono" value={dog.client.phone} />
                  <InfoField label="Dirección" value={dog.client.address} />
                </div>
              </div>
            </TabsContent>

            {/* Objetivos Tab */}
            <TabsContent value="objetivos" className="space-y-6" data-testid="content-objetivos">
              <InfoField label="Descripción del Problema" value={dog.problemDescription} />
              <InfoField label="Objetivos de Entrenamiento" value={dog.trainingObjectives} />
            </TabsContent>

            {/* Historia Tab */}
            <TabsContent value="historia" className="space-y-6" data-testid="content-historia">
              <InfoField label="Fuente de Adquisición" value={dog.acquisitionSource} />
              <InfoField label="Edad de Llegada" value={dog.arrivalAge} />
              <InfoField label="Familia Canina" value={dog.canineFamily} />
            </TabsContent>

            {/* Rutina Tab */}
            <TabsContent value="rutina" className="space-y-6" data-testid="content-rutina">
              <InfoField label="Rutina Diaria" value={dog.dailyRoutine} />
              <InfoField label="Horario de Alimentación" value={dog.feedingSchedule} />
            </TabsContent>

            {/* Salud Tab */}
            <TabsContent value="salud" className="space-y-6" data-testid="content-salud">
              <InfoField label="Veterinario" value={dog.veterinarian} />
              <InfoField label="Vacunas" value={dog.vaccines} />
              <InfoField label="Enfermedades" value={dog.diseases} />
              <InfoField label="Predisposición a Enfermedades" value={dog.diseasePredisposition} />
            </TabsContent>

            {/* Comportamiento Tab */}
            <TabsContent value="comportamiento" className="space-y-6" data-testid="content-comportamiento">
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="Miedos" value={dog.fears} />
                <InfoField label="Agresión" value={dog.aggression} />
                <InfoField label="Hiperactividad" value={dog.hyperactivity} />
                <InfoField label="Destrucción" value={dog.destruction} />
                <InfoField label="Reactividad" value={dog.reactivity} />
                <InfoField label="Ansiedad" value={dog.anxiety} />
                <InfoField label="Hipersensibilidad" value={dog.hypersensitivity} />
                <div className="col-span-2">
                  <InfoField label="Otros Comportamientos" value={dog.otherBehaviors} />
                </div>
              </div>
            </TabsContent>

            {/* Observaciones Tab */}
            <TabsContent value="observaciones" className="space-y-6" data-testid="content-observaciones">
              <h3 className="text-lg font-semibold">Observaciones Físicas</h3>
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="Postura" value={dog.posture} />
                <InfoField label="Forma de los Ojos" value={dog.eyeShape} />
                <InfoField label="Movimiento del Cuerpo" value={dog.bodyMovement} />
                <InfoField label="Temperatura Física" value={dog.physicalTemp} />
                <InfoField label="Condición de Dientes" value={dog.teethCondition} />
                <InfoField label="Olor" value={dog.smell} />
                <InfoField label="Tensión Muscular" value={dog.muscleTension} />
                <InfoField label="Reactivo al Tacto" value={dog.touchReactive} />
                <InfoField label="Salivando" value={dog.salivating} />
                <InfoField label="Sudoración en Patas" value={dog.sweatingPaws} />
                <InfoField label="Muda de Pelo" value={dog.shedding} />
              </div>
            </TabsContent>

            {/* Movimiento Tab */}
            <TabsContent value="movimiento" className="space-y-6" data-testid="content-movimiento">
              <h3 className="text-lg font-semibold">Evaluación de Movimiento</h3>
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="Equilibrio" value={dog.balance} />
                <InfoField label="Marcha" value={dog.gait} />
                <InfoField label="Velocidad" value={dog.speed} />
                <InfoField label="Coordinación" value={dog.coordination} />
              </div>

              <h3 className="text-lg font-semibold mt-6">Comportamiento con Correa</h3>
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="Comodidad con Correa" value={dog.leashComfort} />
                <InfoField label="Jala la Correa" value={dog.leashPulling} />
                <InfoField label="Reactivo con Correa" value={dog.leashReactive} />
                <InfoField label="Agresivo con Correa" value={dog.leashAggressive} />
              </div>

              <h3 className="text-lg font-semibold mt-6">Interacción Social</h3>
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="Señales de Calma" value={dog.calmingSignals} />
                <InfoField label="Reacción con Extraños" value={dog.reactionToStrangers} />
                <InfoField label="Reacción con Otros Perros" value={dog.reactionToOtherDogs} />
                <InfoField label="Disposición del Dueño" value={dog.ownerDisposition} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
