import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, Frown, Meh, Smile, Laugh, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const assessmentFormSchema = z.object({
  assessmentDate: z.date(),
  reactionArrivalHidesBehind: z.number().min(1).max(5).optional().nullable(),
  reactionArrivalRigid: z.number().min(1).max(5).optional().nullable(),
  reactionArrivalSits: z.number().min(1).max(5).optional().nullable(),
  reactionArrivalImmobile: z.number().min(1).max(5).optional().nullable(),
  reactionAnamnesisHidesBehind: z.number().min(1).max(5).optional().nullable(),
  reactionAnamnesisRigid: z.number().min(1).max(5).optional().nullable(),
  reactionAnamnesisSits: z.number().min(1).max(5).optional().nullable(),
  reactionAnamnesisImmobile: z.number().min(1).max(5).optional().nullable(),
  reactionEvalHidesBehind: z.number().min(1).max(5).optional().nullable(),
  reactionEvalRigid: z.number().min(1).max(5).optional().nullable(),
  reactionEvalSits: z.number().min(1).max(5).optional().nullable(),
  reactionEvalImmobile: z.number().min(1).max(5).optional().nullable(),
  reactionComments: z.string().optional().nullable(),
  physCoat: z.number().min(1).max(5).optional().nullable(),
  physTemperature: z.number().min(1).max(5).optional().nullable(),
  physEyes: z.number().min(1).max(5).optional().nullable(),
  physTeeth: z.number().min(1).max(5).optional().nullable(),
  physWeight: z.number().min(1).max(5).optional().nullable(),
  physSmell: z.number().min(1).max(5).optional().nullable(),
  physMuscleTension: z.number().min(1).max(5).optional().nullable(),
  physTouchReactive: z.number().min(1).max(5).optional().nullable(),
  physSalivating: z.number().min(1).max(5).optional().nullable(),
  physSweatingPaws: z.number().min(1).max(5).optional().nullable(),
  physShedding: z.number().min(1).max(5).optional().nullable(),
  physComments: z.string().optional().nullable(),
  movBalance: z.number().min(1).max(5).optional().nullable(),
  movGait: z.number().min(1).max(5).optional().nullable(),
  movSpeed: z.number().min(1).max(5).optional().nullable(),
  movCoordination: z.number().min(1).max(5).optional().nullable(),
  movComments: z.string().optional().nullable(),
  leashOwnerSecure: z.number().min(1).max(5).optional().nullable(),
  leashOwnerPulls: z.number().min(1).max(5).optional().nullable(),
  leashOwnerReactive: z.number().min(1).max(5).optional().nullable(),
  leashOwnerAggressive: z.number().min(1).max(5).optional().nullable(),
  leashOtherSecure: z.number().min(1).max(5).optional().nullable(),
  leashOtherPulls: z.number().min(1).max(5).optional().nullable(),
  leashOtherReactive: z.number().min(1).max(5).optional().nullable(),
  leashOtherAggressive: z.number().min(1).max(5).optional().nullable(),
  leashComments: z.string().optional().nullable(),
  calmYawning: z.number().min(1).max(5).optional().nullable(),
  calmLicking: z.number().min(1).max(5).optional().nullable(),
  calmStretching: z.number().min(1).max(5).optional().nullable(),
  calmTurnHead: z.number().min(1).max(5).optional().nullable(),
  calmBlinking: z.number().min(1).max(5).optional().nullable(),
  calmSniffing: z.number().min(1).max(5).optional().nullable(),
  interactionStrangers: z.number().min(1).max(5).optional().nullable(),
  interactionOtherDogs: z.number().min(1).max(5).optional().nullable(),
  interactionComments: z.string().optional().nullable(),
  postureTail: z.number().min(1).max(5).optional().nullable(),
  postureHead: z.number().min(1).max(5).optional().nullable(),
  postureEars: z.number().min(1).max(5).optional().nullable(),
  postureEyes: z.number().min(1).max(5).optional().nullable(),
  postureBalance: z.number().min(1).max(5).optional().nullable(),
  postureSymmetry: z.number().min(1).max(5).optional().nullable(),
  postureBreathing: z.number().min(1).max(5).optional().nullable(),
  postureRolling: z.number().min(1).max(5).optional().nullable(),
  postureCrouching: z.number().min(1).max(5).optional().nullable(),
  postureComments: z.string().optional().nullable(),
  generalNotes: z.string().optional().nullable(),
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

interface AssessmentModalProps {
  dogId: string;
  dogName: string;
  isOpen: boolean;
  onClose: () => void;
  assessment?: any;
}

const RatingFaces = ({ value, onChange }: { value: number | null | undefined; onChange: (val: number | null) => void }) => {
  const faces = [
    { icon: Frown, label: "1 - Muy incómodo", color: "text-red-500", bgColor: "bg-red-100", hoverBg: "hover:bg-red-200" },
    { icon: Meh, label: "2 - Incómodo", color: "text-orange-500", bgColor: "bg-orange-100", hoverBg: "hover:bg-orange-200" },
    { icon: Smile, label: "3 - Neutral", color: "text-yellow-500", bgColor: "bg-yellow-100", hoverBg: "hover:bg-yellow-200" },
    { icon: Laugh, label: "4 - Cómodo", color: "text-lime-500", bgColor: "bg-lime-100", hoverBg: "hover:bg-lime-200" },
    { icon: Heart, label: "5 - Muy relajado", color: "text-green-500", bgColor: "bg-green-100", hoverBg: "hover:bg-green-200" },
  ];

  return (
    <div className="flex gap-1">
      {faces.map((face, index) => {
        const ratingValue = index + 1;
        const isSelected = value === ratingValue;
        const Icon = face.icon;
        return (
          <button
            key={ratingValue}
            type="button"
            onClick={() => onChange(isSelected ? null : ratingValue)}
            className={cn(
              "p-1.5 rounded-full transition-all",
              isSelected ? `${face.bgColor} ${face.color} ring-2 ring-offset-1 ring-current` : `text-gray-400 ${face.hoverBg}`
            )}
            title={face.label}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
};

const RatingField = ({ 
  name, 
  label, 
  control 
}: { 
  name: keyof AssessmentFormValues; 
  label: string; 
  control: any;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="flex flex-row items-center justify-between py-2 border-b border-gray-100">
        <FormLabel className="text-sm font-medium text-gray-700 flex-1">{label}</FormLabel>
        <FormControl>
          <RatingFaces 
            value={field.value as number | null | undefined} 
            onChange={field.onChange} 
          />
        </FormControl>
      </FormItem>
    )}
  />
);

const SectionHeader = ({ title, color }: { title: string; color: string }) => (
  <div className={`${color} px-3 py-2 rounded-lg mb-3 mt-4`}>
    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
  </div>
);

const SubSectionHeader = ({ title }: { title: string }) => (
  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-3 mb-2">
    {title}
  </div>
);

export function AssessmentModal({ dogId, dogName, isOpen, onClose, assessment }: AssessmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      assessmentDate: assessment?.assessmentDate ? new Date(assessment.assessmentDate) : new Date(),
      reactionArrivalHidesBehind: assessment?.reactionArrivalHidesBehind ?? null,
      reactionArrivalRigid: assessment?.reactionArrivalRigid ?? null,
      reactionArrivalSits: assessment?.reactionArrivalSits ?? null,
      reactionArrivalImmobile: assessment?.reactionArrivalImmobile ?? null,
      reactionAnamnesisHidesBehind: assessment?.reactionAnamnesisHidesBehind ?? null,
      reactionAnamnesisRigid: assessment?.reactionAnamnesisRigid ?? null,
      reactionAnamnesisSits: assessment?.reactionAnamnesisSits ?? null,
      reactionAnamnesisImmobile: assessment?.reactionAnamnesisImmobile ?? null,
      reactionEvalHidesBehind: assessment?.reactionEvalHidesBehind ?? null,
      reactionEvalRigid: assessment?.reactionEvalRigid ?? null,
      reactionEvalSits: assessment?.reactionEvalSits ?? null,
      reactionEvalImmobile: assessment?.reactionEvalImmobile ?? null,
      reactionComments: assessment?.reactionComments ?? "",
      physCoat: assessment?.physCoat ?? null,
      physTemperature: assessment?.physTemperature ?? null,
      physEyes: assessment?.physEyes ?? null,
      physTeeth: assessment?.physTeeth ?? null,
      physWeight: assessment?.physWeight ?? null,
      physSmell: assessment?.physSmell ?? null,
      physMuscleTension: assessment?.physMuscleTension ?? null,
      physTouchReactive: assessment?.physTouchReactive ?? null,
      physSalivating: assessment?.physSalivating ?? null,
      physSweatingPaws: assessment?.physSweatingPaws ?? null,
      physShedding: assessment?.physShedding ?? null,
      physComments: assessment?.physComments ?? "",
      movBalance: assessment?.movBalance ?? null,
      movGait: assessment?.movGait ?? null,
      movSpeed: assessment?.movSpeed ?? null,
      movCoordination: assessment?.movCoordination ?? null,
      movComments: assessment?.movComments ?? "",
      leashOwnerSecure: assessment?.leashOwnerSecure ?? null,
      leashOwnerPulls: assessment?.leashOwnerPulls ?? null,
      leashOwnerReactive: assessment?.leashOwnerReactive ?? null,
      leashOwnerAggressive: assessment?.leashOwnerAggressive ?? null,
      leashOtherSecure: assessment?.leashOtherSecure ?? null,
      leashOtherPulls: assessment?.leashOtherPulls ?? null,
      leashOtherReactive: assessment?.leashOtherReactive ?? null,
      leashOtherAggressive: assessment?.leashOtherAggressive ?? null,
      leashComments: assessment?.leashComments ?? "",
      calmYawning: assessment?.calmYawning ?? null,
      calmLicking: assessment?.calmLicking ?? null,
      calmStretching: assessment?.calmStretching ?? null,
      calmTurnHead: assessment?.calmTurnHead ?? null,
      calmBlinking: assessment?.calmBlinking ?? null,
      calmSniffing: assessment?.calmSniffing ?? null,
      interactionStrangers: assessment?.interactionStrangers ?? null,
      interactionOtherDogs: assessment?.interactionOtherDogs ?? null,
      interactionComments: assessment?.interactionComments ?? "",
      postureTail: assessment?.postureTail ?? null,
      postureHead: assessment?.postureHead ?? null,
      postureEars: assessment?.postureEars ?? null,
      postureEyes: assessment?.postureEyes ?? null,
      postureBalance: assessment?.postureBalance ?? null,
      postureSymmetry: assessment?.postureSymmetry ?? null,
      postureBreathing: assessment?.postureBreathing ?? null,
      postureRolling: assessment?.postureRolling ?? null,
      postureCrouching: assessment?.postureCrouching ?? null,
      postureComments: assessment?.postureComments ?? "",
      generalNotes: assessment?.generalNotes ?? "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AssessmentFormValues) => {
      const url = assessment ? `/api/assessments/${assessment.id}` : '/api/assessments';
      const method = assessment ? 'PUT' : 'POST';
      const cleanData = Object.fromEntries(
        Object.entries({ ...data, dogId }).filter(([_, v]) => v !== null && v !== "")
      );
      return apiRequest(method, url, cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dogs', dogId, 'assessments'] });
      toast({
        title: assessment ? "Evaluación actualizada" : "Evaluación creada",
        description: `La evaluación de ${dogName} ha sido ${assessment ? 'actualizada' : 'guardada'} exitosamente.`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la evaluación. Intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssessmentFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {assessment ? "Editar" : "Nueva"} Evaluación de Valoración - {dogName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[calc(90vh-180px)] pr-4">
              <div className="space-y-1">
                <FormField
                  control={form.control}
                  name="assessmentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mb-4">
                      <FormLabel>Fecha de Evaluación</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                <SectionHeader title="LA REACCIÓN" color="bg-amber-100" />
                
                <SubSectionHeader title="Al Llegar" />
                <RatingField name="reactionArrivalHidesBehind" label="Se esconde detrás del dueño" control={form.control} />
                <RatingField name="reactionArrivalRigid" label="Se pone rígido" control={form.control} />
                <RatingField name="reactionArrivalSits" label="Se sienta" control={form.control} />
                <RatingField name="reactionArrivalImmobile" label="Se queda inmóvil" control={form.control} />
                
                <SubSectionHeader title="Durante Anamnesis" />
                <RatingField name="reactionAnamnesisHidesBehind" label="Se esconde detrás del dueño" control={form.control} />
                <RatingField name="reactionAnamnesisRigid" label="Se pone rígido" control={form.control} />
                <RatingField name="reactionAnamnesisSits" label="Se sienta" control={form.control} />
                <RatingField name="reactionAnamnesisImmobile" label="Se queda inmóvil" control={form.control} />
                
                <SubSectionHeader title="Durante Evaluación" />
                <RatingField name="reactionEvalHidesBehind" label="Se esconde detrás del dueño" control={form.control} />
                <RatingField name="reactionEvalRigid" label="Se pone rígido" control={form.control} />
                <RatingField name="reactionEvalSits" label="Se sienta" control={form.control} />
                <RatingField name="reactionEvalImmobile" label="Se queda inmóvil" control={form.control} />
                
                <FormField
                  control={form.control}
                  name="reactionComments"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel className="text-xs">Comentarios de Reacción</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observaciones..." className="min-h-[60px]" {...field} value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <SectionHeader title="CARACTERÍSTICAS FÍSICAS" color="bg-green-100" />
                <RatingField name="physCoat" label="Pelaje" control={form.control} />
                <RatingField name="physTemperature" label="Temperatura" control={form.control} />
                <RatingField name="physEyes" label="Ojos" control={form.control} />
                <RatingField name="physTeeth" label="Dientes" control={form.control} />
                <RatingField name="physWeight" label="Peso" control={form.control} />
                <RatingField name="physSmell" label="Olor" control={form.control} />
                <RatingField name="physMuscleTension" label="Tensión muscular" control={form.control} />
                <RatingField name="physTouchReactive" label="Reactividad al tacto" control={form.control} />
                <RatingField name="physSalivating" label="Salivación" control={form.control} />
                <RatingField name="physSweatingPaws" label="Patas sudando" control={form.control} />
                <RatingField name="physShedding" label="Muda de pelo" control={form.control} />
                
                <FormField
                  control={form.control}
                  name="physComments"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel className="text-xs">Comentarios Físicos</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observaciones..." className="min-h-[60px]" {...field} value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <SectionHeader title="MOVIMIENTO" color="bg-indigo-100" />
                <RatingField name="movBalance" label="Equilibrio" control={form.control} />
                <RatingField name="movGait" label="Marcha (normal/cojea)" control={form.control} />
                <RatingField name="movSpeed" label="Rapidez" control={form.control} />
                <RatingField name="movCoordination" label="Coordinación" control={form.control} />
                
                <FormField
                  control={form.control}
                  name="movComments"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel className="text-xs">Comentarios de Movimiento</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observaciones..." className="min-h-[60px]" {...field} value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <SectionHeader title="CORREA - Con el Dueño" color="bg-cyan-100" />
                <RatingField name="leashOwnerSecure" label="Seguridad" control={form.control} />
                <RatingField name="leashOwnerPulls" label="Jala la correa" control={form.control} />
                <RatingField name="leashOwnerReactive" label="Reactivo" control={form.control} />
                <RatingField name="leashOwnerAggressive" label="Agresivo" control={form.control} />

                <SectionHeader title="CORREA - Con Otra Persona" color="bg-teal-100" />
                <RatingField name="leashOtherSecure" label="Seguridad" control={form.control} />
                <RatingField name="leashOtherPulls" label="Jala la correa" control={form.control} />
                <RatingField name="leashOtherReactive" label="Reactivo" control={form.control} />
                <RatingField name="leashOtherAggressive" label="Agresivo" control={form.control} />
                
                <FormField
                  control={form.control}
                  name="leashComments"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel className="text-xs">Comentarios de Correa</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observaciones..." className="min-h-[60px]" {...field} value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <SectionHeader title="SEÑALES DE CALMA" color="bg-blue-100" />
                <RatingField name="calmYawning" label="Bostezar" control={form.control} />
                <RatingField name="calmLicking" label="Lamerse" control={form.control} />
                <RatingField name="calmStretching" label="Estirarse" control={form.control} />
                <RatingField name="calmTurnHead" label="Girar la cabeza" control={form.control} />
                <RatingField name="calmBlinking" label="Parpadear" control={form.control} />
                <RatingField name="calmSniffing" label="Olfatear" control={form.control} />

                <SectionHeader title="INTERACCIÓN SOCIAL" color="bg-pink-100" />
                <RatingField name="interactionStrangers" label="Reacción a extraños" control={form.control} />
                <RatingField name="interactionOtherDogs" label="Reacción a otros perros" control={form.control} />
                
                <FormField
                  control={form.control}
                  name="interactionComments"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel className="text-xs">Comentarios de Interacción</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observaciones..." className="min-h-[60px]" {...field} value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <SectionHeader title="POSTURA" color="bg-purple-100" />
                <RatingField name="postureTail" label="Posición de cola" control={form.control} />
                <RatingField name="postureHead" label="Posición de cabeza" control={form.control} />
                <RatingField name="postureEars" label="Posición de orejas" control={form.control} />
                <RatingField name="postureEyes" label="Posición de ojos" control={form.control} />
                <RatingField name="postureBalance" label="Equilibrio postural" control={form.control} />
                <RatingField name="postureSymmetry" label="Simetría" control={form.control} />
                <RatingField name="postureBreathing" label="Patrón de respiración" control={form.control} />
                <RatingField name="postureRolling" label="Se revuelca" control={form.control} />
                <RatingField name="postureCrouching" label="Se agacha" control={form.control} />
                
                <FormField
                  control={form.control}
                  name="postureComments"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel className="text-xs">Comentarios de Postura</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observaciones..." className="min-h-[60px]" {...field} value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />

                <FormField
                  control={form.control}
                  name="generalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Generales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones adicionales sobre la evaluación..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Guardando..." : (assessment ? "Actualizar" : "Guardar")} Evaluación
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}