import { useEffect } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";

const observationsSchema = z.object({
  coat: z.string().optional(),
  physicalTemp: z.string().optional(),
  eyeShape: z.string().optional(),
  teethCondition: z.string().optional(),
  weight: z.string().optional(),
  smell: z.string().optional(),
  muscleTension: z.string().optional(),
  touchReactive: z.string().optional(),
  salivating: z.boolean().optional(),
  sweatingPaws: z.boolean().optional(),
  shedding: z.boolean().optional(),
  balance: z.string().optional(),
  gait: z.string().optional(),
  speed: z.string().optional(),
  coordination: z.string().optional(),
  leashComfort: z.string().optional(),
  leashPulling: z.boolean().optional(),
  leashReactive: z.boolean().optional(),
  leashAggressive: z.boolean().optional(),
  leashComfortOther: z.string().optional(),
  leashPullingOther: z.boolean().optional(),
  leashReactiveOther: z.boolean().optional(),
  leashAggressiveOther: z.boolean().optional(),
  reactionOnArrival: z.string().optional(),
  reactionDuringAnamnesis: z.string().optional(),
  reactionDuringEvaluation: z.string().optional(),
  hidesBehindOwner: z.boolean().optional(),
  getsRigid: z.boolean().optional(),
  sits: z.boolean().optional(),
  staysImmobile: z.boolean().optional(),
  yawning: z.boolean().optional(),
  licking: z.boolean().optional(),
  stretching: z.boolean().optional(),
  turnHeadAway: z.boolean().optional(),
  blinking: z.boolean().optional(),
  sniffing: z.boolean().optional(),
  tailPosition: z.string().optional(),
  headPosition: z.string().optional(),
  earPosition: z.string().optional(),
  eyePosition: z.string().optional(),
  symmetry: z.string().optional(),
  breathing: z.string().optional(),
  rolling: z.boolean().optional(),
  crouching: z.boolean().optional(),
});

type ObservationsFormData = z.infer<typeof observationsSchema>;

interface ObservationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dog: any;
}

export default function ObservationsModal({ 
  open, 
  onOpenChange, 
  dog 
}: ObservationsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ObservationsFormData>({
    resolver: zodResolver(observationsSchema),
    defaultValues: {
      coat: "",
      physicalTemp: "",
      eyeShape: "",
      teethCondition: "",
      weight: "",
      smell: "",
      muscleTension: "",
      touchReactive: "",
      salivating: false,
      sweatingPaws: false,
      shedding: false,
      balance: "",
      gait: "",
      speed: "",
      coordination: "",
      leashComfort: "",
      leashPulling: false,
      leashReactive: false,
      leashAggressive: false,
      leashComfortOther: "",
      leashPullingOther: false,
      leashReactiveOther: false,
      leashAggressiveOther: false,
      reactionOnArrival: "",
      reactionDuringAnamnesis: "",
      reactionDuringEvaluation: "",
      hidesBehindOwner: false,
      getsRigid: false,
      sits: false,
      staysImmobile: false,
      yawning: false,
      licking: false,
      stretching: false,
      turnHeadAway: false,
      blinking: false,
      sniffing: false,
      tailPosition: "",
      headPosition: "",
      earPosition: "",
      eyePosition: "",
      symmetry: "",
      breathing: "",
      rolling: false,
      crouching: false,
    },
  });

  useEffect(() => {
    if (open && dog) {
      form.reset({
        coat: dog.coat || "",
        physicalTemp: dog.physicalTemp || "",
        eyeShape: dog.eyeShape || "",
        teethCondition: dog.teethCondition || "",
        weight: dog.weight || "",
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
        leashComfortOther: dog.leashComfortOther || "",
        leashPullingOther: dog.leashPullingOther || false,
        leashReactiveOther: dog.leashReactiveOther || false,
        leashAggressiveOther: dog.leashAggressiveOther || false,
        reactionOnArrival: dog.reactionOnArrival || "",
        reactionDuringAnamnesis: dog.reactionDuringAnamnesis || "",
        reactionDuringEvaluation: dog.reactionDuringEvaluation || "",
        hidesBehindOwner: dog.hidesBehindOwner || false,
        getsRigid: dog.getsRigid || false,
        sits: dog.sits || false,
        staysImmobile: dog.staysImmobile || false,
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
    }
  }, [open, dog, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ObservationsFormData) => {
      const response = await apiRequest("PUT", `/api/dogs/${dog.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs", dog.id] });
      
      toast({
        title: "Observaciones actualizadas",
        description: "Los datos de observación han sido guardados exitosamente.",
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
        description: "No se pudieron guardar las observaciones.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ObservationsFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" data-testid="dialog-observations">
        <DialogHeader>
          <DialogTitle>Editar Observaciones - {dog?.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] pr-4">
              <Tabs defaultValue="fisicas" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="fisicas" className="text-xs">Físicas</TabsTrigger>
                  <TabsTrigger value="correa" className="text-xs">Correa</TabsTrigger>
                  <TabsTrigger value="reacciones" className="text-xs">Reacciones</TabsTrigger>
                  <TabsTrigger value="postura" className="text-xs">Postura</TabsTrigger>
                </TabsList>

                <TabsContent value="fisicas" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-green-600">Características Físicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="coat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pelaje</FormLabel>
                            <FormControl>
                              <Input placeholder="Descripción del pelaje" {...field} value={field.value || ""} />
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
                            <FormLabel>Peso</FormLabel>
                            <FormControl>
                              <Input placeholder="Peso en kg" {...field} value={field.value || ""} />
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
                              <Input placeholder="Normal, elevada..." {...field} value={field.value || ""} />
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
                            <FormLabel>Ojos</FormLabel>
                            <FormControl>
                              <Input placeholder="Redondos, tensos..." {...field} value={field.value || ""} />
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
                            <FormLabel>Dientes</FormLabel>
                            <FormControl>
                              <Input placeholder="Estado dental..." {...field} value={field.value || ""} />
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
                              <Input placeholder="Normal, fuerte..." {...field} value={field.value || ""} />
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
                              <Input placeholder="Relajado, tenso..." {...field} value={field.value || ""} />
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
                              <Input placeholder="Sí, no, a veces..." {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="salivating"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Salivando</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sweatingPaws"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Patas Sudando</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shedding"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Muda de Pelo</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-indigo-600">Movimiento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="balance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equilibrio</FormLabel>
                            <FormControl>
                              <Input placeholder="Bueno, deficiente..." {...field} value={field.value || ""} />
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
                            <FormLabel>Normal/Cojea</FormLabel>
                            <FormControl>
                              <Input placeholder="Normal, cojea..." {...field} value={field.value || ""} />
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
                              <Input placeholder="Rápido, lento..." {...field} value={field.value || ""} />
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
                              <Input placeholder="Buena, deficiente..." {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="correa" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-cyan-600">Correa - Con el Dueño</h3>
                    <FormField
                      control={form.control}
                      name="leashComfort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Se siente seguro?</FormLabel>
                          <FormControl>
                            <Input placeholder="Sí, no, a veces..." {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="leashPulling"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>¿Jala?</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="leashReactive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>¿Se pone reactivo?</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="leashAggressive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>¿Agresivo?</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-teal-600">Correa - Con Otra Persona</h3>
                    <FormField
                      control={form.control}
                      name="leashComfortOther"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Se siente seguro?</FormLabel>
                          <FormControl>
                            <Input placeholder="Sí, no, a veces..." {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="leashPullingOther"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>¿Jala?</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="leashReactiveOther"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>¿Se pone reactivo?</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="leashAggressiveOther"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>¿Agresivo?</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reacciones" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-amber-600">Reacciones durante Evaluación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reactionOnArrival"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reacción al Llegar</FormLabel>
                            <FormControl>
                              <Input placeholder="Tranquilo, ansioso..." {...field} value={field.value || ""} />
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
                            <FormLabel>Durante Anamnesis</FormLabel>
                            <FormControl>
                              <Input placeholder="Calmado, nervioso..." {...field} value={field.value || ""} />
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
                            <FormLabel>Durante Evaluación Directa</FormLabel>
                            <FormControl>
                              <Input placeholder="Cooperativo, resistente..." {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="hidesBehindOwner"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-xs">Se esconde detrás del dueño</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="getsRigid"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-xs">Se pone rígido</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sits"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-xs">Se sienta</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="staysImmobile"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-xs">Se queda inmóvil</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-blue-600">Señales de Calma</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="yawning"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Bostezar</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="licking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Lamerse</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stretching"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Estirarse</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="turnHeadAway"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Girar la cabeza</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="blinking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Parpadear</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sniffing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Olfatear</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="postura" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-purple-600">Postura Detallada</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tailPosition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posición de la Cola</FormLabel>
                            <FormControl>
                              <Input placeholder="Alta, baja, entre las patas..." {...field} value={field.value || ""} />
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
                              <Input placeholder="Alta, baja, neutral..." {...field} value={field.value || ""} />
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
                              <Input placeholder="Erguidas, hacia atrás..." {...field} value={field.value || ""} />
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
                              <Input placeholder="Directos, evasivos..." {...field} value={field.value || ""} />
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
                              <Input placeholder="Simétrico, asimétrico..." {...field} value={field.value || ""} />
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
                              <Input placeholder="Normal, agitada, lenta..." {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rolling"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Se revuelca</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="crouching"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Se agacha</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-observations"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                data-testid="button-save-observations"
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar Observaciones"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
