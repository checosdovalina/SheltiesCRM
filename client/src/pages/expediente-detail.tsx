import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Dog,
  User,
  Calendar,
  Weight,
  Edit,
  FileText,
  Stethoscope,
  Activity,
  Heart,
  Brain,
  Eye,
  Accessibility,
} from "lucide-react";
import { useState } from "react";

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
      <div className="text-center py-12">
        <Dog className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Expediente no encontrado</h2>
        <Link href="/expedientes">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Expedientes
          </Button>
        </Link>
      </div>
    );
  }

  const InfoSection = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value) return null;
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base text-foreground whitespace-pre-wrap">{value}</p>
      </div>
    );
  };

  const BooleanIndicator = ({ label, value }: { label: string; value?: boolean }) => {
    if (value === undefined || value === null) return null;
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
        <p className="text-sm">{label}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/expedientes">
            <Button variant="outline" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expediente</h1>
            <p className="text-muted-foreground">Información completa del paciente</p>
          </div>
        </div>
        <Button data-testid="button-edit-expediente">
          <Edit className="w-4 h-4 mr-2" />
          Editar Expediente
        </Button>
      </div>

      {/* Datos de Identificación */}
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Datos de Identificación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dog Photo and Basic Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {dog.imageUrl ? (
                  <img
                    src={dog.imageUrl}
                    alt={dog.name}
                    className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Dog className="w-12 h-12 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{dog.name}</h2>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{dog.breed || "Sin raza"}</Badge>
                      {dog.age && <Badge variant="outline">{dog.age} años</Badge>}
                      {dog.weight && <Badge variant="outline">{dog.weight} kg</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="w-5 h-5 text-primary" />
                <span>Datos del Dueño</span>
              </div>
              <div className="space-y-2 pl-7">
                <p className="text-base">
                  <span className="font-medium">Nombre:</span> {dog.client.firstName} {dog.client.lastName}
                </p>
                <p className="text-base">
                  <span className="font-medium">Teléfono:</span> {dog.client.phone || "No registrado"}
                </p>
                <p className="text-base">
                  <span className="font-medium">Email:</span> {dog.client.email}
                </p>
                {dog.client.address && (
                  <p className="text-base">
                    <span className="font-medium">Dirección:</span> {dog.client.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <InfoSection label="Descripción del Problema" value={dog.problemDescription} />
          <InfoSection label="Objetivos a Tratar" value={dog.trainingObjectives} />
          {!dog.problemDescription && !dog.trainingObjectives && (
            <p className="text-muted-foreground text-sm italic">No hay información de objetivos registrada</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antecedentes */}
        <Card>
          <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Antecedentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <InfoSection label="Adquisición" value={dog.acquisitionSource} />
            <InfoSection label="Edad de Llegada" value={dog.arrivalAge} />
            <InfoSection label="Familia Canina" value={dog.canineFamily} />
            {!dog.acquisitionSource && !dog.arrivalAge && !dog.canineFamily && (
              <p className="text-muted-foreground text-sm italic">No hay antecedentes registrados</p>
            )}
          </CardContent>
        </Card>

        {/* Rutina */}
        <Card>
          <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Rutina
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <InfoSection label="Día a Día" value={dog.dailyRoutine} />
            <InfoSection label="Alimentación" value={dog.feedingSchedule} />
            {!dog.dailyRoutine && !dog.feedingSchedule && (
              <p className="text-muted-foreground text-sm italic">No hay información de rutina registrada</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Salud */}
      <Card>
        <CardHeader className="bg-green-50 dark:bg-green-950/20">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />
            Salud
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoSection label="Médico Veterinario" value={dog.veterinarian} />
            <InfoSection label="Vacunas" value={dog.vaccines} />
            <InfoSection label="Enfermedades" value={dog.diseases} />
            <InfoSection label="Predisposición a Enfermedades" value={dog.diseasePredisposition} />
          </div>
          {!dog.veterinarian && !dog.vaccines && !dog.diseases && !dog.diseasePredisposition && (
            <p className="text-muted-foreground text-sm italic">No hay información de salud registrada</p>
          )}
        </CardContent>
      </Card>

      {/* Comportamiento */}
      <Card>
        <CardHeader className="bg-red-50 dark:bg-red-950/20">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-red-600 dark:text-red-400" />
            Comportamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoSection label="Miedos" value={dog.fears} />
            <InfoSection label="Agresión" value={dog.aggression} />
            <InfoSection label="Hiperactividad" value={dog.hyperactivity} />
            <InfoSection label="Destrucción" value={dog.destruction} />
            <InfoSection label="Reactividad" value={dog.reactivity} />
            <InfoSection label="Ansiedad" value={dog.anxiety} />
            <InfoSection label="Hipersensibilidad" value={dog.hypersensitivity} />
            <InfoSection label="Otros Comportamientos" value={dog.otherBehaviors} />
          </div>
          {!dog.fears && !dog.aggression && !dog.hyperactivity && !dog.destruction && 
           !dog.reactivity && !dog.anxiety && !dog.hypersensitivity && !dog.otherBehaviors && (
            <p className="text-muted-foreground text-sm italic">No hay información de comportamiento registrada</p>
          )}
        </CardContent>
      </Card>

      {/* Observaciones Físicas */}
      <Card>
        <CardHeader className="bg-cyan-50 dark:bg-cyan-950/20">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Observaciones Físicas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoSection label="Postura" value={dog.posture} />
            <InfoSection label="Forma de Ojos" value={dog.eyeShape} />
            <InfoSection label="Movimiento del Cuerpo" value={dog.bodyMovement} />
            <InfoSection label="Temperatura" value={dog.physicalTemp} />
            <InfoSection label="Condición de Dientes" value={dog.teethCondition} />
            <InfoSection label="Olor" value={dog.smell} />
            <InfoSection label="Tensión Muscular" value={dog.muscleTension} />
            <InfoSection label="Reactivo al Tocar" value={dog.touchReactive} />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">Indicadores:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <BooleanIndicator label="Salivando" value={dog.salivating} />
              <BooleanIndicator label="Patas Sudando" value={dog.sweatingPaws} />
              <BooleanIndicator label="Muda de Pelo" value={dog.shedding} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movimiento */}
      <Card>
        <CardHeader className="bg-indigo-50 dark:bg-indigo-950/20">
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Movimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoSection label="Equilibrio" value={dog.balance} />
            <InfoSection label="Marcha" value={dog.gait} />
            <InfoSection label="Rapidez" value={dog.speed} />
            <InfoSection label="Coordinación" value={dog.coordination} />
          </div>
          {!dog.balance && !dog.gait && !dog.speed && !dog.coordination && (
            <p className="text-muted-foreground text-sm italic">No hay información de movimiento registrada</p>
          )}
        </CardContent>
      </Card>

      {/* Comportamiento con Correa */}
      <Card>
        <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Comportamiento con Correa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <InfoSection label="Seguridad con Correa" value={dog.leashComfort} />
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">Comportamientos:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <BooleanIndicator label="Jala la Correa" value={dog.leashPulling} />
              <BooleanIndicator label="Reactivo" value={dog.leashReactive} />
              <BooleanIndicator label="Agresivo" value={dog.leashAggressive} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interacción Social */}
      <Card>
        <CardHeader className="bg-pink-50 dark:bg-pink-950/20">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            Interacción Social
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <InfoSection label="Señales de Calma" value={dog.calmingSignals} />
          <InfoSection label="Reacción con Personas Desconocidas" value={dog.reactionToStrangers} />
          <InfoSection label="Reacción con Otros Perros" value={dog.reactionToOtherDogs} />
          {!dog.calmingSignals && !dog.reactionToStrangers && !dog.reactionToOtherDogs && (
            <p className="text-muted-foreground text-sm italic">No hay información de interacción social registrada</p>
          )}
        </CardContent>
      </Card>

      {/* Disposición del Dueño y Notas */}
      <Card>
        <CardHeader className="bg-slate-50 dark:bg-slate-950/20">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notas Adicionales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <InfoSection label="Disposición del Dueño" value={dog.ownerDisposition} />
          <InfoSection label="Notas Generales" value={dog.notes} />
          {!dog.ownerDisposition && !dog.notes && (
            <p className="text-muted-foreground text-sm italic">No hay notas adicionales registradas</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
