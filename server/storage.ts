import {
  users,
  clients,
  dogs,
  services,
  protocols,
  appointments,
  invoices,
  invoiceItems,
  payments,
  expenses,
  progressEntries,
  medicalRecords,
  trainingSessions,
  evidence,
  teacherAssignments,
  internalNotes,
  servicePackages,
  packageSessions,
  packageAlerts,
  packageTemplates,
  tasks,
  assessments,
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Dog,
  type InsertDog,
  type Service,
  type InsertService,
  type Protocol,
  type InsertProtocol,
  type Appointment,
  type InsertAppointment,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type Payment,
  type InsertPayment,
  type Expense,
  type InsertExpense,
  type ProgressEntry,
  type InsertProgressEntry,
  type MedicalRecord,
  type InsertMedicalRecord,
  type TrainingSession,
  type InsertTrainingSession,
  type Evidence,
  type InsertEvidence,
  type TeacherAssignment,
  type InsertTeacherAssignment,
  type InternalNote,
  type InsertInternalNote,
  type ServicePackage,
  type InsertServicePackage,
  type PackageSession,
  type InsertPackageSession,
  type PackageAlert,
  type InsertPackageAlert,
  type PackageTemplate,
  type InsertPackageTemplate,
  type Task,
  type InsertTask,
  type Assessment,
  type InsertAssessment,
  petTypes,
  PetType,
  InsertPetType,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count, or, inArray } from "drizzle-orm";
import { hashPassword } from "./auth";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Custom authentication methods
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithPassword(userData: { 
    email: string; 
    password: string; 
    firstName?: string; 
    lastName?: string; 
    role: string 
  }): Promise<User>;
  getAdminUsers(): Promise<User[]>;
  
  // Admin user management
  createUser(userData: { email: string; firstName?: string; lastName?: string; role: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserPassword(id: string, password: string): Promise<User>;

  // Client operations
  createClient(client: InsertClient): Promise<Client>;
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByUserId(userId: string): Promise<Client | undefined>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  // Pet Type operations
  createPetType(petType: InsertPetType): Promise<PetType>;
  getPetTypes(): Promise<PetType[]>;
  getPetType(id: string): Promise<PetType | undefined>;
  getPetTypeByName(name: string): Promise<PetType | undefined>;

  // Dog operations
  createDog(dog: InsertDog): Promise<Dog>;
  getDogsByClientId(clientId: string): Promise<Dog[]>;
  getDog(id: string): Promise<Dog | undefined>;
  updateDog(id: string, dog: Partial<InsertDog>): Promise<Dog>;
  deleteDog(id: string): Promise<void>;

  // Service operations
  createService(service: InsertService): Promise<Service>;
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;

  // Protocol operations
  createProtocol(protocol: InsertProtocol): Promise<Protocol>;
  getProtocols(): Promise<Protocol[]>;
  getProtocol(id: string): Promise<Protocol | undefined>;
  getActiveProtocols(): Promise<Protocol[]>;
  updateProtocol(id: string, protocol: Partial<InsertProtocol>): Promise<Protocol>;
  deleteProtocol(id: string): Promise<void>;

  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(): Promise<any[]>;
  getAppointmentsByClientId(clientId: string): Promise<any[]>;
  getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<any[]>;
  getAppointment(id: string): Promise<any | undefined>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  updateAppointmentProtocol(appointmentId: string, protocolId: string): Promise<Appointment>;
  updateAppointmentProgress(appointmentId: string, data: { progressState: string, progressSummary?: string }): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;

  // Invoice operations
  createInvoice(invoice: Omit<InsertInvoice, 'invoiceNumber'>): Promise<Invoice>;
  getInvoices(): Promise<any[]>;
  getInvoicesByClientId(clientId: string): Promise<any[]>;
  getInvoice(id: string): Promise<any | undefined>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;

  // Invoice item operations
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  getInvoiceItemsByInvoiceId(invoiceId: string): Promise<any[]>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(): Promise<any[]>;
  getPaymentsByClientId(clientId: string): Promise<any[]>;
  getPendingPayments(): Promise<any[]>;
  getPayment(id: string): Promise<any | undefined>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment>;
  approvePayment(id: string, approvedById: string): Promise<Payment>;
  rejectPayment(id: string, rejectionReason: string): Promise<Payment>;

  // Expense operations
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<Expense[]>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  // Progress entry operations
  createProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry>;
  getProgressEntriesByDogId(dogId: string): Promise<any[]>;
  getProgressEntriesByAppointmentId(appointmentId: string): Promise<ProgressEntry[]>;
  getProgressEntry(id: string): Promise<any | undefined>;
  updateProgressEntry(id: string, entry: Partial<InsertProgressEntry>): Promise<ProgressEntry>;
  deleteProgressEntry(id: string): Promise<void>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    appointmentsToday: number;
    monthlyRevenue: string;
    activeClients: number;
    dogsBoarding: number;
  }>;

  // Financial summary
  getFinancialSummary(startDate: Date, endDate: Date): Promise<{
    totalIncome: string;
    totalExpenses: string;
    netProfit: string;
    serviceBreakdown: any[];
  }>;

  // Teacher Portal operations
  getTodayAppointmentsByTeacher(teacherId: string): Promise<any[]>;
  getAssignedDogsByTeacher(teacherId: string): Promise<any[]>;
  getRecentNotesByTeacher(teacherId: string): Promise<InternalNote[]>;
  getTeacherStats(teacherId: string): Promise<{
    monthlySessions: number;
    weeklyGrowth: number;
  }>;

  // Teacher Assignment operations
  createTeacherAssignment(assignment: InsertTeacherAssignment): Promise<TeacherAssignment>;
  getAllTeacherAssignments(): Promise<any[]>;
  updateTeacherAssignment(id: string, assignment: Partial<InsertTeacherAssignment>): Promise<TeacherAssignment>;
  getTeacherAssignmentsByTeacher(teacherId: string): Promise<any[]>;
  
  // Internal Notes operations
  createInternalNote(note: InsertInternalNote): Promise<InternalNote>;
  getInternalNotesByTarget(targetType: string, targetId: string): Promise<InternalNote[]>;
  updateInternalNote(id: string, note: Partial<InsertInternalNote>): Promise<InternalNote>;
  markNoteAsRead(id: string): Promise<void>;

  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTasksByTeacher(teacherId: string): Promise<any[]>;
  getAllTasks(): Promise<any[]>;
  getTasksByDateRange(startDate: Date, endDate: Date): Promise<any[]>;
  getTask(id: string): Promise<any | undefined>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  getUnreadTasksByTeacher(teacherId: string): Promise<number>;
  markTaskAsRead(id: string): Promise<void>;

  // Assessment operations (Evaluaciones de Valoración)
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessmentsByDogId(dogId: string): Promise<Assessment[]>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment>;
  deleteAssessment(id: string): Promise<void>;

  // Service Package operations (Gestión de Paquetes)
  createServicePackage(pkg: InsertServicePackage): Promise<ServicePackage>;
  getServicePackages(): Promise<any[]>;
  getServicePackagesByClient(clientId: string): Promise<any[]>;
  getActivePackagesByClient(clientId: string): Promise<any[]>;
  getServicePackage(id: string): Promise<any | undefined>;
  updateServicePackage(id: string, pkg: Partial<InsertServicePackage>): Promise<ServicePackage>;
  deleteServicePackage(id: string): Promise<void>;
  updatePackageStatus(id: string): Promise<ServicePackage>;
  getPackagesWithAlerts(): Promise<any[]>;

  // Package Session operations (Control de Sesiones)
  createPackageSession(session: InsertPackageSession): Promise<PackageSession>;
  getPackageSessionsByPackage(packageId: string): Promise<any[]>;
  getPackageSessionsByClient(clientId: string): Promise<any[]>;
  consumeSession(packageId: string, sessionData: Omit<InsertPackageSession, 'packageId'>): Promise<{ session: PackageSession; package: ServicePackage }>;

  // Package Alert operations (Alertas y Notificaciones)
  createPackageAlert(alert: InsertPackageAlert): Promise<PackageAlert>;
  getPackageAlertsByClient(clientId: string): Promise<PackageAlert[]>;
  getUnreadAlertsByClient(clientId: string): Promise<PackageAlert[]>;
  getAllUnreadAlerts(): Promise<any[]>;
  markAlertAsRead(id: string): Promise<void>;
  markAllAlertsAsRead(clientId: string): Promise<void>;

  // Package Dashboard metrics
  getPackageDashboardMetrics(): Promise<{
    activePackages: number;
    finishingPackages: number;
    completedPackages: number;
    expiredPackages: number;
    clientsWithAlerts: number;
  }>;

  // Package Template operations (Plantillas de Paquetes)
  getPackageTemplates(): Promise<PackageTemplate[]>;
  getPackageTemplatesByCategory(category: string): Promise<PackageTemplate[]>;
  getActivePackageTemplates(): Promise<PackageTemplate[]>;
  getPackageTemplate(id: string): Promise<PackageTemplate | undefined>;
  createPackageTemplate(template: InsertPackageTemplate): Promise<PackageTemplate>;
  updatePackageTemplate(id: string, template: Partial<InsertPackageTemplate>): Promise<PackageTemplate>;
  deletePackageTemplate(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Admin user management
  async createUser(userData: { email: string; firstName?: string; lastName?: string; role: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const usersList = await db.select().from(users).orderBy(desc(users.createdAt));
    return usersList;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, password: string): Promise<User> {
    const hashedPassword = await hashPassword(password);
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Custom authentication methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUserWithPassword(userData: { 
    email: string; 
    password: string; 
    firstName?: string; 
    lastName?: string; 
    role: string 
  }): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      })
      .returning();
    return user;
  }

  async getAdminUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'admin'));
  }

  // Client operations
  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClientsWithDogs(): Promise<any[]> {
    const clientsList = await db.select().from(clients).orderBy(desc(clients.createdAt));
    const result = [];
    
    for (const client of clientsList) {
      const clientDogs = await db
        .select({
          id: dogs.id,
          clientId: dogs.clientId,
          petTypeId: dogs.petTypeId,
          petTypeName: petTypes.name,
          name: dogs.name,
          breed: dogs.breed,
          age: dogs.age,
          weight: dogs.weight,
          notes: dogs.notes,
          imageUrl: dogs.imageUrl,
          createdAt: dogs.createdAt,
          updatedAt: dogs.updatedAt,
        })
        .from(dogs)
        .leftJoin(petTypes, eq(dogs.petTypeId, petTypes.id))
        .where(eq(dogs.clientId, client.id));
      
      result.push({
        ...client,
        dogs: clientDogs
      });
    }
    
    return result;
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByUserId(userId: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.userId, userId));
    return client;
  }

  async updateClient(id: string, clientData: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({ ...clientData, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Pet Type operations
  async createPetType(petType: InsertPetType): Promise<PetType> {
    const [newPetType] = await db.insert(petTypes).values(petType).returning();
    return newPetType;
  }

  async getPetTypes(): Promise<PetType[]> {
    return await db.select().from(petTypes).orderBy(petTypes.name);
  }

  async getPetType(id: string): Promise<PetType | undefined> {
    const [petType] = await db.select().from(petTypes).where(eq(petTypes.id, id));
    return petType;
  }

  async getPetTypeByName(name: string): Promise<PetType | undefined> {
    const [petType] = await db.select().from(petTypes).where(eq(petTypes.name, name));
    return petType;
  }

  // Dog operations
  async createDog(dog: InsertDog): Promise<Dog> {
    const [newDog] = await db.insert(dogs).values(dog).returning();
    return newDog;
  }

  async getDogsByClientId(clientId: string): Promise<any[]> {
    return await db
      .select({
        id: dogs.id,
        clientId: dogs.clientId,
        petTypeId: dogs.petTypeId,
        petTypeName: petTypes.name,
        name: dogs.name,
        breed: dogs.breed,
        age: dogs.age,
        weight: dogs.weight,
        notes: dogs.notes,
        imageUrl: dogs.imageUrl,
        createdAt: dogs.createdAt,
        updatedAt: dogs.updatedAt,
      })
      .from(dogs)
      .leftJoin(petTypes, eq(dogs.petTypeId, petTypes.id))
      .where(eq(dogs.clientId, clientId));
  }

  async getDog(id: string): Promise<Dog | undefined> {
    const [dog] = await db.select().from(dogs).where(eq(dogs.id, id));
    return dog;
  }

  async updateDog(id: string, dogData: Partial<InsertDog>): Promise<Dog> {
    const [dog] = await db
      .update(dogs)
      .set({ ...dogData, updatedAt: new Date() })
      .where(eq(dogs.id, id))
      .returning();
    return dog;
  }

  async deleteDog(id: string): Promise<void> {
    await db.delete(dogs).where(eq(dogs.id, id));
  }

  // Service operations
  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isActive, true));
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async updateService(id: string, serviceData: Partial<InsertService>): Promise<Service> {
    const [service] = await db
      .update(services)
      .set({ ...serviceData, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return service;
  }

  async deleteService(id: string): Promise<void> {
    await db.update(services).set({ isActive: false }).where(eq(services.id, id));
  }

  // Protocol operations
  async createProtocol(protocol: InsertProtocol): Promise<Protocol> {
    const [newProtocol] = await db.insert(protocols).values(protocol).returning();
    return newProtocol;
  }

  async getProtocols(): Promise<Protocol[]> {
    return await db.select().from(protocols).orderBy(desc(protocols.createdAt));
  }

  async getProtocol(id: string): Promise<Protocol | undefined> {
    const [protocol] = await db.select().from(protocols).where(eq(protocols.id, id));
    return protocol;
  }

  async getActiveProtocols(): Promise<Protocol[]> {
    return await db
      .select()
      .from(protocols)
      .where(eq(protocols.isActive, true))
      .orderBy(desc(protocols.createdAt));
  }

  async updateProtocol(id: string, protocol: Partial<InsertProtocol>): Promise<Protocol> {
    const [updatedProtocol] = await db
      .update(protocols)
      .set({ ...protocol, updatedAt: new Date() })
      .where(eq(protocols.id, id))
      .returning();
    return updatedProtocol;
  }

  async deleteProtocol(id: string): Promise<void> {
    await db.update(protocols).set({ isActive: false }).where(eq(protocols.id, id));
  }

  // Appointment operations
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async getAppointments(): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        notes: appointments.notes,
        price: appointments.price,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
        },
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        service: {
          id: services.id,
          name: services.name,
          type: services.type,
        },
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(dogs, eq(appointments.dogId, dogs.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getAppointmentsByClientId(clientId: string): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        notes: appointments.notes,
        price: appointments.price,
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        service: {
          id: services.id,
          name: services.name,
          type: services.type,
        },
      })
      .from(appointments)
      .leftJoin(dogs, eq(appointments.dogId, dogs.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.clientId, clientId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        notes: appointments.notes,
        price: appointments.price,
        teacherId: appointments.teacherId,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
        },
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        service: {
          id: services.id,
          name: services.name,
          type: services.type,
        },
        teacher: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(dogs, eq(appointments.dogId, dogs.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(users, eq(appointments.teacherId, users.id))
      .where(
        and(
          gte(appointments.appointmentDate, startDate),
          lte(appointments.appointmentDate, endDate)
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  async getAppointment(id: string): Promise<any | undefined> {
    const [appointment] = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        notes: appointments.notes,
        price: appointments.price,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
        },
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        service: {
          id: services.id,
          name: services.name,
          type: services.type,
        },
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(dogs, eq(appointments.dogId, dogs.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.id, id));
    return appointment;
  }

  async updateAppointment(id: string, appointmentData: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...appointmentData, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async updateAppointmentProtocol(appointmentId: string, protocolId: string): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ plannedProtocolId: protocolId, updatedAt: new Date() })
      .where(eq(appointments.id, appointmentId))
      .returning();
    return appointment;
  }

  async updateAppointmentProgress(
    appointmentId: string, 
    data: { progressState: string, progressSummary?: string }
  ): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ 
        progressState: data.progressState as any,
        progressSummary: data.progressSummary,
        updatedAt: new Date() 
      })
      .where(eq(appointments.id, appointmentId))
      .returning();
    return appointment;
  }

  async deleteAppointment(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  // Invoice operations
  async createInvoice(invoice: Omit<InsertInvoice, 'invoiceNumber'>): Promise<Invoice> {
    const invoiceNumber = `INV-${Date.now()}`;
    const [newInvoice] = await db
      .insert(invoices)
      .values({ ...invoice, invoiceNumber })
      .returning();
    return newInvoice;
  }

  async getInvoices(): Promise<any[]> {
    return await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        amount: invoices.amount,
        status: invoices.status,
        dueDate: invoices.dueDate,
        paidDate: invoices.paidDate,
        createdAt: invoices.createdAt,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
        },
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoicesByClientId(clientId: string): Promise<any[]> {
    return await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        amount: invoices.amount,
        status: invoices.status,
        dueDate: invoices.dueDate,
        paidDate: invoices.paidDate,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .where(eq(invoices.clientId, clientId))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<any | undefined> {
    const [invoice] = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        amount: invoices.amount,
        status: invoices.status,
        dueDate: invoices.dueDate,
        paidDate: invoices.paidDate,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.id, id));
    return invoice;
  }

  async updateInvoice(id: string, invoiceData: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ ...invoiceData, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  // Invoice item operations
  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [newItem] = await db.insert(invoiceItems).values(item).returning();
    return newItem;
  }

  async getInvoiceItemsByInvoiceId(invoiceId: string): Promise<any[]> {
    return await db
      .select({
        id: invoiceItems.id,
        description: invoiceItems.description,
        quantity: invoiceItems.quantity,
        unitPrice: invoiceItems.unitPrice,
        totalPrice: invoiceItems.totalPrice,
        service: {
          id: services.id,
          name: services.name,
        },
      })
      .from(invoiceItems)
      .leftJoin(services, eq(invoiceItems.serviceId, services.id))
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPayments(): Promise<any[]> {
    return await db
      .select({
        id: payments.id,
        invoiceId: payments.invoiceId,
        clientId: payments.clientId,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        receiptImage: payments.receiptImage,
        status: payments.status,
        notes: payments.notes,
        submittedAt: payments.submittedAt,
        approvedAt: payments.approvedAt,
        approvedById: payments.approvedById,
        rejectionReason: payments.rejectionReason,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
      })
      .from(payments)
      .leftJoin(clients, eq(payments.clientId, clients.id))
      .orderBy(desc(payments.submittedAt));
  }

  async getPaymentsByClientId(clientId: string): Promise<any[]> {
    return await db
      .select({
        id: payments.id,
        invoiceId: payments.invoiceId,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        receiptImage: payments.receiptImage,
        status: payments.status,
        notes: payments.notes,
        submittedAt: payments.submittedAt,
        approvedAt: payments.approvedAt,
        rejectionReason: payments.rejectionReason,
      })
      .from(payments)
      .where(eq(payments.clientId, clientId))
      .orderBy(desc(payments.submittedAt));
  }

  async getPendingPayments(): Promise<any[]> {
    return await db
      .select({
        id: payments.id,
        invoiceId: payments.invoiceId,
        clientId: payments.clientId,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        receiptImage: payments.receiptImage,
        status: payments.status,
        notes: payments.notes,
        submittedAt: payments.submittedAt,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
      })
      .from(payments)
      .leftJoin(clients, eq(payments.clientId, clients.id))
      .where(eq(payments.status, 'pending'))
      .orderBy(desc(payments.submittedAt));
  }

  async getPayment(id: string): Promise<any | undefined> {
    const [payment] = await db
      .select({
        id: payments.id,
        invoiceId: payments.invoiceId,
        clientId: payments.clientId,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        receiptImage: payments.receiptImage,
        status: payments.status,
        notes: payments.notes,
        submittedAt: payments.submittedAt,
        approvedAt: payments.approvedAt,
        approvedById: payments.approvedById,
        rejectionReason: payments.rejectionReason,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
      })
      .from(payments)
      .leftJoin(clients, eq(payments.clientId, clients.id))
      .where(eq(payments.id, id));
    return payment;
  }

  async updatePayment(id: string, paymentData: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(paymentData)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async approvePayment(id: string, approvedById: string): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ 
        status: 'approved', 
        approvedAt: new Date(), 
        approvedById 
      })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async rejectPayment(id: string, rejectionReason: string): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ 
        status: 'rejected', 
        rejectionReason 
      })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Expense operations
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.expenseDate));
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(
        and(
          gte(expenses.expenseDate, startDate),
          lte(expenses.expenseDate, endDate)
        )
      )
      .orderBy(expenses.expenseDate);
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async updateExpense(id: string, expenseData: Partial<InsertExpense>): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set({ ...expenseData, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  // Progress entry operations
  async createProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry> {
    const [newEntry] = await db.insert(progressEntries).values(entry).returning();
    return newEntry;
  }

  async getProgressEntriesByDogId(dogId: string): Promise<any[]> {
    return await db
      .select({
        id: progressEntries.id,
        title: progressEntries.title,
        description: progressEntries.description,
        photos: progressEntries.photos,
        videos: progressEntries.videos,
        createdAt: progressEntries.createdAt,
        appointment: {
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
        },
      })
      .from(progressEntries)
      .leftJoin(appointments, eq(progressEntries.appointmentId, appointments.id))
      .where(eq(progressEntries.dogId, dogId))
      .orderBy(desc(progressEntries.createdAt));
  }

  async getProgressEntriesByAppointmentId(appointmentId: string): Promise<ProgressEntry[]> {
    return await db
      .select()
      .from(progressEntries)
      .where(eq(progressEntries.appointmentId, appointmentId))
      .orderBy(desc(progressEntries.createdAt));
  }

  async getProgressEntry(id: string): Promise<any | undefined> {
    const [entry] = await db
      .select({
        id: progressEntries.id,
        title: progressEntries.title,
        description: progressEntries.description,
        photos: progressEntries.photos,
        videos: progressEntries.videos,
        createdAt: progressEntries.createdAt,
        dog: {
          id: dogs.id,
          name: dogs.name,
        },
        appointment: {
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
        },
      })
      .from(progressEntries)
      .leftJoin(dogs, eq(progressEntries.dogId, dogs.id))
      .leftJoin(appointments, eq(progressEntries.appointmentId, appointments.id))
      .where(eq(progressEntries.id, id));
    return entry;
  }

  async updateProgressEntry(id: string, entryData: Partial<InsertProgressEntry>): Promise<ProgressEntry> {
    const [entry] = await db
      .update(progressEntries)
      .set({ ...entryData, updatedAt: new Date() })
      .where(eq(progressEntries.id, id))
      .returning();
    return entry;
  }

  async deleteProgressEntry(id: string): Promise<void> {
    await db.delete(progressEntries).where(eq(progressEntries.id, id));
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    appointmentsToday: number;
    monthlyRevenue: string;
    activeClients: number;
    dogsBoarding: number;
  }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Appointments today
    const [appointmentsTodayResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      );

    // Monthly revenue from completed appointments
    const monthlyRevenueResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${appointments.price}), 0)::text`,
      })
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfMonth),
          lte(appointments.appointmentDate, endOfMonth),
          eq(appointments.status, "completed")
        )
      );

    // Active clients (clients with appointments in the last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [activeClientsResult] = await db
      .selectDistinct({ count: count(clients.id) })
      .from(clients)
      .innerJoin(appointments, eq(clients.id, appointments.clientId))
      .where(gte(appointments.appointmentDate, threeMonthsAgo));

    // Dogs currently boarding (appointments with boarding service that are ongoing)
    const [dogsBoardingResult] = await db
      .select({ count: count() })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(
        and(
          eq(services.type, "boarding"),
          eq(appointments.status, "confirmed")
        )
      );

    return {
      appointmentsToday: appointmentsTodayResult.count,
      monthlyRevenue: monthlyRevenueResult[0]?.total || "0",
      activeClients: activeClientsResult.count,
      dogsBoarding: dogsBoardingResult.count,
    };
  }

  // Financial summary
  async getFinancialSummary(startDate: Date, endDate: Date): Promise<{
    totalIncome: string;
    totalExpenses: string;
    netProfit: string;
    serviceBreakdown: any[];
  }> {
    // Total income from completed appointments
    const incomeResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${appointments.price}), 0)::text`,
      })
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startDate),
          lte(appointments.appointmentDate, endDate),
          eq(appointments.status, "completed")
        )
      );

    // Total expenses
    const expenseResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)::text`,
      })
      .from(expenses)
      .where(
        and(
          gte(expenses.expenseDate, startDate),
          lte(expenses.expenseDate, endDate)
        )
      );

    // Service breakdown
    const serviceBreakdown = await db
      .select({
        serviceName: services.name,
        serviceType: services.type,
        revenue: sql<string>`COALESCE(SUM(${appointments.price}), 0)::text`,
        count: count(),
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(
        and(
          gte(appointments.appointmentDate, startDate),
          lte(appointments.appointmentDate, endDate),
          eq(appointments.status, "completed")
        )
      )
      .groupBy(services.id, services.name, services.type);

    const totalIncome = parseFloat(incomeResult[0]?.total || "0");
    const totalExpenses = parseFloat(expenseResult[0]?.total || "0");
    const netProfit = totalIncome - totalExpenses;

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      netProfit: netProfit.toFixed(2),
      serviceBreakdown,
    };
  }

  // Medical Records operations
  async createMedicalRecord(medicalRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const [newRecord] = await db.insert(medicalRecords).values(medicalRecord).returning();
    return newRecord;
  }

  async getMedicalRecordsByDogId(dogId: string): Promise<MedicalRecord[]> {
    return await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.dogId, dogId))
      .orderBy(desc(medicalRecords.recordDate));
  }

  async getMedicalRecord(id: string): Promise<MedicalRecord | undefined> {
    const [record] = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return record;
  }

  async updateMedicalRecord(id: string, recordData: Partial<InsertMedicalRecord>): Promise<MedicalRecord> {
    const [record] = await db
      .update(medicalRecords)
      .set({ ...recordData, updatedAt: new Date() })
      .where(eq(medicalRecords.id, id))
      .returning();
    return record;
  }

  async deleteMedicalRecord(id: string): Promise<void> {
    await db.delete(medicalRecords).where(eq(medicalRecords.id, id));
  }

  // Training Sessions operations
  async createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession> {
    const [newSession] = await db.insert(trainingSessions).values(session).returning();
    return newSession;
  }

  async getTrainingSessionsByDogId(dogId: string): Promise<TrainingSession[]> {
    return await db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.dogId, dogId))
      .orderBy(desc(trainingSessions.sessionDate));
  }

  async getTrainingSession(id: string): Promise<TrainingSession | undefined> {
    const [session] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, id));
    return session;
  }

  async updateTrainingSession(id: string, sessionData: Partial<InsertTrainingSession>): Promise<TrainingSession> {
    const [session] = await db
      .update(trainingSessions)
      .set({ ...sessionData, updatedAt: new Date() })
      .where(eq(trainingSessions.id, id))
      .returning();
    return session;
  }

  async deleteTrainingSession(id: string): Promise<void> {
    await db.delete(trainingSessions).where(eq(trainingSessions.id, id));
  }

  // Evidence operations
  async createEvidence(evidenceData: InsertEvidence): Promise<Evidence> {
    const [newEvidence] = await db.insert(evidence).values(evidenceData).returning();
    return newEvidence;
  }

  async getEvidenceByDogId(dogId: string): Promise<Evidence[]> {
    return await db
      .select()
      .from(evidence)
      .where(eq(evidence.dogId, dogId))
      .orderBy(desc(evidence.createdAt));
  }

  async getEvidenceByTrainingSessionId(sessionId: string): Promise<Evidence[]> {
    return await db
      .select()
      .from(evidence)
      .where(eq(evidence.trainingSessionId, sessionId))
      .orderBy(desc(evidence.createdAt));
  }

  async getEvidence(id: string): Promise<Evidence | undefined> {
    const [evidenceItem] = await db.select().from(evidence).where(eq(evidence.id, id));
    return evidenceItem;
  }

  async deleteEvidence(id: string): Promise<void> {
    await db.delete(evidence).where(eq(evidence.id, id));
  }

  // Dog complete record with all related data
  async getDogCompleteRecord(dogId: string): Promise<any> {
    const dog = await this.getDog(dogId);
    if (!dog) return null;

    const [client, appointments, medicalRecords, trainingSessions, evidences] = await Promise.all([
      this.getClient(dog.clientId),
      this.getAppointmentsByDogId(dogId),
      this.getMedicalRecordsByDogId(dogId),
      this.getTrainingSessionsByDogId(dogId),
      this.getEvidenceByDogId(dogId)
    ]);

    return {
      dog,
      client,
      appointments,
      medicalRecords,
      trainingSessions,
      evidence: evidences,
    };
  }

  // Teacher Portal operations
  async getTodayAppointmentsByTeacher(teacherId: string): Promise<any[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        notes: appointments.notes,
        price: appointments.price,
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
        service: {
          id: services.id,
          name: services.name,
          type: services.type,
        },
      })
      .from(appointments)
      .leftJoin(dogs, eq(appointments.dogId, dogs.id))
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(
        and(
          eq(appointments.teacherId, teacherId),
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  async getAssignedDogsByTeacher(teacherId: string): Promise<any[]> {
    // Get dogs from formal teacher_assignments table
    const assignedDogs = await db
      .select({
        id: dogs.id,
        name: dogs.name,
        breed: dogs.breed,
        age: dogs.age,
        imageUrl: dogs.imageUrl,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
        assignmentNotes: teacherAssignments.notes,
        assignedDate: teacherAssignments.assignedDate,
      })
      .from(teacherAssignments)
      .innerJoin(dogs, eq(teacherAssignments.dogId, dogs.id))
      .innerJoin(clients, eq(dogs.clientId, clients.id))
      .where(
        and(
          eq(teacherAssignments.teacherId, teacherId),
          eq(teacherAssignments.isActive, true)
        )
      )
      .orderBy(desc(teacherAssignments.assignedDate));

    // Also get unique dogs from appointments assigned to this teacher
    const dogsFromAppointments = await db
      .selectDistinctOn([dogs.id], {
        id: dogs.id,
        name: dogs.name,
        breed: dogs.breed,
        age: dogs.age,
        imageUrl: dogs.imageUrl,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
        assignmentNotes: sql<string>`null`.as('assignmentNotes'),
        assignedDate: appointments.appointmentDate,
      })
      .from(appointments)
      .innerJoin(dogs, eq(appointments.dogId, dogs.id))
      .innerJoin(clients, eq(dogs.clientId, clients.id))
      .where(eq(appointments.teacherId, teacherId))
      .orderBy(dogs.id, desc(appointments.appointmentDate));

    // Combine both lists, removing duplicates by dog ID
    const assignedDogIds = new Set(assignedDogs.map(d => d.id));
    const uniqueDogsFromAppointments = dogsFromAppointments.filter(d => !assignedDogIds.has(d.id));
    
    return [...assignedDogs, ...uniqueDogsFromAppointments];
  }

  async getRecentNotesByTeacher(teacherId: string): Promise<InternalNote[]> {
    // Get notes authored by teacher or related to their assigned dogs
    const teacherDogs = await db
      .select({ dogId: teacherAssignments.dogId })
      .from(teacherAssignments)
      .where(
        and(
          eq(teacherAssignments.teacherId, teacherId),
          eq(teacherAssignments.isActive, true)
        )
      );

    const dogIds = teacherDogs.map(td => td.dogId);

    return await db
      .select()
      .from(internalNotes)
      .where(
        // Notes authored by teacher OR notes about their assigned dogs
        or(
          eq(internalNotes.authorId, teacherId),
          and(
            eq(internalNotes.targetType, 'dog'),
            inArray(internalNotes.targetId, dogIds.length > 0 ? dogIds : [''])
          )
        )
      )
      .orderBy(desc(internalNotes.createdAt))
      .limit(20);
  }

  async getTeacherStats(teacherId: string): Promise<{ monthlySessions: number; weeklyGrowth: number; }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfThisWeek = new Date(now.getTime());

    // Monthly sessions count
    const [monthlyResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.teacherId, teacherId),
          gte(appointments.appointmentDate, startOfMonth),
          eq(appointments.status, 'completed')
        )
      );

    // Weekly growth calculation (comparing this week vs last week)
    const [thisWeekResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.teacherId, teacherId),
          gte(appointments.appointmentDate, startOfThisWeek),
          eq(appointments.status, 'completed')
        )
      );

    const [lastWeekResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.teacherId, teacherId),
          gte(appointments.appointmentDate, startOfLastWeek),
          lte(appointments.appointmentDate, startOfThisWeek),
          eq(appointments.status, 'completed')
        )
      );

    const thisWeekCount = thisWeekResult?.count || 0;
    const lastWeekCount = lastWeekResult?.count || 0;
    const weeklyGrowth = lastWeekCount > 0 
      ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      : 0;

    return {
      monthlySessions: monthlyResult?.count || 0,
      weeklyGrowth: weeklyGrowth,
    };
  }

  // Teacher Assignment operations
  async createTeacherAssignment(assignmentData: InsertTeacherAssignment): Promise<TeacherAssignment> {
    const [assignment] = await db
      .insert(teacherAssignments)
      .values(assignmentData)
      .returning();
    return assignment;
  }

  async getAllTeacherAssignments(): Promise<any[]> {
    return await db
      .select({
        id: teacherAssignments.id,
        assignedDate: teacherAssignments.assignedDate,
        isActive: teacherAssignments.isActive,
        notes: teacherAssignments.notes,
        teacher: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
        },
      })
      .from(teacherAssignments)
      .innerJoin(users, eq(teacherAssignments.teacherId, users.id))
      .innerJoin(dogs, eq(teacherAssignments.dogId, dogs.id))
      .innerJoin(clients, eq(dogs.clientId, clients.id))
      .orderBy(desc(teacherAssignments.assignedDate));
  }

  async updateTeacherAssignment(id: string, assignmentData: Partial<InsertTeacherAssignment>): Promise<TeacherAssignment> {
    const [assignment] = await db
      .update(teacherAssignments)
      .set({ ...assignmentData, updatedAt: new Date() })
      .where(eq(teacherAssignments.id, id))
      .returning();
    return assignment;
  }

  async getTeacherAssignmentsByTeacher(teacherId: string): Promise<any[]> {
    return await db
      .select({
        id: teacherAssignments.id,
        assignedDate: teacherAssignments.assignedDate,
        isActive: teacherAssignments.isActive,
        notes: teacherAssignments.notes,
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
        },
      })
      .from(teacherAssignments)
      .innerJoin(dogs, eq(teacherAssignments.dogId, dogs.id))
      .innerJoin(clients, eq(dogs.clientId, clients.id))
      .where(eq(teacherAssignments.teacherId, teacherId))
      .orderBy(desc(teacherAssignments.assignedDate));
  }

  // Internal Notes operations
  async createInternalNote(noteData: InsertInternalNote): Promise<InternalNote> {
    const [note] = await db
      .insert(internalNotes)
      .values(noteData)
      .returning();
    return note;
  }

  async getInternalNotesByTarget(targetType: string, targetId: string): Promise<InternalNote[]> {
    return await db
      .select()
      .from(internalNotes)
      .where(
        and(
          eq(internalNotes.targetType, targetType),
          eq(internalNotes.targetId, targetId)
        )
      )
      .orderBy(desc(internalNotes.createdAt));
  }

  async updateInternalNote(id: string, noteData: Partial<InsertInternalNote>): Promise<InternalNote> {
    const [note] = await db
      .update(internalNotes)
      .set(noteData)
      .where(eq(internalNotes.id, id))
      .returning();
    return note;
  }

  async markNoteAsRead(id: string): Promise<void> {
    await db
      .update(internalNotes)
      .set({ isRead: true })
      .where(eq(internalNotes.id, id));
  }

  // Method that should be in the class
  async getAppointmentsByDogId(dogId: string): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        notes: appointments.notes,
        price: appointments.price,
        service: {
          id: services.id,
          name: services.name,
          type: services.type,
        },
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.dogId, dogId))
      .orderBy(desc(appointments.appointmentDate));
  }

  // Task operations
  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return task;
  }

  async getTasksByTeacher(teacherId: string): Promise<any[]> {
    return await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        type: tasks.type,
        startDate: tasks.startDate,
        endDate: tasks.endDate,
        status: tasks.status,
        priority: tasks.priority,
        isRead: tasks.isRead,
        notes: tasks.notes,
        createdAt: tasks.createdAt,
        assignedTeacher: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.assignedTo, users.id))
      .where(eq(tasks.assignedTo, teacherId))
      .orderBy(desc(tasks.startDate));
  }

  async getAllTasks(): Promise<any[]> {
    return await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        type: tasks.type,
        startDate: tasks.startDate,
        endDate: tasks.endDate,
        status: tasks.status,
        priority: tasks.priority,
        isRead: tasks.isRead,
        notes: tasks.notes,
        createdAt: tasks.createdAt,
        assignedTeacher: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.assignedTo, users.id))
      .orderBy(desc(tasks.startDate));
  }

  async getTasksByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    return await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        type: tasks.type,
        startDate: tasks.startDate,
        endDate: tasks.endDate,
        status: tasks.status,
        priority: tasks.priority,
        isRead: tasks.isRead,
        notes: tasks.notes,
        createdAt: tasks.createdAt,
        assignedTo: tasks.assignedTo,
        assignedTeacher: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.assignedTo, users.id))
      .where(
        and(
          gte(tasks.startDate, startDate),
          lte(tasks.startDate, endDate)
        )
      )
      .orderBy(tasks.startDate);
  }

  async getTask(id: string): Promise<any | undefined> {
    const [task] = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        type: tasks.type,
        startDate: tasks.startDate,
        endDate: tasks.endDate,
        status: tasks.status,
        priority: tasks.priority,
        isRead: tasks.isRead,
        notes: tasks.notes,
        createdAt: tasks.createdAt,
        assignedTeacher: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.assignedTo, users.id))
      .where(eq(tasks.id, id));
    return task;
  }

  async updateTask(id: string, taskData: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...taskData, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getUnreadTasksByTeacher(teacherId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.assignedTo, teacherId),
          eq(tasks.isRead, false),
          eq(tasks.status, 'pending')
        )
      );
    return result[0]?.count || 0;
  }

  async markTaskAsRead(id: string): Promise<void> {
    await db
      .update(tasks)
      .set({ isRead: true })
      .where(eq(tasks.id, id));
  }

  // Assessment operations (Evaluaciones de Valoración)
  async createAssessment(assessmentData: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values(assessmentData)
      .returning();
    return assessment;
  }

  async getAssessmentsByDogId(dogId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.dogId, dogId))
      .orderBy(desc(assessments.assessmentDate));
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id));
    return assessment;
  }

  async updateAssessment(id: string, assessmentData: Partial<InsertAssessment>): Promise<Assessment> {
    const [assessment] = await db
      .update(assessments)
      .set({ ...assessmentData, updatedAt: new Date() })
      .where(eq(assessments.id, id))
      .returning();
    return assessment;
  }

  async deleteAssessment(id: string): Promise<void> {
    await db.delete(assessments).where(eq(assessments.id, id));
  }

  // Service Package operations (Gestión de Paquetes)
  async createServicePackage(pkg: InsertServicePackage): Promise<ServicePackage> {
    const [newPackage] = await db.insert(servicePackages).values(pkg).returning();
    return newPackage;
  }

  async getServicePackages(): Promise<any[]> {
    return await db
      .select({
        id: servicePackages.id,
        clientId: servicePackages.clientId,
        dogId: servicePackages.dogId,
        serviceId: servicePackages.serviceId,
        packageName: servicePackages.packageName,
        totalSessions: servicePackages.totalSessions,
        usedSessions: servicePackages.usedSessions,
        remainingSessions: servicePackages.remainingSessions,
        purchaseDate: servicePackages.purchaseDate,
        expiryDate: servicePackages.expiryDate,
        price: servicePackages.price,
        status: servicePackages.status,
        notes: servicePackages.notes,
        createdAt: servicePackages.createdAt,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        service: {
          id: services.id,
          name: services.name,
          type: services.type,
        },
      })
      .from(servicePackages)
      .leftJoin(clients, eq(servicePackages.clientId, clients.id))
      .leftJoin(dogs, eq(servicePackages.dogId, dogs.id))
      .leftJoin(services, eq(servicePackages.serviceId, services.id))
      .orderBy(desc(servicePackages.createdAt));
  }

  async getServicePackagesByClient(clientId: string): Promise<any[]> {
    return await db
      .select({
        id: servicePackages.id,
        clientId: servicePackages.clientId,
        dogId: servicePackages.dogId,
        serviceId: servicePackages.serviceId,
        packageName: servicePackages.packageName,
        totalSessions: servicePackages.totalSessions,
        usedSessions: servicePackages.usedSessions,
        remainingSessions: servicePackages.remainingSessions,
        purchaseDate: servicePackages.purchaseDate,
        expiryDate: servicePackages.expiryDate,
        price: servicePackages.price,
        status: servicePackages.status,
        notes: servicePackages.notes,
        createdAt: servicePackages.createdAt,
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        service: {
          id: services.id,
          name: services.name,
          type: services.type,
        },
      })
      .from(servicePackages)
      .leftJoin(dogs, eq(servicePackages.dogId, dogs.id))
      .leftJoin(services, eq(servicePackages.serviceId, services.id))
      .where(eq(servicePackages.clientId, clientId))
      .orderBy(desc(servicePackages.createdAt));
  }

  async getActivePackagesByClient(clientId: string): Promise<any[]> {
    return await db
      .select({
        id: servicePackages.id,
        clientId: servicePackages.clientId,
        dogId: servicePackages.dogId,
        serviceId: servicePackages.serviceId,
        packageName: servicePackages.packageName,
        totalSessions: servicePackages.totalSessions,
        usedSessions: servicePackages.usedSessions,
        remainingSessions: servicePackages.remainingSessions,
        purchaseDate: servicePackages.purchaseDate,
        expiryDate: servicePackages.expiryDate,
        price: servicePackages.price,
        status: servicePackages.status,
        notes: servicePackages.notes,
        createdAt: servicePackages.createdAt,
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        service: {
          id: services.id,
          name: services.name,
          type: services.type,
        },
      })
      .from(servicePackages)
      .leftJoin(dogs, eq(servicePackages.dogId, dogs.id))
      .leftJoin(services, eq(servicePackages.serviceId, services.id))
      .where(
        and(
          eq(servicePackages.clientId, clientId),
          or(
            eq(servicePackages.status, 'active'),
            eq(servicePackages.status, 'finishing')
          )
        )
      )
      .orderBy(desc(servicePackages.createdAt));
  }

  async getServicePackage(id: string): Promise<any | undefined> {
    const [pkg] = await db
      .select({
        id: servicePackages.id,
        clientId: servicePackages.clientId,
        dogId: servicePackages.dogId,
        serviceId: servicePackages.serviceId,
        packageName: servicePackages.packageName,
        totalSessions: servicePackages.totalSessions,
        usedSessions: servicePackages.usedSessions,
        remainingSessions: servicePackages.remainingSessions,
        purchaseDate: servicePackages.purchaseDate,
        expiryDate: servicePackages.expiryDate,
        price: servicePackages.price,
        status: servicePackages.status,
        notes: servicePackages.notes,
        createdAt: servicePackages.createdAt,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
        dog: {
          id: dogs.id,
          name: dogs.name,
          breed: dogs.breed,
        },
        service: {
          id: services.id,
          name: services.name,
          type: services.type,
        },
      })
      .from(servicePackages)
      .leftJoin(clients, eq(servicePackages.clientId, clients.id))
      .leftJoin(dogs, eq(servicePackages.dogId, dogs.id))
      .leftJoin(services, eq(servicePackages.serviceId, services.id))
      .where(eq(servicePackages.id, id));
    return pkg;
  }

  async updateServicePackage(id: string, pkgData: Partial<InsertServicePackage>): Promise<ServicePackage> {
    const [pkg] = await db
      .update(servicePackages)
      .set({ ...pkgData, updatedAt: new Date() })
      .where(eq(servicePackages.id, id))
      .returning();
    return pkg;
  }

  async deleteServicePackage(id: string): Promise<void> {
    await db.delete(servicePackages).where(eq(servicePackages.id, id));
  }

  async updatePackageStatus(id: string): Promise<ServicePackage> {
    const [pkg] = await db.select().from(servicePackages).where(eq(servicePackages.id, id));
    if (!pkg) throw new Error('Paquete no encontrado');

    let newStatus: 'active' | 'finishing' | 'completed' | 'expired' = 'active';
    
    if (pkg.expiryDate && new Date() > new Date(pkg.expiryDate)) {
      newStatus = 'expired';
    } else if (pkg.remainingSessions === 0) {
      newStatus = 'completed';
    } else if (pkg.remainingSessions <= 3) {
      newStatus = 'finishing';
    }

    const [updated] = await db
      .update(servicePackages)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(servicePackages.id, id))
      .returning();
    return updated;
  }

  async getPackagesWithAlerts(): Promise<any[]> {
    return await db
      .select({
        id: servicePackages.id,
        clientId: servicePackages.clientId,
        packageName: servicePackages.packageName,
        totalSessions: servicePackages.totalSessions,
        usedSessions: servicePackages.usedSessions,
        remainingSessions: servicePackages.remainingSessions,
        status: servicePackages.status,
        expiryDate: servicePackages.expiryDate,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
      })
      .from(servicePackages)
      .leftJoin(clients, eq(servicePackages.clientId, clients.id))
      .where(
        or(
          eq(servicePackages.status, 'finishing'),
          eq(servicePackages.status, 'completed'),
          eq(servicePackages.status, 'expired')
        )
      )
      .orderBy(servicePackages.remainingSessions);
  }

  // Package Session operations (Control de Sesiones)
  async createPackageSession(session: InsertPackageSession): Promise<PackageSession> {
    const [newSession] = await db.insert(packageSessions).values(session).returning();
    return newSession;
  }

  async getPackageSessionsByPackage(packageId: string): Promise<any[]> {
    return await db
      .select({
        id: packageSessions.id,
        packageId: packageSessions.packageId,
        clientId: packageSessions.clientId,
        dogId: packageSessions.dogId,
        appointmentId: packageSessions.appointmentId,
        sessionDate: packageSessions.sessionDate,
        sessionType: packageSessions.sessionType,
        status: packageSessions.status,
        notes: packageSessions.notes,
        createdAt: packageSessions.createdAt,
        dog: {
          id: dogs.id,
          name: dogs.name,
        },
        registeredByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(packageSessions)
      .leftJoin(dogs, eq(packageSessions.dogId, dogs.id))
      .leftJoin(users, eq(packageSessions.registeredBy, users.id))
      .where(eq(packageSessions.packageId, packageId))
      .orderBy(desc(packageSessions.sessionDate));
  }

  async getPackageSessionsByClient(clientId: string): Promise<any[]> {
    return await db
      .select({
        id: packageSessions.id,
        packageId: packageSessions.packageId,
        clientId: packageSessions.clientId,
        dogId: packageSessions.dogId,
        sessionDate: packageSessions.sessionDate,
        sessionType: packageSessions.sessionType,
        status: packageSessions.status,
        notes: packageSessions.notes,
        createdAt: packageSessions.createdAt,
        package: {
          id: servicePackages.id,
          packageName: servicePackages.packageName,
        },
        dog: {
          id: dogs.id,
          name: dogs.name,
        },
      })
      .from(packageSessions)
      .leftJoin(servicePackages, eq(packageSessions.packageId, servicePackages.id))
      .leftJoin(dogs, eq(packageSessions.dogId, dogs.id))
      .where(eq(packageSessions.clientId, clientId))
      .orderBy(desc(packageSessions.sessionDate));
  }

  async consumeSession(
    packageId: string,
    sessionData: Omit<InsertPackageSession, 'packageId'>
  ): Promise<{ session: PackageSession; package: ServicePackage }> {
    const [pkg] = await db.select().from(servicePackages).where(eq(servicePackages.id, packageId));
    if (!pkg) throw new Error('Paquete no encontrado');
    if (pkg.remainingSessions <= 0) throw new Error('No hay sesiones disponibles en este paquete');
    if (pkg.status === 'expired') throw new Error('El paquete ha expirado');
    if (pkg.status === 'completed') throw new Error('El paquete ya fue completado');

    const [newSession] = await db
      .insert(packageSessions)
      .values({ ...sessionData, packageId })
      .returning();

    const newUsedSessions = pkg.usedSessions + 1;
    const newRemainingSessions = pkg.remainingSessions - 1;
    
    let newStatus: 'active' | 'finishing' | 'completed' | 'expired' = 'active';
    if (newRemainingSessions === 0) {
      newStatus = 'completed';
    } else if (newRemainingSessions <= 3) {
      newStatus = 'finishing';
    }

    const [updatedPkg] = await db
      .update(servicePackages)
      .set({
        usedSessions: newUsedSessions,
        remainingSessions: newRemainingSessions,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(servicePackages.id, packageId))
      .returning();

    if (newRemainingSessions <= 5 && newRemainingSessions > 0) {
      let alertLevel: 'yellow' | 'red' | 'critical' = 'yellow';
      if (newRemainingSessions <= 1) alertLevel = 'critical';
      else if (newRemainingSessions <= 3) alertLevel = 'red';

      await db.insert(packageAlerts).values({
        packageId,
        clientId: pkg.clientId,
        alertType: 'low_sessions',
        alertLevel,
        message: `Te quedan ${newRemainingSessions} sesión(es) en tu paquete "${pkg.packageName}"`,
      });
    }

    if (newRemainingSessions === 0) {
      await db.insert(packageAlerts).values({
        packageId,
        clientId: pkg.clientId,
        alertType: 'package_completed',
        alertLevel: 'critical',
        message: `Tu paquete "${pkg.packageName}" ha sido completado. ¡Renuévalo para seguir disfrutando de nuestros servicios!`,
      });
    }

    return { session: newSession, package: updatedPkg };
  }

  // Package Alert operations (Alertas y Notificaciones)
  async createPackageAlert(alert: InsertPackageAlert): Promise<PackageAlert> {
    const [newAlert] = await db.insert(packageAlerts).values(alert).returning();
    return newAlert;
  }

  async getPackageAlertsByClient(clientId: string): Promise<PackageAlert[]> {
    return await db
      .select()
      .from(packageAlerts)
      .where(eq(packageAlerts.clientId, clientId))
      .orderBy(desc(packageAlerts.createdAt));
  }

  async getUnreadAlertsByClient(clientId: string): Promise<PackageAlert[]> {
    return await db
      .select()
      .from(packageAlerts)
      .where(
        and(
          eq(packageAlerts.clientId, clientId),
          eq(packageAlerts.isRead, false)
        )
      )
      .orderBy(desc(packageAlerts.createdAt));
  }

  async getAllUnreadAlerts(): Promise<any[]> {
    return await db
      .select({
        id: packageAlerts.id,
        packageId: packageAlerts.packageId,
        clientId: packageAlerts.clientId,
        alertType: packageAlerts.alertType,
        alertLevel: packageAlerts.alertLevel,
        message: packageAlerts.message,
        isRead: packageAlerts.isRead,
        createdAt: packageAlerts.createdAt,
        client: {
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        },
        package: {
          id: servicePackages.id,
          packageName: servicePackages.packageName,
        },
      })
      .from(packageAlerts)
      .leftJoin(clients, eq(packageAlerts.clientId, clients.id))
      .leftJoin(servicePackages, eq(packageAlerts.packageId, servicePackages.id))
      .where(eq(packageAlerts.isRead, false))
      .orderBy(desc(packageAlerts.createdAt));
  }

  async markAlertAsRead(id: string): Promise<void> {
    await db
      .update(packageAlerts)
      .set({ isRead: true })
      .where(eq(packageAlerts.id, id));
  }

  async markAllAlertsAsRead(clientId: string): Promise<void> {
    await db
      .update(packageAlerts)
      .set({ isRead: true })
      .where(eq(packageAlerts.clientId, clientId));
  }

  // Package Dashboard metrics
  async getPackageDashboardMetrics(): Promise<{
    activePackages: number;
    finishingPackages: number;
    completedPackages: number;
    expiredPackages: number;
    clientsWithAlerts: number;
  }> {
    const [activeResult] = await db
      .select({ count: count() })
      .from(servicePackages)
      .where(eq(servicePackages.status, 'active'));

    const [finishingResult] = await db
      .select({ count: count() })
      .from(servicePackages)
      .where(eq(servicePackages.status, 'finishing'));

    const [completedResult] = await db
      .select({ count: count() })
      .from(servicePackages)
      .where(eq(servicePackages.status, 'completed'));

    const [expiredResult] = await db
      .select({ count: count() })
      .from(servicePackages)
      .where(eq(servicePackages.status, 'expired'));

    const alertClients = await db
      .selectDistinct({ clientId: packageAlerts.clientId })
      .from(packageAlerts)
      .where(eq(packageAlerts.isRead, false));

    return {
      activePackages: activeResult?.count || 0,
      finishingPackages: finishingResult?.count || 0,
      completedPackages: completedResult?.count || 0,
      expiredPackages: expiredResult?.count || 0,
      clientsWithAlerts: alertClients.length,
    };
  }

  // Package Template operations (Plantillas de Paquetes)
  async getPackageTemplates(): Promise<PackageTemplate[]> {
    return await db
      .select()
      .from(packageTemplates)
      .orderBy(packageTemplates.category, packageTemplates.name);
  }

  async getPackageTemplatesByCategory(category: string): Promise<PackageTemplate[]> {
    return await db
      .select()
      .from(packageTemplates)
      .where(eq(packageTemplates.category, category as any))
      .orderBy(packageTemplates.name);
  }

  async getActivePackageTemplates(): Promise<PackageTemplate[]> {
    return await db
      .select()
      .from(packageTemplates)
      .where(eq(packageTemplates.isActive, true))
      .orderBy(packageTemplates.category, packageTemplates.name);
  }

  async getPackageTemplate(id: string): Promise<PackageTemplate | undefined> {
    const [template] = await db
      .select()
      .from(packageTemplates)
      .where(eq(packageTemplates.id, id));
    return template;
  }

  async createPackageTemplate(template: InsertPackageTemplate): Promise<PackageTemplate> {
    const [newTemplate] = await db
      .insert(packageTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updatePackageTemplate(id: string, template: Partial<InsertPackageTemplate>): Promise<PackageTemplate> {
    const [updatedTemplate] = await db
      .update(packageTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(packageTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deletePackageTemplate(id: string): Promise<void> {
    await db.delete(packageTemplates).where(eq(packageTemplates.id, id));
  }
}

export const storage = new DatabaseStorage();
