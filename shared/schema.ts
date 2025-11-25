import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  varchar,
  timestamp,
  decimal,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
// User roles enum
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "teacher", 
  "client"
]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // Optional temporarily for migration
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("client").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Register schema (only for first admin)
export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(8),
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Clients table (customers of the business)
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Link to user account for portal access
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Pet Types table
export const petTypes = pgTable("pet_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PetType = typeof petTypes.$inferSelect;
export type InsertPetType = typeof petTypes.$inferInsert;

export const insertPetTypeSchema = createInsertSchema(petTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Dogs table
export const dogs = pgTable("dogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  petTypeId: varchar("pet_type_id").references(() => petTypes.id).notNull(),
  name: varchar("name").notNull(),
  breed: varchar("breed"),
  age: integer("age"),
  weight: decimal("weight"),
  notes: text("notes"),
  imageUrl: varchar("image_url"), // URL to the dog's photo in object storage
  
  // Expediente - Objetivos
  problemDescription: text("problem_description"),
  trainingObjectives: text("training_objectives"),
  
  // Expediente - Antecedentes
  acquisitionSource: text("acquisition_source"), // De dónde se adquirió
  arrivalAge: varchar("arrival_age"), // Edad de llegada
  canineFamily: text("canine_family"), // Familia canina
  
  // Expediente - Rutina
  dailyRoutine: text("daily_routine"), // Día a día
  feedingSchedule: text("feeding_schedule"), // Comida
  
  // Expediente - Salud
  veterinarian: varchar("veterinarian"), // Médico
  vaccines: text("vaccines"), // Vacunas
  diseases: text("diseases"), // Enfermedades
  diseasePredisposition: text("disease_predisposition"), // Predisposición a enfermedades
  
  // Expediente - Comportamiento
  fears: text("fears"), // Miedos
  aggression: text("aggression"), // Agresión
  hyperactivity: text("hyperactivity"), // Hiperactividad
  destruction: text("destruction"), // Destrucción
  reactivity: text("reactivity"), // Reactividad
  anxiety: text("anxiety"), // Ansiedad
  hypersensitivity: text("hypersensitivity"), // Hipersensibilidad
  otherBehaviors: text("other_behaviors"), // Otros
  
  // Expediente - Observaciones del Perro
  coat: text("coat"), // Pelaje
  posture: text("posture"), // Postura
  eyeShape: text("eye_shape"), // Forma de ojos
  bodyMovement: text("body_movement"), // Movimiento del cuerpo
  physicalTemp: text("physical_temp"), // Temperatura
  teethCondition: text("teeth_condition"), // Dientes
  smell: text("smell"), // Olor
  muscleTension: text("muscle_tension"), // Tensión muscular
  touchReactive: text("touch_reactive"), // Reactivo al tocar
  salivating: boolean("salivating").default(false), // Salivando
  sweatingPaws: boolean("sweating_paws").default(false), // Patas sudando
  shedding: boolean("shedding").default(false), // Muda de pelo
  
  // Movimiento
  balance: text("balance"), // Equilibrio
  gait: text("gait"), // Normal/cojea
  speed: text("speed"), // Rapidez
  coordination: text("coordination"), // Coordinación
  
  // Correa - Con el dueño
  leashComfort: text("leash_comfort"), // Se siente seguro con correa
  leashPulling: boolean("leash_pulling").default(false), // Jala
  leashReactive: boolean("leash_reactive").default(false), // Se pone reactivo
  leashAggressive: boolean("leash_aggressive").default(false), // Agresivo
  
  // Correa - Con otra persona
  leashComfortOther: text("leash_comfort_other"), // Se siente seguro con otra persona
  leashPullingOther: boolean("leash_pulling_other").default(false), // Jala con otra persona
  leashReactiveOther: boolean("leash_reactive_other").default(false), // Se pone reactivo con otra persona
  leashAggressiveOther: boolean("leash_aggressive_other").default(false), // Agresivo con otra persona
  
  // Interacción y Señales de Calma
  calmingSignals: text("calming_signals"), // Señales de calma observadas
  reactionToStrangers: text("reaction_to_strangers"), // Reacción con personas desconocidas
  reactionToOtherDogs: text("reaction_to_other_dogs"), // Reacción con otros perros
  
  // Observaciones adicionales
  ownerDisposition: text("owner_disposition"), // Disposición del dueño
  
  // Observaciones - Reacciones durante evaluación
  hidesBehindOwner: boolean("hides_behind_owner").default(false), // Se esconde detrás del dueño
  getsRigid: boolean("gets_rigid").default(false), // Se pone rígido
  sits: boolean("sits").default(false), // Se sienta
  staysImmobile: boolean("stays_immobile").default(false), // Se queda inmóvil
  reactionOnArrival: text("reaction_on_arrival"), // Reacción al llegar
  reactionDuringAnamnesis: text("reaction_during_anamnesis"), // Reacción durante anamnesis
  reactionDuringEvaluation: text("reaction_during_evaluation"), // Reacción durante evaluación directa
  
  // Observaciones - Señales de Calma específicas
  yawning: boolean("yawning").default(false), // Bostezar
  licking: boolean("licking").default(false), // Lamerse
  stretching: boolean("stretching").default(false), // Estirarse
  turnHeadAway: boolean("turn_head_away").default(false), // Girar la cabeza
  blinking: boolean("blinking").default(false), // Parpadear
  sniffing: boolean("sniffing").default(false), // Olfatear
  
  // Observaciones - Postura detallada
  tailPosition: text("tail_position"), // Posición de la cola
  headPosition: text("head_position"), // Posición de la cabeza
  earPosition: text("ear_position"), // Posición de orejas
  eyePosition: text("eye_position"), // Posición de ojos
  symmetry: text("symmetry"), // Simetría
  breathing: text("breathing"), // Respiración
  rolling: boolean("rolling").default(false), // Se revuelca
  crouching: boolean("crouching").default(false), // Se agacha
  
  // Protocolo activo asignado a esta mascota
  activeProtocolId: varchar("active_protocol_id"), // ID del protocolo activo (referencia manual a protocols)
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Dog = typeof dogs.$inferSelect;
export type InsertDog = typeof dogs.$inferInsert;

export const insertDogSchema = createInsertSchema(dogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Service types
export const serviceTypeEnum = pgEnum("service_type", [
  "training",
  "daycare", 
  "boarding",
  "other"
]);

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: serviceTypeEnum("type").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  duration: integer("duration"), // in minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Protocols - Training methodologies/templates
export const protocolCategoryEnum = pgEnum("protocol_category", [
  "obediencia_basica",
  "comportamiento", 
  "socializacion",
  "agilidad",
  "terapia",
  "rescate",
  "otro"
]);

export const protocols = pgTable("protocols", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: protocolCategoryEnum("category").notNull(),
  objectives: text("objectives"), // Objetivos del protocolo
  description: text("description"), // Descripción detallada
  steps: jsonb("steps"), // Pasos estructurados como array [{step: 1, title: "...", description: "..."}]
  duration: integer("duration"), // Duración estimada en minutos
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Protocol = typeof protocols.$inferSelect;
export type InsertProtocol = typeof protocols.$inferInsert;

export const insertProtocolSchema = createInsertSchema(protocols).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const protocolsRelations = relations(protocols, ({ many }) => ({
  plannedAppointments: many(appointments),
  trainingSessions: many(trainingSessions),
}));

// Appointment status
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed", 
  "completed",
  "cancelled",
  "no_show"
]);

// Progress state for appointments
export const progressStateEnum = pgEnum("progress_state", [
  "not_started",
  "in_progress",
  "completed",
  "blocked"
]);

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  dogId: varchar("dog_id").references(() => dogs.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  teacherId: varchar("teacher_id").references(() => users.id), // Assigned teacher
  plannedProtocolId: varchar("planned_protocol_id").references(() => protocols.id), // Protocolo planeado para esta cita
  appointmentDate: timestamp("appointment_date").notNull(),
  status: appointmentStatusEnum("status").default("pending"),
  progressState: progressStateEnum("progress_state").default("not_started"), // Estado de avance
  progressSummary: text("progress_summary"), // Resumen del progreso
  notes: text("notes"),
  price: decimal("price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating appointment protocol
export const updateAppointmentProtocolSchema = z.object({
  protocolId: z.string().min(1, "Protocol ID es requerido"),
});

// Schema for updating appointment progress
export const updateAppointmentProgressSchema = z.object({
  progressState: z.enum(["not_started", "in_progress", "completed", "blocked"]),
  progressSummary: z.string().optional(),
});

// Invoices
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled"
]);

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").default("draft"),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  invoiceNumber: true,
  createdAt: true,
  updatedAt: true,
});

// Invoice items
export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id).notNull(),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  serviceId: varchar("service_id").references(() => services.id),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

// Expenses
export const expenseCategories = pgEnum("expense_category", [
  "supplies",
  "utilities", 
  "salaries",
  "rent",
  "marketing",
  "maintenance",
  "other"
]);

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: expenseCategories("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: timestamp("expense_date").notNull(),
  receipt: text("receipt"), // File path or URL
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Progress tracking
export const progressEntries = pgTable("progress_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").references(() => dogs.id).notNull(),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  createdById: varchar("created_by_id").references(() => users.id), // Quién registró este progreso
  status: progressStateEnum("status"), // Estado del progreso en este momento
  title: varchar("title").notNull(),
  description: text("description"),
  photos: text("photos").array(), // Array of photo URLs/paths
  videos: text("videos").array(), // Array of video URLs/paths
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ProgressEntry = typeof progressEntries.$inferSelect;
export type InsertProgressEntry = typeof progressEntries.$inferInsert;

export const insertProgressEntrySchema = createInsertSchema(progressEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  client: one(clients, {
    fields: [users.id],
    references: [clients.userId],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  dogs: many(dogs),
  appointments: many(appointments),
  invoices: many(invoices),
}));

export const dogsRelations = relations(dogs, ({ one, many }) => ({
  client: one(clients, {
    fields: [dogs.clientId],
    references: [clients.id],
  }),
  petType: one(petTypes, {
    fields: [dogs.petTypeId],
    references: [petTypes.id],
  }),
  appointments: many(appointments),
  progressEntries: many(progressEntries),
  medicalRecords: many(medicalRecords),
  trainingSessions: many(trainingSessions),
  evidence: many(evidence),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  appointments: many(appointments),
  invoiceItems: many(invoiceItems),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  dog: one(dogs, {
    fields: [appointments.dogId],
    references: [dogs.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  teacher: one(users, {
    fields: [appointments.teacherId],
    references: [users.id],
  }),
  plannedProtocol: one(protocols, {
    fields: [appointments.plannedProtocolId],
    references: [protocols.id],
  }),
  invoiceItems: many(invoiceItems),
  progressEntries: many(progressEntries),
  attendance: many(attendance),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  appointment: one(appointments, {
    fields: [invoiceItems.appointmentId],
    references: [appointments.id],
  }),
  service: one(services, {
    fields: [invoiceItems.serviceId],
    references: [services.id],
  }),
}));

export const progressEntriesRelations = relations(progressEntries, ({ one }) => ({
  dog: one(dogs, {
    fields: [progressEntries.dogId],
    references: [dogs.id],
  }),
  appointment: one(appointments, {
    fields: [progressEntries.appointmentId],
    references: [appointments.id],
  }),
  createdBy: one(users, {
    fields: [progressEntries.createdById],
    references: [users.id],
  }),
}));

// Medical Records (Expediente Médico)
export const medicalRecords = pgTable("medical_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").references(() => dogs.id).notNull(),
  recordDate: timestamp("record_date").defaultNow(),
  recordType: varchar("record_type").notNull(), // "medical", "vaccination", "allergy", "surgery", etc.
  title: varchar("title").notNull(),
  description: text("description"),
  veterinarian: varchar("veterinarian"),
  medications: text("medications"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = typeof medicalRecords.$inferInsert;

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Training Sessions (Sesiones de Entrenamiento)
export const trainingSessions = pgTable("training_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").references(() => dogs.id).notNull(),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  protocolId: varchar("protocol_id").references(() => protocols.id), // Protocolo aplicado en esta sesión
  protocolSnapshot: jsonb("protocol_snapshot"), // Copia del protocolo al momento de aplicación
  sessionDate: timestamp("session_date").defaultNow(),
  trainer: varchar("trainer"),
  objective: varchar("objective").notNull(),
  activities: text("activities"),
  progress: text("progress"),
  behaviorNotes: text("behavior_notes"),
  nextSteps: text("next_steps"),
  rating: integer("rating"), // 1-10 scale
  duration: integer("duration"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = typeof trainingSessions.$inferInsert;

export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Evidence/Media (Evidencias)
export const evidenceTypeEnum = pgEnum("evidence_type", [
  "photo",
  "video",
  "document",
  "note"
]);

export const evidence = pgTable("evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").references(() => dogs.id).notNull(),
  trainingSessionId: varchar("training_session_id").references(() => trainingSessions.id),
  medicalRecordId: varchar("medical_record_id").references(() => medicalRecords.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  type: evidenceTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  fileUrl: varchar("file_url"), // URL to file in object storage
  fileName: varchar("file_name"),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = typeof evidence.$inferInsert;

export const insertEvidenceSchema = createInsertSchema(evidence).omit({
  id: true,
  createdAt: true,
});

// Relations for new tables
export const medicalRecordsRelations = relations(medicalRecords, ({ one, many }) => ({
  dog: one(dogs, {
    fields: [medicalRecords.dogId],
    references: [dogs.id],
  }),
  evidence: many(evidence),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one, many }) => ({
  dog: one(dogs, {
    fields: [trainingSessions.dogId],
    references: [dogs.id],
  }),
  appointment: one(appointments, {
    fields: [trainingSessions.appointmentId],
    references: [appointments.id],
  }),
  protocol: one(protocols, {
    fields: [trainingSessions.protocolId],
    references: [protocols.id],
  }),
  evidence: many(evidence),
}));

export const evidenceRelations = relations(evidence, ({ one }) => ({
  dog: one(dogs, {
    fields: [evidence.dogId],
    references: [dogs.id],
  }),
  trainingSession: one(trainingSessions, {
    fields: [evidence.trainingSessionId],
    references: [trainingSessions.id],
  }),
  medicalRecord: one(medicalRecords, {
    fields: [evidence.medicalRecordId],
    references: [medicalRecords.id],
  }),
  appointment: one(appointments, {
    fields: [evidence.appointmentId],
    references: [appointments.id],
  }),
}));

// Teacher Assignments - to track which teachers are assigned to which dogs
export const teacherAssignments = pgTable("teacher_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").references(() => users.id).notNull(),
  dogId: varchar("dog_id").references(() => dogs.id).notNull(),
  assignedDate: timestamp("assigned_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"), // Special instructions for this assignment
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TeacherAssignment = typeof teacherAssignments.$inferSelect;
export type InsertTeacherAssignment = typeof teacherAssignments.$inferInsert;

// Attendance tracking
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "excused",
  "late"
]);

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id).notNull(),
  dogId: varchar("dog_id").references(() => dogs.id).notNull(),
  teacherId: varchar("teacher_id").references(() => users.id).notNull(),
  status: attendanceStatusEnum("status").notNull(),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  notes: text("notes"), // Reason for absence, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

// Internal Communications and Notes
export const communicationTypeEnum = pgEnum("communication_type", [
  "note",
  "incident",
  "alert",
  "reminder"
]);

export const internalNotes = pgTable("internal_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").references(() => users.id).notNull(), // Who wrote the note
  targetType: varchar("target_type").notNull(), // "dog", "client", "appointment", "general"
  targetId: varchar("target_id"), // ID of the target (dogId, clientId, etc.)
  type: communicationTypeEnum("type").default("note"),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isUrgent: boolean("is_urgent").default(false),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InternalNote = typeof internalNotes.$inferSelect;
export type InsertInternalNote = typeof internalNotes.$inferInsert;

// Package Status Enum
export const packageStatusEnum = pgEnum("package_status", [
  "active",      // Activo: sesiones_restantes > 0
  "finishing",   // Por terminar: sesiones_restantes <= 3
  "completed",   // Terminado: sesiones_restantes = 0
  "expired"      // Expirado: fecha actual > fecha de expiración
]);

// Package Session Status Enum
export const packageSessionStatusEnum = pgEnum("package_session_status", [
  "attended",     // Asistió
  "cancelled",    // Canceló
  "no_show",      // No se presentó
  "error"         // Error administrativo
]);

// Alert Type Enum
export const alertTypeEnum = pgEnum("alert_type", [
  "low_sessions",      // Pocas sesiones
  "package_completed", // Paquete terminado
  "expiring_soon",     // Por expirar
  "expired"            // Expirado
]);

// Alert Level Enum
export const alertLevelEnum = pgEnum("alert_level", [
  "yellow",    // 5 sesiones restantes
  "red",       // 3 sesiones restantes
  "critical"   // 1 sesión restante
]);

// Service Packages (for tracking usage like "10 sessions package")
export const servicePackages = pgTable("service_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  dogId: varchar("dog_id").references(() => dogs.id),
  serviceId: varchar("service_id").references(() => services.id),
  packageName: varchar("package_name").notNull(),
  totalSessions: integer("total_sessions").notNull(),
  usedSessions: integer("used_sessions").default(0).notNull(),
  remainingSessions: integer("remaining_sessions").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  price: decimal("price", { precision: 10, scale: 2 }),
  status: packageStatusEnum("status").default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = typeof servicePackages.$inferInsert;

export const insertServicePackageSchema = createInsertSchema(servicePackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Package Sessions (registro de consumo de sesiones)
export const packageSessions = pgTable("package_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageId: varchar("package_id").references(() => servicePackages.id).notNull(),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  dogId: varchar("dog_id").references(() => dogs.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  sessionDate: timestamp("session_date").notNull(),
  sessionType: varchar("session_type"),
  status: packageSessionStatusEnum("status").default("attended").notNull(),
  registeredBy: varchar("registered_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PackageSession = typeof packageSessions.$inferSelect;
export type InsertPackageSession = typeof packageSessions.$inferInsert;

export const insertPackageSessionSchema = createInsertSchema(packageSessions).omit({
  id: true,
  createdAt: true,
});

// Package Alerts (alertas del sistema de paquetes)
export const packageAlerts = pgTable("package_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageId: varchar("package_id").references(() => servicePackages.id).notNull(),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  alertType: alertTypeEnum("alert_type").notNull(),
  alertLevel: alertLevelEnum("alert_level"),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  sentViaEmail: boolean("sent_via_email").default(false),
  sentViaPanel: boolean("sent_via_panel").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PackageAlert = typeof packageAlerts.$inferSelect;
export type InsertPackageAlert = typeof packageAlerts.$inferInsert;

export const insertPackageAlertSchema = createInsertSchema(packageAlerts).omit({
  id: true,
  createdAt: true,
});

// Tasks for teacher assignments (general tasks, classes, meetings)
export const taskTypeEnum = pgEnum("task_type", [
  "class",
  "training",
  "meeting",
  "administrative",
  "other"
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled"
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent"
]);

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: taskTypeEnum("type").notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id).notNull(), // Teacher ID
  createdBy: varchar("created_by").references(() => users.id).notNull(), // Admin ID
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: taskStatusEnum("status").default("pending"),
  priority: taskPriorityEnum("priority").default("medium"),
  isRead: boolean("is_read").default(false), // Has the teacher seen this?
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Relations for new tables
export const teacherAssignmentsRelations = relations(teacherAssignments, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherAssignments.teacherId],
    references: [users.id],
  }),
  dog: one(dogs, {
    fields: [teacherAssignments.dogId],
    references: [dogs.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  appointment: one(appointments, {
    fields: [attendance.appointmentId],
    references: [appointments.id],
  }),
  dog: one(dogs, {
    fields: [attendance.dogId],
    references: [dogs.id],
  }),
  teacher: one(users, {
    fields: [attendance.teacherId],
    references: [users.id],
  }),
}));

export const internalNotesRelations = relations(internalNotes, ({ one }) => ({
  author: one(users, {
    fields: [internalNotes.authorId],
    references: [users.id],
  }),
}));

export const servicePackagesRelations = relations(servicePackages, ({ one, many }) => ({
  client: one(clients, {
    fields: [servicePackages.clientId],
    references: [clients.id],
  }),
  dog: one(dogs, {
    fields: [servicePackages.dogId],
    references: [dogs.id],
  }),
  service: one(services, {
    fields: [servicePackages.serviceId],
    references: [services.id],
  }),
  sessions: many(packageSessions),
  alerts: many(packageAlerts),
}));

export const packageSessionsRelations = relations(packageSessions, ({ one }) => ({
  package: one(servicePackages, {
    fields: [packageSessions.packageId],
    references: [servicePackages.id],
  }),
  client: one(clients, {
    fields: [packageSessions.clientId],
    references: [clients.id],
  }),
  dog: one(dogs, {
    fields: [packageSessions.dogId],
    references: [dogs.id],
  }),
  appointment: one(appointments, {
    fields: [packageSessions.appointmentId],
    references: [appointments.id],
  }),
  registeredByUser: one(users, {
    fields: [packageSessions.registeredBy],
    references: [users.id],
  }),
}));

export const packageAlertsRelations = relations(packageAlerts, ({ one }) => ({
  package: one(servicePackages, {
    fields: [packageAlerts.packageId],
    references: [servicePackages.id],
  }),
  client: one(clients, {
    fields: [packageAlerts.clientId],
    references: [clients.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedTeacher: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}));

// Evaluaciones de Valoración (Assessment) - Formulario con caritas 1-5
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").references(() => dogs.id).notNull(),
  evaluatorId: varchar("evaluator_id").references(() => users.id),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  
  // LA REACCIÓN - Al Llegar (1-5)
  reactionArrivalHidesBehind: integer("reaction_arrival_hides_behind"),
  reactionArrivalRigid: integer("reaction_arrival_rigid"),
  reactionArrivalSits: integer("reaction_arrival_sits"),
  reactionArrivalImmobile: integer("reaction_arrival_immobile"),
  
  // LA REACCIÓN - Durante Anamnesis (1-5)
  reactionAnamnesisHidesBehind: integer("reaction_anamnesis_hides_behind"),
  reactionAnamnesisRigid: integer("reaction_anamnesis_rigid"),
  reactionAnamnesisSits: integer("reaction_anamnesis_sits"),
  reactionAnamnesisImmobile: integer("reaction_anamnesis_immobile"),
  
  // LA REACCIÓN - Durante Evaluación (1-5)
  reactionEvalHidesBehind: integer("reaction_eval_hides_behind"),
  reactionEvalRigid: integer("reaction_eval_rigid"),
  reactionEvalSits: integer("reaction_eval_sits"),
  reactionEvalImmobile: integer("reaction_eval_immobile"),
  reactionComments: text("reaction_comments"),
  
  // CARACTERÍSTICAS FÍSICAS (1-5)
  physCoat: integer("phys_coat"),
  physTemperature: integer("phys_temperature"),
  physEyes: integer("phys_eyes"),
  physTeeth: integer("phys_teeth"),
  physWeight: integer("phys_weight"),
  physSmell: integer("phys_smell"),
  physMuscleTension: integer("phys_muscle_tension"),
  physTouchReactive: integer("phys_touch_reactive"),
  physSalivating: integer("phys_salivating"),
  physSweatingPaws: integer("phys_sweating_paws"),
  physShedding: integer("phys_shedding"),
  physComments: text("phys_comments"),
  
  // MOVIMIENTO (1-5)
  movBalance: integer("mov_balance"),
  movGait: integer("mov_gait"), // Normal/cojea
  movSpeed: integer("mov_speed"),
  movCoordination: integer("mov_coordination"),
  movComments: text("mov_comments"),
  
  // CORREA - CON EL DUEÑO (1-5)
  leashOwnerSecure: integer("leash_owner_secure"),
  leashOwnerPulls: integer("leash_owner_pulls"),
  leashOwnerReactive: integer("leash_owner_reactive"),
  leashOwnerAggressive: integer("leash_owner_aggressive"),
  
  // CORREA - CON OTRA PERSONA (1-5)
  leashOtherSecure: integer("leash_other_secure"),
  leashOtherPulls: integer("leash_other_pulls"),
  leashOtherReactive: integer("leash_other_reactive"),
  leashOtherAggressive: integer("leash_other_aggressive"),
  leashComments: text("leash_comments"),
  
  // INTERACCIÓN - SEÑALES DE CALMA (1-5)
  calmYawning: integer("calm_yawning"),
  calmLicking: integer("calm_licking"),
  calmStretching: integer("calm_stretching"),
  calmTurnHead: integer("calm_turn_head"),
  calmBlinking: integer("calm_blinking"),
  calmSniffing: integer("calm_sniffing"),
  interactionStrangers: integer("interaction_strangers"),
  interactionOtherDogs: integer("interaction_other_dogs"),
  interactionComments: text("interaction_comments"),
  
  // POSTURA (1-5)
  postureTail: integer("posture_tail"),
  postureHead: integer("posture_head"),
  postureEars: integer("posture_ears"),
  postureEyes: integer("posture_eyes"),
  postureBalance: integer("posture_balance"),
  postureSymmetry: integer("posture_symmetry"),
  postureBreathing: integer("posture_breathing"),
  postureRolling: integer("posture_rolling"),
  postureCrouching: integer("posture_crouching"),
  postureComments: text("posture_comments"),
  
  // Comentarios generales
  generalNotes: text("general_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  dog: one(dogs, {
    fields: [assessments.dogId],
    references: [dogs.id],
  }),
  evaluator: one(users, {
    fields: [assessments.evaluatorId],
    references: [users.id],
  }),
}));
