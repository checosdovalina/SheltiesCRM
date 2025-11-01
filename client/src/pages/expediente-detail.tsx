import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Icon className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-md">{description}</p>
  </div>
);

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

  const hasResumenData = dog.problemDescription || dog.trainingObjectives || dog.notes;
  const hasMedicoData = dog.veterinarian || dog.vaccines || dog.diseases || dog.diseasePredisposition ||
    dog.fears || dog.aggression || dog.hyperactivity || dog.destruction || dog.reactivity ||
    dog.anxiety || dog.hypersensitivity || dog.otherBehaviors || dog.posture || dog.eyeShape ||
    dog.bodyMovement || dog.physicalTemp || dog.teethCondition || dog.smell || dog.muscleTension ||
    dog.touchReactive || dog.salivating || dog.sweatingPaws || dog.shedding || dog.balance ||
    dog.gait || dog.speed || dog.coordination || dog.leashComfort || dog.leashPulling ||
    dog.leashReactive || dog.leashAggressive || dog.calmingSignals || dog.reactionToStrangers ||
    dog.reactionToOtherDogs || dog.acquisitionSource || dog.arrivalAge || dog.canineFamily ||
    dog.dailyRoutine || dog.feedingSchedule || dog.ownerDisposition;

  return (
    <div className="space-y-6" data-testid="page-expediente-detail">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/records">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold" data-testid="text-expediente-title">
          Expediente de {dog.name}
        </h1>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Datos Generales */}
        <div className="lg:col-span-1">
          <Card data-testid="card-datos-generales">
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

              <Separator />

              {/* Basic Stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium">{dog.weight}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Registrado:</span>
                  <span className="font-medium">26/6/2025</span>
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
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="resumen" data-testid="tab-resumen">
                <FileText className="h-4 w-4 mr-2" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="medico" data-testid="tab-medico">
                <Stethoscope className="h-4 w-4 mr-2" />
                Médico
              </TabsTrigger>
              <TabsTrigger value="entrenamientos" data-testid="tab-entrenamientos">
                <Activity className="h-4 w-4 mr-2" />
                Entrenamientos
              </TabsTrigger>
              <TabsTrigger value="evidencias" data-testid="tab-evidencias">
                <Camera className="h-4 w-4 mr-2" />
                Evidencias
              </TabsTrigger>
            </TabsList>

            {/* Resumen Tab */}
            <TabsContent value="resumen" data-testid="content-resumen">
              <Card>
                <CardContent className="p-6">
                  {hasResumenData ? (
                    <div className="space-y-6">
                      <InfoField label="Descripción del Problema" value={dog.problemDescription} />
                      <InfoField label="Objetivos de Entrenamiento" value={dog.trainingObjectives} />
                      <InfoField label="Notas Generales" value={dog.notes} />
                    </div>
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No hay información de resumen"
                      description="Agrega objetivos y descripción del problema para comenzar el expediente"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Médico Tab */}
            <TabsContent value="medico" data-testid="content-medico">
              <Card>
                <CardContent className="p-6">
                  {hasMedicoData ? (
                    <div className="space-y-8">
                      {/* Salud */}
                      {(dog.veterinarian || dog.vaccines || dog.diseases || dog.diseasePredisposition) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Información de Salud</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <InfoField label="Veterinario" value={dog.veterinarian} />
                            <InfoField label="Vacunas" value={dog.vaccines} />
                            <InfoField label="Enfermedades" value={dog.diseases} />
                            <InfoField label="Predisposición a Enfermedades" value={dog.diseasePredisposition} />
                          </div>
                        </div>
                      )}

                      {/* Comportamiento */}
                      {(dog.fears || dog.aggression || dog.hyperactivity || dog.destruction || dog.reactivity || dog.anxiety || dog.hypersensitivity || dog.otherBehaviors) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Comportamiento</h3>
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
                        </div>
                      )}

                      {/* Observaciones Físicas */}
                      {(dog.posture || dog.eyeShape || dog.bodyMovement || dog.physicalTemp || dog.teethCondition || dog.smell || dog.muscleTension || dog.touchReactive || dog.salivating || dog.sweatingPaws || dog.shedding) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Observaciones Físicas</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <InfoField label="Postura" value={dog.posture} />
                            <InfoField label="Forma de los Ojos" value={dog.eyeShape} />
                            <InfoField label="Movimiento del Cuerpo" value={dog.bodyMovement} />
                            <InfoField label="Temperatura" value={dog.physicalTemp} />
                            <InfoField label="Condición de Dientes" value={dog.teethCondition} />
                            <InfoField label="Olor" value={dog.smell} />
                            <InfoField label="Tensión Muscular" value={dog.muscleTension} />
                            <InfoField label="Reactivo al Tacto" value={dog.touchReactive} />
                            <InfoField label="Salivando" value={dog.salivating} />
                            <InfoField label="Sudoración en Patas" value={dog.sweatingPaws} />
                            <InfoField label="Muda de Pelo" value={dog.shedding} />
                          </div>
                        </div>
                      )}

                      {/* Movimiento */}
                      {(dog.balance || dog.gait || dog.speed || dog.coordination || dog.leashComfort || dog.leashPulling || dog.leashReactive || dog.leashAggressive) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Evaluación de Movimiento</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <InfoField label="Equilibrio" value={dog.balance} />
                            <InfoField label="Marcha" value={dog.gait} />
                            <InfoField label="Velocidad" value={dog.speed} />
                            <InfoField label="Coordinación" value={dog.coordination} />
                            <InfoField label="Comodidad con Correa" value={dog.leashComfort} />
                            <InfoField label="Jala la Correa" value={dog.leashPulling} />
                            <InfoField label="Reactivo con Correa" value={dog.leashReactive} />
                            <InfoField label="Agresivo con Correa" value={dog.leashAggressive} />
                          </div>
                        </div>
                      )}

                      {/* Interacción Social */}
                      {(dog.calmingSignals || dog.reactionToStrangers || dog.reactionToOtherDogs) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Interacción Social</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <InfoField label="Señales de Calma" value={dog.calmingSignals} />
                            <InfoField label="Reacción con Extraños" value={dog.reactionToStrangers} />
                            <InfoField label="Reacción con Otros Perros" value={dog.reactionToOtherDogs} />
                          </div>
                        </div>
                      )}

                      {/* Historia */}
                      {(dog.acquisitionSource || dog.arrivalAge || dog.canineFamily) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Antecedentes</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <InfoField label="Fuente de Adquisición" value={dog.acquisitionSource} />
                            <InfoField label="Edad de Llegada" value={dog.arrivalAge} />
                            <InfoField label="Familia Canina" value={dog.canineFamily} />
                          </div>
                        </div>
                      )}

                      {/* Rutina */}
                      {(dog.dailyRoutine || dog.feedingSchedule) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Rutina</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <InfoField label="Rutina Diaria" value={dog.dailyRoutine} />
                            <InfoField label="Horario de Alimentación" value={dog.feedingSchedule} />
                          </div>
                        </div>
                      )}

                      {/* Disposición del Dueño */}
                      {dog.ownerDisposition && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Disposición del Dueño</h3>
                          <InfoField label="" value={dog.ownerDisposition} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Stethoscope}
                      title="No hay registros médicos"
                      description="Comienza agregando el primer registro médico"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Entrenamientos Tab */}
            <TabsContent value="entrenamientos" data-testid="content-entrenamientos">
              <Card>
                <CardContent className="p-6">
                  <EmptyState
                    icon={Activity}
                    title="No hay sesiones de entrenamiento"
                    description="Comienza registrando la primera sesión de entrenamiento"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Evidencias Tab */}
            <TabsContent value="evidencias" data-testid="content-evidencias">
              <Card>
                <CardContent className="p-6">
                  <EmptyState
                    icon={Camera}
                    title="No hay evidencias"
                    description="Sube fotos, videos o documentos relacionados con esta mascota"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
