import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Dog, 
  User, 
  Phone,
  Mail,
  Calendar,
  Weight,
  Ruler,
  Stethoscope,
  BookOpen,
  Camera,
  Activity,
  Plus,
  Edit,
  Trash2,
  FileText
} from "lucide-react";
import { Link } from "wouter";
import { MedicalRecordModal } from "@/components/MedicalRecordModal";
import { TrainingSessionModal } from "@/components/TrainingSessionModal";
import { EvidenceModal } from "@/components/EvidenceModal";

export default function RecordDetail() {
  const [match, params] = useRoute("/records/:dogId");
  const dogId = params?.dogId;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get dog complete record
  const { data: record, isLoading: recordLoading, error } = useQuery({
    queryKey: ["/api/dogs", dogId, "record"],
    enabled: !!dogId,
  });

  // Get medical records
  const { data: medicalRecords, isLoading: medicalLoading } = useQuery({
    queryKey: ["/api/dogs", dogId, "medical-records"],
    enabled: !!dogId,
  });

  // Get training sessions
  const { data: trainingSessions, isLoading: trainingLoading } = useQuery({
    queryKey: ["/api/dogs", dogId, "training-sessions"],
    enabled: !!dogId,
  });

  // Get evidence
  const { data: evidence, isLoading: evidenceLoading } = useQuery({
    queryKey: ["/api/dogs", dogId, "evidence"],
    enabled: !!dogId,
  });

  const [activeTab, setActiveTab] = useState("overview");

  // Set active tab from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  // Handler functions for buttons - these will be replaced with modal triggers

  if (recordLoading || !record) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/records">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-32 h-32 bg-muted rounded-full mx-auto"></div>
                  <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/records">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error al cargar el expediente
            </h3>
            <p className="text-muted-foreground mb-4">
              No se pudo encontrar el expediente de esta mascota
            </p>
            <Link href="/records">
              <Button>
                Volver a Expedientes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dog = record?.dog || null;
  const client = record?.client || null;
  const appointments = record?.appointments || [];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/records">
            <Button variant="ghost" size="sm" data-testid="button-back-to-records">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="record-title">
              Expediente de {dog.name}
            </h1>
            <p className="text-muted-foreground">
              Propietario: {client?.firstName} {client?.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dog Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dog className="w-5 h-5" />
                Datos Generales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dog Photo */}
              <div className="text-center">
                {dog.imageUrl ? (
                  <img
                    src={dog.imageUrl}
                    alt={dog.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-border mx-auto"
                    data-testid="dog-image"
                  />
                ) : (
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Dog className="w-16 h-16 text-primary" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-foreground mt-4" data-testid="dog-name">
                  {dog.name}
                </h3>
                <div className="flex justify-center gap-2 mt-2">
                  {dog.breed && (
                    <Badge variant="outline">
                      {dog.breed}
                    </Badge>
                  )}
                  {dog.age && (
                    <Badge variant="outline">
                      {dog.age} años
                    </Badge>
                  )}
                </div>
              </div>

              {/* Dog Details */}
              <div className="space-y-4">
                {dog.weight && (
                  <div className="flex items-center gap-3">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Peso:</strong> {dog.weight} kg
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Registrado:</strong> {new Date(dog.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              {/* Owner Information */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Información del Propietario</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm" data-testid="owner-name">
                      {client?.firstName} {client?.lastName}
                    </span>
                  </div>
                  {client?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm" data-testid="owner-email">
                        {client.email}
                      </span>
                    </div>
                  )}
                  {client?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm" data-testid="owner-phone">
                        {client.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {dog.notes && (
                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-3">Notas Generales</h4>
                  <p className="text-sm text-muted-foreground" data-testid="dog-notes">
                    {dog.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <Activity className="w-4 h-4 mr-2" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="medical" data-testid="tab-medical">
                <Stethoscope className="w-4 h-4 mr-2" />
                Médico
              </TabsTrigger>
              <TabsTrigger value="training" data-testid="tab-training">
                <BookOpen className="w-4 h-4 mr-2" />
                Entrenamientos
              </TabsTrigger>
              <TabsTrigger value="evidence" data-testid="tab-evidence">
                <Camera className="w-4 h-4 mr-2" />
                Evidencias
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-foreground">
                          {Array.isArray(medicalRecords) ? medicalRecords.length : 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Registros Médicos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-foreground">
                          {Array.isArray(trainingSessions) ? trainingSessions.length : 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Entrenamientos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-foreground">
                          {Array.isArray(evidence) ? evidence.length : 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Evidencias</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Service History */}
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Servicios</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(appointments) && appointments.length > 0 ? (
                    <div className="space-y-3">
                      {appointments.slice(0, 5).map((appointment: any) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              appointment.status === 'completed' ? 'bg-green-500' :
                              appointment.status === 'confirmed' ? 'bg-blue-500' :
                              appointment.status === 'cancelled' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <div>
                              <p className="font-medium text-foreground">
                                {appointment.service.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(appointment.appointmentDate).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ${Number(appointment.price).toLocaleString()}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {appointment.status === 'completed' ? 'Completado' :
                               appointment.status === 'confirmed' ? 'Confirmado' :
                               appointment.status === 'cancelled' ? 'Cancelado' :
                               'Pendiente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {appointments.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center pt-2">
                          Y {appointments.length - 5} servicios más...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No hay servicios registrados
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical Tab */}
            <TabsContent value="medical" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Registros Médicos</h3>
                <MedicalRecordModal 
                  dogId={dogId!}
                  trigger={
                    <Button size="sm" data-testid="button-add-medical-record">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Registro
                    </Button>
                  }
                />
              </div>

              {medicalLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : Array.isArray(medicalRecords) && medicalRecords.length > 0 ? (
                <div className="space-y-4">
                  {medicalRecords.map((record: any) => (
                    <Card key={record.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{record.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.recordDate).toLocaleDateString('es-ES')}
                              {record.veterinarian && ` • Dr. ${record.veterinarian}`}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {record.recordType}
                          </Badge>
                        </div>
                        {record.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {record.description}
                          </p>
                        )}
                        {record.medications && (
                          <div className="bg-muted/50 rounded p-3">
                            <p className="text-sm">
                              <strong>Medicamentos:</strong> {record.medications}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No hay registros médicos
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comienza agregando el primer registro médico
                    </p>
                    <MedicalRecordModal 
                      dogId={dogId!}
                      trigger={
                        <Button data-testid="button-first-medical-record">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primer Registro
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Training Tab */}
            <TabsContent value="training" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Sesiones de Entrenamiento</h3>
                <TrainingSessionModal 
                  dogId={dogId!}
                  trigger={
                    <Button size="sm" data-testid="button-add-training-session">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Sesión
                    </Button>
                  }
                />
              </div>

              {trainingLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : Array.isArray(trainingSessions) && trainingSessions.length > 0 ? (
                <div className="space-y-4">
                  {trainingSessions.map((session: any) => (
                    <Card key={session.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{session.objective}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.sessionDate).toLocaleDateString('es-ES')}
                              {session.trainer && ` • ${session.trainer}`}
                              {session.duration && ` • ${session.duration} min`}
                            </p>
                          </div>
                          {session.rating && (
                            <Badge variant="outline">
                              ⭐ {session.rating}/10
                            </Badge>
                          )}
                        </div>
                        {session.progress && (
                          <p className="text-sm text-muted-foreground mb-3">
                            <strong>Progreso:</strong> {session.progress}
                          </p>
                        )}
                        {session.nextSteps && (
                          <div className="bg-muted/50 rounded p-3">
                            <p className="text-sm">
                              <strong>Próximos pasos:</strong> {session.nextSteps}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No hay sesiones de entrenamiento
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comienza registrando la primera sesión de entrenamiento
                    </p>
                    <TrainingSessionModal 
                      dogId={dogId!}
                      trigger={
                        <Button data-testid="button-first-training-session">
                          <Plus className="w-4 h-4 mr-2" />
                          Registrar Primera Sesión
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Evidence Tab */}
            <TabsContent value="evidence" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Evidencias</h3>
                <EvidenceModal 
                  dogId={dogId!}
                  trigger={
                    <Button size="sm" data-testid="button-add-evidence">
                      <Plus className="w-4 h-4 mr-2" />
                      Subir Evidencia
                    </Button>
                  }
                />
              </div>

              {evidenceLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="h-24 bg-muted rounded"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : Array.isArray(evidence) && evidence.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {evidence.map((item: any) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded mb-3 flex items-center justify-center">
                          {item.type === 'photo' ? (
                            <Camera className="w-8 h-8 text-muted-foreground" />
                          ) : item.type === 'video' ? (
                            <Activity className="w-8 h-8 text-muted-foreground" />
                          ) : (
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(item.createdAt).toLocaleDateString('es-ES')}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No hay evidencias
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Sube fotos, videos o documentos relacionados con esta mascota
                    </p>
                    <EvidenceModal 
                      dogId={dogId!}
                      trigger={
                        <Button data-testid="button-first-evidence">
                          <Plus className="w-4 h-4 mr-2" />
                          Subir Primera Evidencia
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}