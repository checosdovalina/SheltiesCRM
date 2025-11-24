import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Dog,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Weight,
  Stethoscope,
  Activity,
  Camera,
  FileText,
  Plus,
  Eye,
} from "lucide-react";
import MedicalRecordModal from "@/components/medical-record-modal";
import TrainingModal from "@/components/training-modal";
import EvidenceModal from "@/components/evidence-modal";
import ObservationsModal from "@/components/observations-modal";
import { format } from "date-fns";
import { Pencil, BookOpen } from "lucide-react";

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
  
  problemDescription?: string;
  trainingObjectives?: string;
  acquisitionSource?: string;
  arrivalAge?: string;
  canineFamily?: string;
  dailyRoutine?: string;
  feedingSchedule?: string;
  veterinarian?: string;
  vaccines?: string;
  diseases?: string;
  diseasePredisposition?: string;
  fears?: string;
  aggression?: string;
  hyperactivity?: string;
  destruction?: string;
  reactivity?: string;
  anxiety?: string;
  hypersensitivity?: string;
  otherBehaviors?: string;
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
  balance?: string;
  gait?: string;
  speed?: string;
  coordination?: string;
  leashComfort?: string;
  leashPulling?: boolean;
  leashReactive?: boolean;
  leashAggressive?: boolean;
  calmingSignals?: string;
  reactionToStrangers?: string;
  reactionToOtherDogs?: string;
  ownerDisposition?: string;
  
  coat?: string;
  leashComfortOther?: string;
  leashPullingOther?: boolean;
  leashReactiveOther?: boolean;
  leashAggressiveOther?: boolean;
  
  hidesBehindOwner?: boolean;
  getsRigid?: boolean;
  sits?: boolean;
  staysImmobile?: boolean;
  reactionOnArrival?: string;
  reactionDuringAnamnesis?: string;
  reactionDuringEvaluation?: string;
  yawning?: boolean;
  licking?: boolean;
  stretching?: boolean;
  turnHeadAway?: boolean;
  blinking?: boolean;
  sniffing?: boolean;
  tailPosition?: string;
  headPosition?: string;
  earPosition?: string;
  eyePosition?: string;
  symmetry?: string;
  breathing?: string;
  rolling?: boolean;
  crouching?: boolean;
  
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

interface MedicalRecord {
  id: string;
  recordDate: Date;
  recordType: string;
  title: string;
  veterinarian?: string;
  description?: string;
  medications?: string;
  notes?: string;
}

interface TrainingSession {
  id: string;
  sessionDate: Date;
  trainer?: string;
  objective: string;
  activities?: string;
  progress?: string;
  behaviorNotes?: string;
  nextSteps?: string;
  rating?: number;
  duration?: number;
}

interface Evidence {
  id: string;
  type: string;
  title: string;
  description?: string;
  fileUrl?: string;
  createdAt: Date;
}

interface Protocol {
  id: string;
  name: string;
  category: string;
  objectives?: string;
  description?: string;
  steps?: any;
  duration?: number;
  isActive?: boolean;
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

const EmptyState = ({ icon: Icon, title, description, onAdd }: { icon: any; title: string; description: string; onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Icon className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
    <Button onClick={onAdd} size="sm" data-testid="button-add-first">
      <Plus className="h-4 w-4 mr-2" />
      Agregar Primero
    </Button>
  </div>
);

export default function ExpedienteDetail() {
  const [, params] = useRoute("/expediente/:id");
  const dogId = params?.id;

  const [medicalModalOpen, setMedicalModalOpen] = useState(false);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [observationsModalOpen, setObservationsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: dog, isLoading } = useQuery<DogWithClient>({
    queryKey: ["/api/dogs", dogId],
    enabled: !!dogId,
  });

  const { data: protocols = [] } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
  });

  const updateProtocolMutation = useMutation({
    mutationFn: async (protocolId: string | null) => {
      return apiRequest(`/api/dogs/${dogId}`, {
        method: "PUT",
        body: JSON.stringify({ activeProtocolId: protocolId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dogId] });
      toast({
        title: "Protocolo actualizado",
        description: "El protocolo de la mascota ha sido actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el protocolo.",
        variant: "destructive",
      });
    },
  });

  const { data: medicalRecords = [] } = useQuery<MedicalRecord[]>({
    queryKey: ["/api/dogs", dogId, "medical-records"],
    enabled: !!dogId,
  });

  const { data: trainingSessions = [] } = useQuery<TrainingSession[]>({
    queryKey: ["/api/dogs", dogId, "training-sessions"],
    enabled: !!dogId,
  });

  const { data: evidence = [] } = useQuery<Evidence[]>({
    queryKey: ["/api/dogs", dogId, "evidence"],
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

  const hasResumenData = dog.problemDescription || dog.trainingObjectives || dog.notes;

  return (
    <div className="space-y-6 pb-8" data-testid="page-expediente-detail">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link href="/records">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-expediente-title">
          Expediente de {dog.name}
        </h1>
      </div>

      {/* Two Column Layout - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Datos Generales */}
        <div className="lg:col-span-1">
          <Card data-testid="card-datos-generales" className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dog className="h-5 w-5" />
                Datos Generales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dog Image */}
              <div className="flex justify-center">
                {dog.imageUrl ? (
                  <img
                    src={dog.imageUrl}
                    alt={dog.name}
                    className="w-32 h-32 object-cover rounded-full border-4 border-primary/20"
                    data-testid="img-dog"
                  />
                ) : (
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                    <Dog className="h-16 w-16 text-primary/40" />
                  </div>
                )}
              </div>

              {/* Dog Info */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold" data-testid="text-dog-name">{dog.name}</h2>
                <p className="text-muted-foreground">{dog.breed}</p>
                <p className="text-sm text-muted-foreground">{dog.age} años</p>
              </div>

              {/* Protocol Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  Protocolo/Expediente Activo
                </label>
                <Select
                  value={dog.activeProtocolId || "none"}
                  onValueChange={(value) => {
                    updateProtocolMutation.mutate(value === "none" ? null : value);
                  }}
                  disabled={updateProtocolMutation.isPending}
                >
                  <SelectTrigger className="w-full" data-testid="select-active-protocol">
                    <SelectValue placeholder="Seleccionar protocolo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin protocolo asignado</SelectItem>
                    {protocols.filter(p => p.isActive).map((protocol) => (
                      <SelectItem key={protocol.id} value={protocol.id}>
                        {protocol.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Basic Stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium">{dog.weight}</span>
                </div>
              </div>

              <Separator />

              {/* Owner Info */}
              <div>
                <h3 className="font-semibold mb-3">Información del Propietario</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{dog.client.firstName} {dog.client.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-muted-foreground break-all">{dog.client.email}</p>
                  </div>
                  {dog.client.phone && (
                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-muted-foreground">{dog.client.phone}</p>
                    </div>
                  )}
                  {dog.client.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-muted-foreground">{dog.client.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabbed Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="resumen" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-4 h-auto">
              <TabsTrigger value="resumen" data-testid="tab-resumen" className="text-xs sm:text-sm">
                <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Resumen</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="observaciones" data-testid="tab-observaciones" className="text-xs sm:text-sm">
                <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Observaciones</span>
                <span className="sm:hidden">Obs.</span>
              </TabsTrigger>
              <TabsTrigger value="medico" data-testid="tab-medico" className="text-xs sm:text-sm">
                <Stethoscope className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Médico</span>
                <span className="sm:hidden">Salud</span>
              </TabsTrigger>
              <TabsTrigger value="entrenamientos" data-testid="tab-entrenamientos" className="text-xs sm:text-sm">
                <Activity className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Entrenamientos</span>
                <span className="sm:hidden">Entreno</span>
              </TabsTrigger>
              <TabsTrigger value="evidencias" data-testid="tab-evidencias" className="text-xs sm:text-sm">
                <Camera className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Evidencias</span>
                <span className="sm:hidden">Media</span>
              </TabsTrigger>
            </TabsList>

            {/* Resumen Tab */}
            <TabsContent value="resumen" data-testid="content-resumen">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  {hasResumenData ? (
                    <div className="space-y-6">
                      <InfoField label="Descripción del Problema" value={dog.problemDescription} />
                      <InfoField label="Objetivos de Entrenamiento" value={dog.trainingObjectives} />
                      <InfoField label="Notas Generales" value={dog.notes} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No hay información de resumen</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Edita el perfil de la mascota para agregar objetivos y descripción del problema
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Observaciones Tab */}
            <TabsContent value="observaciones" data-testid="content-observaciones">
              <div className="space-y-4">
                <div className="flex justify-end mb-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setObservationsModalOpen(true)}
                    data-testid="button-edit-observations"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Observaciones
                  </Button>
                </div>
                {/* Características Físicas */}
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Características Físicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField label="Pelaje" value={dog.coat} />
                      <InfoField label="Temperatura" value={dog.physicalTemp} />
                      <InfoField label="Ojos" value={dog.eyeShape} />
                      <InfoField label="Dientes" value={dog.teethCondition} />
                      <InfoField label="Peso" value={dog.weight} />
                      <InfoField label="Olor" value={dog.smell} />
                      <InfoField label="Tensión Muscular" value={dog.muscleTension} />
                      <InfoField label="Reactivo al Tocar" value={dog.touchReactive} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <InfoField label="Salivando" value={dog.salivating} />
                      <InfoField label="Patas Sudando" value={dog.sweatingPaws} />
                      <InfoField label="Muda de Pelo" value={dog.shedding} />
                    </div>
                  </CardContent>
                </Card>

                {/* Movimiento */}
                <Card className="border-l-4 border-l-indigo-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Movimiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField label="Equilibrio" value={dog.balance} />
                      <InfoField label="Normal/Cojea" value={dog.gait} />
                      <InfoField label="Rapidez" value={dog.speed} />
                      <InfoField label="Coordinación" value={dog.coordination} />
                    </div>
                  </CardContent>
                </Card>

                {/* Correa - Con el Dueño */}
                <Card className="border-l-4 border-l-cyan-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Correa - Con el Dueño</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoField label="¿Se siente seguro?" value={dog.leashComfort} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <InfoField label="¿Jala?" value={dog.leashPulling} />
                      <InfoField label="¿Se pone reactivo?" value={dog.leashReactive} />
                      <InfoField label="¿Agresivo?" value={dog.leashAggressive} />
                    </div>
                  </CardContent>
                </Card>

                {/* Correa - Con Otra Persona */}
                <Card className="border-l-4 border-l-teal-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Correa - Con Otra Persona</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoField label="¿Se siente seguro?" value={dog.leashComfortOther} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <InfoField label="¿Jala?" value={dog.leashPullingOther} />
                      <InfoField label="¿Se pone reactivo?" value={dog.leashReactiveOther} />
                      <InfoField label="¿Agresivo?" value={dog.leashAggressiveOther} />
                    </div>
                  </CardContent>
                </Card>

                {/* Reacciones durante Evaluación */}
                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Reacciones durante Evaluación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField label="Reacción al Llegar" value={dog.reactionOnArrival} />
                      <InfoField label="Durante Anamnesis" value={dog.reactionDuringAnamnesis} />
                      <InfoField label="Durante Evaluación Directa" value={dog.reactionDuringEvaluation} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <InfoField label="Se esconde detrás del dueño" value={dog.hidesBehindOwner} />
                      <InfoField label="Se pone rígido" value={dog.getsRigid} />
                      <InfoField label="Se sienta" value={dog.sits} />
                      <InfoField label="Se queda inmóvil" value={dog.staysImmobile} />
                    </div>
                  </CardContent>
                </Card>

                {/* Señales de Calma */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Señales de Calma</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <InfoField label="Bostezar" value={dog.yawning} />
                      <InfoField label="Lamerse" value={dog.licking} />
                      <InfoField label="Estirarse" value={dog.stretching} />
                      <InfoField label="Girar la cabeza" value={dog.turnHeadAway} />
                      <InfoField label="Parpadear" value={dog.blinking} />
                      <InfoField label="Olfatear" value={dog.sniffing} />
                    </div>
                  </CardContent>
                </Card>

                {/* Postura Detallada */}
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Postura Detallada</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField label="Posición de la Cola" value={dog.tailPosition} />
                      <InfoField label="Posición de la Cabeza" value={dog.headPosition} />
                      <InfoField label="Posición de Orejas" value={dog.earPosition} />
                      <InfoField label="Posición de Ojos" value={dog.eyePosition} />
                      <InfoField label="Simetría" value={dog.symmetry} />
                      <InfoField label="Respiración" value={dog.breathing} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InfoField label="Se revuelca" value={dog.rolling} />
                      <InfoField label="Se agacha" value={dog.crouching} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Médico Tab */}
            <TabsContent value="medico" data-testid="content-medico">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Registros Médicos</CardTitle>
                  <Button size="sm" onClick={() => setMedicalModalOpen(true)} data-testid="button-add-medical">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Agregar Registro</span>
                    <span className="sm:hidden">Agregar</span>
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {medicalRecords.length > 0 ? (
                    <div className="space-y-4">
                      {medicalRecords.map((record) => (
                        <Card key={record.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                              <div>
                                <h4 className="font-semibold text-lg">{record.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <Badge variant="outline">{record.recordType}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(record.recordDate), 'dd/MM/yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {record.veterinarian && (
                              <p className="text-sm mb-2">
                                <span className="font-medium">Veterinario:</span> {record.veterinarian}
                              </p>
                            )}
                            {record.description && (
                              <p className="text-sm mb-2">
                                <span className="font-medium">Descripción:</span> {record.description}
                              </p>
                            )}
                            {record.medications && (
                              <p className="text-sm mb-2">
                                <span className="font-medium">Medicamentos:</span> {record.medications}
                              </p>
                            )}
                            {record.notes && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Notas:</span> {record.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Stethoscope}
                      title="No hay registros médicos"
                      description="Comienza agregando el primer registro médico"
                      onAdd={() => setMedicalModalOpen(true)}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Entrenamientos Tab */}
            <TabsContent value="entrenamientos" data-testid="content-entrenamientos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Sesiones de Entrenamiento</CardTitle>
                  <Button size="sm" onClick={() => setTrainingModalOpen(true)} data-testid="button-add-training">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Nueva Sesión</span>
                    <span className="sm:hidden">Nueva</span>
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {trainingSessions.length > 0 ? (
                    <div className="space-y-4">
                      {trainingSessions.map((session) => (
                        <Card key={session.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                              <div>
                                <h4 className="font-semibold text-lg">{session.objective}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(session.sessionDate), 'dd/MM/yyyy HH:mm')}
                                  </span>
                                  {session.duration && (
                                    <Badge variant="outline">{session.duration} min</Badge>
                                  )}
                                  {session.rating && (
                                    <Badge>⭐ {session.rating}/10</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {session.trainer && (
                              <p className="text-sm mb-2">
                                <span className="font-medium">Entrenador:</span> {session.trainer}
                              </p>
                            )}
                            {session.activities && (
                              <p className="text-sm mb-2">
                                <span className="font-medium">Actividades:</span> {session.activities}
                              </p>
                            )}
                            {session.progress && (
                              <p className="text-sm mb-2">
                                <span className="font-medium">Progreso:</span> {session.progress}
                              </p>
                            )}
                            {session.behaviorNotes && (
                              <p className="text-sm mb-2">
                                <span className="font-medium">Comportamiento:</span> {session.behaviorNotes}
                              </p>
                            )}
                            {session.nextSteps && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Próximos Pasos:</span> {session.nextSteps}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Activity}
                      title="No hay sesiones de entrenamiento"
                      description="Comienza registrando la primera sesión de entrenamiento"
                      onAdd={() => setTrainingModalOpen(true)}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Evidencias Tab */}
            <TabsContent value="evidencias" data-testid="content-evidencias">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Evidencias</CardTitle>
                  <Button size="sm" onClick={() => setEvidenceModalOpen(true)} data-testid="button-add-evidence">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Agregar Evidencia</span>
                    <span className="sm:hidden">Agregar</span>
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {evidence.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {evidence.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {item.type === 'photo' && <Camera className="h-8 w-8 text-primary" />}
                                {item.type === 'video' && <Activity className="h-8 w-8 text-primary" />}
                                {item.type === 'document' && <FileText className="h-8 w-8 text-primary" />}
                                {item.type === 'note' && <FileText className="h-8 w-8 text-primary" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{item.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(item.createdAt), 'dd/MM/yyyy')}
                                </p>
                                {item.description && (
                                  <p className="text-sm mt-2 line-clamp-2">{item.description}</p>
                                )}
                                {item.fileUrl && (
                                  <a
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline mt-2 inline-block"
                                  >
                                    Ver archivo →
                                  </a>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Camera}
                      title="No hay evidencias"
                      description="Sube fotos, videos o documentos relacionados con esta mascota"
                      onAdd={() => setEvidenceModalOpen(true)}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      {medicalModalOpen && (
        <MedicalRecordModal
          open={medicalModalOpen}
          onOpenChange={setMedicalModalOpen}
          dogId={dog.id}
          dogName={dog.name}
        />
      )}
      {trainingModalOpen && (
        <TrainingModal
          open={trainingModalOpen}
          onOpenChange={setTrainingModalOpen}
          dogId={dog.id}
          dogName={dog.name}
          plannedProtocolId={null}
          appointmentId={null}
        />
      )}
      {evidenceModalOpen && (
        <EvidenceModal
          open={evidenceModalOpen}
          onOpenChange={setEvidenceModalOpen}
          dogId={dog.id}
          dogName={dog.name}
        />
      )}
      {observationsModalOpen && (
        <ObservationsModal
          open={observationsModalOpen}
          onOpenChange={setObservationsModalOpen}
          dog={dog}
        />
      )}
    </div>
  );
}
