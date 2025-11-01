import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { insertDogSchema } from "@shared/schema";
import { PetTypeSelector } from "./PetTypeSelector";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { SimpleImageUploader } from "@/components/SimpleImageUploader";
import { X, FileText, Activity, Calendar, Heart, Stethoscope, Brain, Eye, Accessibility } from "lucide-react";

interface DogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  dog?: any;
}

export default function DogModal({ open, onOpenChange, clientId, clientName, dog }: DogModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const defaultValues = useMemo(() => ({
    clientId: clientId,
    petTypeId: "",
    name: "",
    breed: "",
    age: undefined as number | undefined,
    weight: "",
    notes: "",
    imageUrl: "",
    // Objetivos
    problemDescription: "",
    trainingObjectives: "",
    // Antecedentes
    acquisitionSource: "",
    arrivalAge: "",
    canineFamily: "",
    // Rutina
    dailyRoutine: "",
    feedingSchedule: "",
    // Salud
    veterinarian: "",
    vaccines: "",
    diseases: "",
    diseasePredisposition: "",
    // Comportamiento
    fears: "",
    aggression: "",
    hyperactivity: "",
    destruction: "",
    reactivity: "",
    anxiety: "",
    hypersensitivity: "",
    otherBehaviors: "",
    // Observaciones Físicas
    posture: "",
    eyeShape: "",
    bodyMovement: "",
    physicalTemp: "",
    teethCondition: "",
    smell: "",
    muscleTension: "",
    touchReactive: "",
    salivating: false,
    sweatingPaws: false,
    shedding: false,
    // Movimiento
    balance: "",
    gait: "",
    speed: "",
    coordination: "",
    // Correa
    leashComfort: "",
    leashPulling: false,
    leashReactive: false,
    leashAggressive: false,
    // Interacción
    calmingSignals: "",
    reactionToStrangers: "",
    reactionToOtherDogs: "",
    ownerDisposition: "",
    // Observaciones - Reacciones
    hidesBehindOwner: false,
    getsRigid: false,
    sits: false,
    staysImmobile: false,
    reactionOnArrival: "",
    reactionDuringAnamnesis: "",
    reactionDuringEvaluation: "",
    // Observaciones - Señales de Calma
    yawning: false,
    licking: false,
    stretching: false,
    turnHeadAway: false,
    blinking: false,
    sniffing: false,
    // Observaciones - Postura Detallada
    tailPosition: "",
    headPosition: "",
    earPosition: "",
    eyePosition: "",
    symmetry: "",
    breathing: "",
    rolling: false,
    crouching: false,
  }), [clientId]);

  const form = useForm<z.infer<typeof insertDogSchema>>({
    resolver: zodResolver(insertDogSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      if (dog) {
        form.reset({
          clientId: clientId,
          petTypeId: dog.petTypeId || "",
          name: dog.name || "",
          breed: dog.breed || "",
          age: dog.age || undefined,
          weight: dog.weight || "",
          notes: dog.notes || "",
          imageUrl: dog.imageUrl || "",
          problemDescription: dog.problemDescription || "",
          trainingObjectives: dog.trainingObjectives || "",
          acquisitionSource: dog.acquisitionSource || "",
          arrivalAge: dog.arrivalAge || "",
          canineFamily: dog.canineFamily || "",
          dailyRoutine: dog.dailyRoutine || "",
          feedingSchedule: dog.feedingSchedule || "",
          veterinarian: dog.veterinarian || "",
          vaccines: dog.vaccines || "",
          diseases: dog.diseases || "",
          diseasePredisposition: dog.diseasePredisposition || "",
          fears: dog.fears || "",
          aggression: dog.aggression || "",
          hyperactivity: dog.hyperactivity || "",
          destruction: dog.destruction || "",
          reactivity: dog.reactivity || "",
          anxiety: dog.anxiety || "",
          hypersensitivity: dog.hypersensitivity || "",
          otherBehaviors: dog.otherBehaviors || "",
          posture: dog.posture || "",
          eyeShape: dog.eyeShape || "",
          bodyMovement: dog.bodyMovement || "",
          physicalTemp: dog.physicalTemp || "",
          teethCondition: dog.teethCondition || "",
          smell: dog.smell || "",
          muscleTension: dog.muscleTension || "",
          touchReactive: dog.touchReactive || "",
          salivating: dog.salivating || false,
          sweatingPaws: dog.sweatingPaws || false,
          shedding: dog.shedding || false,
          balance: dog.balance || "",
          gait: dog.gait || "",
          speed: dog.speed || "",
          coordination: dog.coordination || "",
          leashComfort: dog.leashComfort || "",
          leashPulling: dog.leashPulling || false,
          leashReactive: dog.leashReactive || false,
          leashAggressive: dog.leashAggressive || false,
          calmingSignals: dog.calmingSignals || "",
          reactionToStrangers: dog.reactionToStrangers || "",
          reactionToOtherDogs: dog.reactionToOtherDogs || "",
          ownerDisposition: dog.ownerDisposition || "",
          hidesBehindOwner: dog.hidesBehindOwner || false,
          getsRigid: dog.getsRigid || false,
          sits: dog.sits || false,
          staysImmobile: dog.staysImmobile || false,
          reactionOnArrival: dog.reactionOnArrival || "",
          reactionDuringAnamnesis: dog.reactionDuringAnamnesis || "",
          reactionDuringEvaluation: dog.reactionDuringEvaluation || "",
          yawning: dog.yawning || false,
          licking: dog.licking || false,
          stretching: dog.stretching || false,
          turnHeadAway: dog.turnHeadAway || false,
          blinking: dog.blinking || false,
          sniffing: dog.sniffing || false,
          tailPosition: dog.tailPosition || "",
          headPosition: dog.headPosition || "",
          earPosition: dog.earPosition || "",
          eyePosition: dog.eyePosition || "",
          symmetry: dog.symmetry || "",
          breathing: dog.breathing || "",
          rolling: dog.rolling || false,
          crouching: dog.crouching || false,
        });
        setUploadedImageUrl(dog.imageUrl || "");
      } else {
        form.reset(defaultValues);
        setUploadedImageUrl("");
      }
    }
  }, [open, dog, clientId, defaultValues, form]);

  const handleImageUploaded = useCallback((imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    form.setValue("imageUrl", imageUrl, { shouldValidate: false, shouldDirty: true });
  }, [form]);

  const removeImage = useCallback(() => {
    setUploadedImageUrl("");
    form.setValue("imageUrl", "", { shouldValidate: false, shouldDirty: true });
  }, [form]);

  const createDogMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertDogSchema>) => {
      const url = dog ? `/api/dogs/${dog.id}` : "/api/dogs";
      const method = dog ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "dogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients-with-dogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: dog ? "Mascota actualizada" : "Mascota registrada",
        description: dog 
          ? "La información de la mascota ha sido actualizada exitosamente." 
          : "La nueva mascota ha sido registrada exitosamente.",
      });
      
      onOpenChange(false);
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
        description: dog ? "No se pudo actualizar la mascota." : "No se pudo registrar la mascota.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = useCallback((data: z.infer<typeof insertDogSchema>) => {
    createDogMutation.mutate(data);
  }, [createDogMutation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto" 
        data-testid="dialog-dog-modal"
      >
        <DialogHeader>
          <DialogTitle data-testid="text-dog-modal-title">
            {dog ? "Editar Expediente" : `Nuevo Expediente - ${clientName}`}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basico" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                <TabsTrigger value="basico" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Básico
                </TabsTrigger>
                <TabsTrigger value="objetivos" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Objetivos
                </TabsTrigger>
                <TabsTrigger value="antecedentes" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Historia
                </TabsTrigger>
                <TabsTrigger value="rutina" className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  Rutina
                </TabsTrigger>
                <TabsTrigger value="salud" className="text-xs">
                  <Stethoscope className="w-3 h-3 mr-1" />
                  Salud
                </TabsTrigger>
                <TabsTrigger value="comportamiento" className="text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  Comporta.
                </TabsTrigger>
                <TabsTrigger value="observaciones" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Observ.
                </TabsTrigger>
                <TabsTrigger value="movimiento" className="text-xs">
                  <Accessibility className="w-3 h-3 mr-1" />
                  Movim.
                </TabsTrigger>
              </TabsList>

              {/* Tab: Datos Básicos */}
              <TabsContent value="basico" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la mascota *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Buddy, Luna, Max..." 
                          {...field}
                          data-testid="input-dog-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="petTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Mascota *</FormLabel>
                      <FormControl>
                        <PetTypeSelector
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Selecciona el tipo de mascota"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raza</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Labrador, Golden Retriever, Mestizo..." 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-dog-breed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edad (años)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Ej: 3"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? undefined : parseInt(value, 10));
                            }}
                            data-testid="input-dog-age"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: 25.5"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-dog-weight"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={() => (
                    <FormItem>
                      <FormLabel>Foto de la mascota</FormLabel>
                      <div className="space-y-4">
                        {uploadedImageUrl ? (
                          <div className="relative inline-block">
                            <img
                              src={uploadedImageUrl}
                              alt="Foto de la mascota"
                              className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                              data-testid="dog-image-preview"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={removeImage}
                              data-testid="button-remove-image"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <SimpleImageUploader
                            onImageUploaded={handleImageUploaded}
                            buttonClassName="w-full"
                            isUploading={isUploading}
                            onUploadingChange={setIsUploading}
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Tab: Objetivos */}
              <TabsContent value="objetivos" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="problemDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Problema</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe el motivo de la consulta o los problemas observados..."
                          className="resize-none"
                          rows={4}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trainingObjectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivos a Tratar</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="¿Qué objetivos se quieren lograr con el entrenamiento?..."
                          className="resize-none"
                          rows={4}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Tab: Antecedentes */}
              <TabsContent value="antecedentes" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="acquisitionSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adquisición</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="¿De dónde se adquirió? (criador, refugio, regalo, etc.)"
                          className="resize-none"
                          rows={2}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="arrivalAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edad de Llegada</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: 2 meses, 1 año..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="canineFamily"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Familia Canina</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="¿Convive con otros perros? ¿Cuántos? Edades, razas..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Tab: Rutina */}
              <TabsContent value="rutina" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="dailyRoutine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Día a Día</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe la rutina diaria: horarios de paseo, juegos, descanso..."
                          className="resize-none"
                          rows={4}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feedingSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alimentación</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Horarios de comida, tipo de alimento, cantidades..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Tab: Salud */}
              <TabsContent value="salud" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="veterinarian"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médico Veterinario</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nombre del veterinario o clínica"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vaccines"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vacunas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Lista de vacunas aplicadas y fechas..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diseases"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enfermedades</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enfermedades actuales o pasadas..."
                          className="resize-none"
                          rows={2}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diseasePredisposition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Predisposición a Enfermedades</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Predisposición genética o de raza a enfermedades..."
                          className="resize-none"
                          rows={2}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Tab: Comportamiento */}
              <TabsContent value="comportamiento" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Miedos</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="¿A qué le tiene miedo?"
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aggression"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agresión</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observaciones sobre agresividad"
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hyperactivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hiperactividad</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Niveles de energía y actividad"
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destruction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destrucción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Comportamiento destructivo"
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reactivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reactividad</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Reacciones ante estímulos"
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="anxiety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ansiedad</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Signos de ansiedad observados"
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hypersensitivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hipersensibilidad</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Sensibilidad a ruidos, tacto, etc."
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otherBehaviors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Otros Comportamientos</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Otros comportamientos relevantes"
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tab: Observaciones Físicas */}
              <TabsContent value="observaciones" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="posture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postura</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Descripción de la postura"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eyeShape"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de Ojos</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Redondos, tensos, relajados..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bodyMovement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Movimiento del Cuerpo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Relajado, tenso, agachado..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="physicalTemp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperatura</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Normal, elevada..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teethCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condición de Dientes</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Estado de los dientes"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smell"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Olor</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Normal, fuerte, particular..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="muscleTension"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tensión Muscular</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Relajado, tenso..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="touchReactive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reactivo al Tocar</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Reacción al contacto físico"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Indicadores Físicos:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="salivating"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Salivando</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sweatingPaws"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Patas Sudando</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shedding"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Muda de Pelo</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-semibold">Reacciones durante Evaluación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reactionOnArrival"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reacción al Llegar</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Cómo reacciona al llegar..."
                              className="resize-none"
                              rows={2}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reactionDuringAnamnesis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reacción durante Anamnesis</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Comportamiento durante la conversación..."
                              className="resize-none"
                              rows={2}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reactionDuringEvaluation"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Reacción durante Evaluación Directa</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Comportamiento durante evaluación directa..."
                              className="resize-none"
                              rows={2}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hidesBehindOwner"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Se esconde detrás del dueño</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="getsRigid"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Se pone rígido</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sits"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Se sienta</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="staysImmobile"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Se queda inmóvil</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-semibold">Señales de Calma</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="yawning"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Bostezar</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="licking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Lamerse</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stretching"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Estirarse</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="turnHeadAway"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Girar la cabeza</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="blinking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Parpadear</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sniffing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Olfatear</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-semibold">Postura Detallada</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tailPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posición de la Cola</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Alta, baja, entre las piernas..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="headPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posición de la Cabeza</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Levantada, baja, normal..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="earPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posición de Orejas</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Erectas, caídas, hacia atrás..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eyePosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posición de Ojos</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Relajados, muy abiertos, entrecerrados..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="symmetry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Simetría</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Simétrico, asimétrico..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="breathing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Respiración</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Normal, agitada, jadeante..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rolling"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Se revuelca</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="crouching"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Se agacha</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Movimiento e Interacción */}
              <TabsContent value="movimiento" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Movimiento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="balance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equilibrio</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Bueno, deficiente..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gait"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marcha</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Normal, cojea..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="speed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rapidez</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Lento, normal, rápido..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="coordination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coordinación</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Buena, deficiente..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Comportamiento con Correa</h3>
                  <FormField
                    control={form.control}
                    name="leashComfort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seguridad con Correa</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="¿Se siente seguro con la correa?"
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="leashPulling"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Jala la Correa</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leashReactive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Reactivo</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leashAggressive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Agresivo</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Interacción Social</h3>
                  <FormField
                    control={form.control}
                    name="calmingSignals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Señales de Calma</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Bostezar, lamerse, estirarse, girar la cabeza, parpadear, olfatear..."
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reactionToStrangers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reacción con Personas Desconocidas</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="¿Cómo reacciona ante personas desconocidas?"
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reactionToOtherDogs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reacción con Otros Perros</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="¿Cómo reacciona ante otros perros?"
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerDisposition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disposición del Dueño</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Disposición y compromiso del dueño con el entrenamiento..."
                            className="resize-none"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas Generales</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cualquier otra observación relevante..."
                            className="resize-none"
                            rows={3}
                            {...field}
                            value={field.value || ""}
                            data-testid="input-dog-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-dog-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createDogMutation.isPending}
                data-testid="button-dog-save"
              >
                {createDogMutation.isPending
                  ? "Guardando..." 
                  : dog 
                    ? "Actualizar Expediente" 
                    : "Crear Expediente"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
