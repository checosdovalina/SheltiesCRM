import {
  users,
  clients,
  dogs,
  services,
  appointments,
  invoices,
  invoiceItems,
  expenses,
  progressEntries,
  medicalRecords,
  trainingSessions,
  evidence,
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Dog,
  type InsertDog,
  type Service,
  type InsertService,
  type Appointment,
  type InsertAppointment,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
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
  petTypes,
  PetType,
  InsertPetType,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";
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

  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(): Promise<any[]>;
  getAppointmentsByClientId(clientId: string): Promise<any[]>;
  getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<any[]>;
  getAppointment(id: string): Promise<any | undefined>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;
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
  async createEvidence(evidence: InsertEvidence): Promise<Evidence> {
    const [newEvidence] = await db.insert(evidence).values(evidence).returning();
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
}

export const storage = new DatabaseStorage();
