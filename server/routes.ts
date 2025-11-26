import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, authenticateUser, registerAdmin } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import {
  insertClientSchema,
  insertDogSchema,
  insertServiceSchema,
  insertProtocolSchema,
  insertAppointmentSchema,
  updateAppointmentProtocolSchema,
  updateAppointmentProgressSchema,
  insertInvoiceSchema,
  insertExpenseSchema,
  insertProgressEntrySchema,
  insertPetTypeSchema,
  insertTaskSchema,
  insertAssessmentSchema,
  insertServicePackageSchema,
  insertPackageSessionSchema,
  insertPackageAlertSchema,
  createUserSchema,
  loginSchema,
  registerSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth routes - Custom login/register system
  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const user = await authenticateUser(loginData);
      
      if (!user) {
        return res.status(401).json({ message: "Email o contraseña incorrectos" });
      }

      // Set session
      (req.session as any).userId = user.id;
      
      // Save session explicitly
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve(null);
        });
      });
      
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Error en el inicio de sesión" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const registerData = registerSchema.parse(req.body);
      const user = await registerAdmin(registerData);
      
      if (!user) {
        return res.status(400).json({ message: "Error al crear el usuario admin" });
      }

      // Set session
      (req.session as any).userId = user.id;
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Error en el registro" });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Check if admin exists (for registration UI)
  app.get('/api/auth/admin-exists', async (req, res) => {
    try {
      const admins = await storage.getAdminUsers();
      res.json({ exists: admins.length > 0 });
    } catch (error) {
      console.error("Error checking admin existence:", error);
      res.status(500).json({ message: "Error checking admin status" });
    }
  });

  app.post('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userData = createUserSchema.omit({ password: true }).parse(req.body);
      const user = await storage.createUser({
        email: userData.email,
        firstName: userData.firstName || undefined,
        lastName: userData.lastName || undefined,
        role: userData.role || 'client',
      });
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get teachers for appointment assignment
  app.get('/api/teachers', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const teachers = users
        .filter(user => user.role === 'teacher')
        .map(({ password, ...teacher }) => teacher);
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.put('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!['admin', 'teacher', 'client'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const user = await storage.updateUserRole(req.params.id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: "Failed to update user role" });
    }
  });

  // Update user password
  app.put('/api/admin/users/:id/password', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { password } = req.body;
      if (!password || password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      const user = await storage.updateUserPassword(req.params.id, password);
      res.json({ message: "Password updated successfully", userId: user.id });
    } catch (error) {
      console.error("Error updating user password:", error);
      res.status(400).json({ message: "Failed to update user password" });
    }
  });

  // Client routes
  app.post('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Failed to create client" });
    }
  });

  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/clients-with-dogs', isAuthenticated, async (req, res) => {
    try {
      const clientsWithDogs = await storage.getClientsWithDogs();
      res.json(clientsWithDogs);
    } catch (error) {
      console.error("Error fetching clients with dogs:", error);
      res.status(500).json({ message: "Failed to fetch clients with dogs" });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, clientData);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Dog routes
  app.post('/api/dogs', isAuthenticated, async (req, res) => {
    try {
      console.log("[DEBUG] Raw request body:", JSON.stringify(req.body, null, 2));
      const dogData = insertDogSchema.parse(req.body);
      console.log("[DEBUG] Creating dog with data:", JSON.stringify(dogData, null, 2));
      console.log("[DEBUG] ImageUrl from request:", dogData.imageUrl);
      const dog = await storage.createDog(dogData);
      console.log("[DEBUG] Created dog result:", JSON.stringify(dog, null, 2));
      res.json(dog);
    } catch (error) {
      console.error("Error creating dog:", error);
      res.status(400).json({ message: "Failed to create dog" });
    }
  });

  app.get('/api/clients/:clientId/dogs', isAuthenticated, async (req, res) => {
    try {
      const dogs = await storage.getDogsByClientId(req.params.clientId);
      res.json(dogs);
    } catch (error) {
      console.error("Error fetching dogs:", error);
      res.status(500).json({ message: "Failed to fetch dogs" });
    }
  });

  app.get('/api/dogs/:id', isAuthenticated, async (req, res) => {
    try {
      const dog = await storage.getDog(req.params.id);
      if (!dog) {
        return res.status(404).json({ message: "Dog not found" });
      }
      
      // Get client information
      const client = await storage.getClient(dog.clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Return dog with client information
      res.json({
        ...dog,
        client
      });
    } catch (error) {
      console.error("Error fetching dog:", error);
      res.status(500).json({ message: "Failed to fetch dog" });
    }
  });

  app.put('/api/dogs/:id', isAuthenticated, async (req, res) => {
    try {
      // Extend schema to accept null for activeProtocolId when clearing protocol
      const updateDogSchema = insertDogSchema.partial().extend({
        activeProtocolId: z.string().nullable().optional(),
      });
      const dogData = updateDogSchema.parse(req.body);
      const dog = await storage.updateDog(req.params.id, dogData);
      res.json(dog);
    } catch (error) {
      console.error("Error updating dog:", error);
      res.status(400).json({ message: "Failed to update dog" });
    }
  });

  // Service routes
  app.post('/api/services', isAuthenticated, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: "Failed to create service" });
    }
  });

  app.get('/api/services', isAuthenticated, async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.put('/api/services/:id', isAuthenticated, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(400).json({ message: "Failed to update service" });
    }
  });

  app.delete('/api/services/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Protocol routes
  app.get('/api/protocols', isAuthenticated, async (req, res) => {
    try {
      const protocols = req.query.active === 'true' 
        ? await storage.getActiveProtocols()
        : await storage.getProtocols();
      res.json(protocols);
    } catch (error) {
      console.error("Error fetching protocols:", error);
      res.status(500).json({ message: "Failed to fetch protocols" });
    }
  });

  app.post('/api/protocols', isAuthenticated, async (req, res) => {
    try {
      const protocolData = insertProtocolSchema.parse(req.body);
      const protocol = await storage.createProtocol(protocolData);
      res.json(protocol);
    } catch (error) {
      console.error("Error creating protocol:", error);
      res.status(400).json({ message: "Failed to create protocol" });
    }
  });

  app.put('/api/protocols/:id', isAuthenticated, async (req, res) => {
    try {
      const protocolData = insertProtocolSchema.partial().parse(req.body);
      const protocol = await storage.updateProtocol(req.params.id, protocolData);
      res.json(protocol);
    } catch (error) {
      console.error("Error updating protocol:", error);
      res.status(400).json({ message: "Failed to update protocol" });
    }
  });

  app.delete('/api/protocols/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProtocol(req.params.id);
      res.json({ message: "Protocol deleted successfully" });
    } catch (error) {
      console.error("Error deleting protocol:", error);
      res.status(500).json({ message: "Failed to delete protocol" });
    }
  });

  // Appointment routes
  app.post('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      console.log("[DEBUG] Creating appointment with data:", JSON.stringify(req.body, null, 2));
      
      // Validate required fields
      if (!req.body.clientId || req.body.clientId === '') {
        return res.status(400).json({ message: "Debe seleccionar un cliente" });
      }
      if (!req.body.dogId || req.body.dogId === '') {
        return res.status(400).json({ message: "Debe seleccionar una mascota" });
      }
      if (!req.body.serviceId || req.body.serviceId === '') {
        return res.status(400).json({ message: "Debe seleccionar un servicio" });
      }
      
      // Convert data types before validation
      const processedData = {
        ...req.body,
        appointmentDate: new Date(req.body.appointmentDate),
        price: req.body.price ? req.body.price.toString() : null,
      };
      
      const appointmentData = insertAppointmentSchema.parse(processedData);
      console.log("[DEBUG] Parsed appointment data:", JSON.stringify(appointmentData, null, 2));
      const appointment = await storage.createAppointment(appointmentData);
      console.log("[DEBUG] Created appointment:", JSON.stringify(appointment, null, 2));
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error.name === 'ZodError') {
        const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return res.status(400).json({ message: `Error de validación: ${fieldErrors.join(', ')}` });
      }
      res.status(400).json({ 
        message: error.message || "No se pudo crear la cita. Verifique que todos los campos obligatorios estén completos." 
      });
    }
  });

  app.get('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get('/api/appointments/range', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      console.log("[DEBUG] Appointments range query - startDate:", startDate, "endDate:", endDate);
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      console.log("[DEBUG] Parsed dates - start:", start, "end:", end);
      const appointments = await storage.getAppointmentsByDateRange(start, end);
      console.log("[DEBUG] Found appointments:", appointments.length);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments by date range:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.put('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      // Convert data types before validation (same as POST route)
      const processedData = {
        ...req.body,
        appointmentDate: req.body.appointmentDate ? new Date(req.body.appointmentDate) : undefined,
        price: req.body.price ? req.body.price.toString() : null,
      };
      
      const appointmentData = insertAppointmentSchema.partial().parse(processedData);
      const appointment = await storage.updateAppointment(req.params.id, appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(400).json({ message: "Failed to update appointment" });
    }
  });

  app.put('/api/appointments/:id/protocol', isAuthenticated, async (req, res) => {
    try {
      const { protocolId } = updateAppointmentProtocolSchema.parse(req.body);
      const appointment = await storage.updateAppointmentProtocol(req.params.id, protocolId);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment protocol:", error);
      res.status(400).json({ message: "Failed to update appointment protocol" });
    }
  });

  app.put('/api/appointments/:id/progress', isAuthenticated, async (req, res) => {
    try {
      const data = updateAppointmentProgressSchema.parse(req.body);
      const appointment = await storage.updateAppointmentProgress(req.params.id, data);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment progress:", error);
      res.status(400).json({ message: "Failed to update appointment progress" });
    }
  });

  app.delete('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteAppointment(req.params.id);
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Pet types routes
  app.get('/api/pet-types', isAuthenticated, async (req, res) => {
    try {
      const petTypes = await storage.getPetTypes();
      res.json(petTypes);
    } catch (error) {
      console.error("Error fetching pet types:", error);
      res.status(500).json({ message: "Failed to fetch pet types" });
    }
  });

  app.post('/api/pet-types', isAuthenticated, async (req, res) => {
    try {
      const petTypeData = insertPetTypeSchema.parse(req.body);
      
      // Check if pet type already exists
      const existingPetType = await storage.getPetTypeByName(petTypeData.name);
      if (existingPetType) {
        return res.status(400).json({ message: "Pet type already exists" });
      }
      
      const petType = await storage.createPetType(petTypeData);
      res.json(petType);
    } catch (error) {
      console.error("Error creating pet type:", error);
      res.status(400).json({ message: "Failed to create pet type" });
    }
  });

  // Dogs routes
  app.post('/api/dogs', isAuthenticated, async (req, res) => {
    try {
      const dogData = insertDogSchema.parse(req.body);
      const dog = await storage.createDog(dogData);
      res.json(dog);
    } catch (error) {
      console.error("Error creating dog:", error);
      res.status(400).json({ message: "Failed to create dog" });
    }
  });

  app.get('/api/clients/:clientId/dogs', isAuthenticated, async (req, res) => {
    try {
      const dogs = await storage.getDogsByClientId(req.params.clientId);
      res.json(dogs);
    } catch (error) {
      console.error("Error fetching dogs:", error);
      res.status(500).json({ message: "Failed to fetch dogs" });
    }
  });

  // Dog image upload route
  app.post('/api/dogs/upload-image', isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting dog image upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });


  // Invoice routes
  app.post('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      const items = await storage.getInvoiceItemsByInvoiceId(req.params.id);
      res.json({ ...invoice, items });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // Expense routes
  app.post('/api/expenses', isAuthenticated, async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ message: "Failed to create expense" });
    }
  });

  app.get('/api/expenses', isAuthenticated, async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  // Progress entry routes
  app.post('/api/progress', isAuthenticated, async (req, res) => {
    try {
      const progressData = insertProgressEntrySchema.parse(req.body);
      const progress = await storage.createProgressEntry(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error creating progress entry:", error);
      res.status(400).json({ message: "Failed to create progress entry" });
    }
  });

  app.get('/api/dogs/:dogId/progress', isAuthenticated, async (req, res) => {
    try {
      const progress = await storage.getProgressEntriesByDogId(req.params.dogId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress entries:", error);
      res.status(500).json({ message: "Failed to fetch progress entries" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Financial summary
  app.get('/api/reports/financial', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const summary = await storage.getFinancialSummary(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  // Client portal routes (for client-specific data access)
  app.get('/api/client-portal/profile', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'client') {
        return res.status(403).json({ message: "Access denied. Client role required." });
      }

      const client = await storage.getClientByUserId(user.id);
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }

      const dogs = await storage.getDogsByClientId(client.id);
      res.json({ client, dogs });
    } catch (error) {
      console.error("Error fetching client portal profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get('/api/client-portal/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'client') {
        return res.status(403).json({ message: "Access denied. Client role required." });
      }

      const client = await storage.getClientByUserId(user.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const appointments = await storage.getAppointmentsByClientId(client.id);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching client appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get('/api/client-portal/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'client') {
        return res.status(403).json({ message: "Access denied. Client role required." });
      }

      const client = await storage.getClientByUserId(user.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const invoices = await storage.getInvoicesByClientId(client.id);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching client invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Client portal - Packages with session history
  app.get('/api/client-portal/packages', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'client') {
        return res.status(403).json({ message: "Access denied. Client role required." });
      }

      const client = await storage.getClientByUserId(user.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const packages = await storage.getServicePackagesByClient(client.id);
      
      // For each package, get recent sessions
      const packagesWithSessions = await Promise.all(
        packages.map(async (pkg: any) => {
          const sessions = await storage.getPackageSessionsByPackage(pkg.id);
          return {
            ...pkg,
            sessions: sessions.slice(0, 10), // Last 10 sessions
            totalSessionsRecorded: sessions.length,
          };
        })
      );

      res.json(packagesWithSessions);
    } catch (error) {
      console.error("Error fetching client packages with sessions:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  // Client portal - Dog progress timeline
  app.get('/api/client-portal/dogs/:dogId/progress', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'client') {
        return res.status(403).json({ message: "Access denied. Client role required." });
      }

      const client = await storage.getClientByUserId(user.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const { dogId } = req.params;
      
      // Verify the dog belongs to this client
      const dog = await storage.getDog(dogId);
      if (!dog || dog.clientId !== client.id) {
        return res.status(403).json({ message: "Access denied to this dog's information" });
      }

      // Get all progress data for the dog
      const [trainingSessions, progressEntries, medicalRecords] = await Promise.all([
        storage.getTrainingSessionsByDog(dogId),
        storage.getProgressEntriesByDog(dogId),
        storage.getMedicalRecordsByDog(dogId),
      ]);

      // Combine and sort by date
      const timeline: any[] = [];

      trainingSessions.forEach((session: any) => {
        timeline.push({
          type: 'training',
          date: session.sessionDate,
          title: 'Sesión de Entrenamiento',
          duration: session.durationMinutes,
          trainer: session.trainerName,
          exercises: session.exercisesCovered,
          progress: session.progressNotes,
          observations: session.observations,
          data: session,
        });
      });

      progressEntries.forEach((entry: any) => {
        timeline.push({
          type: 'progress',
          date: entry.date,
          title: entry.title || 'Nota de Progreso',
          description: entry.description,
          category: entry.category,
          rating: entry.rating,
          data: entry,
        });
      });

      medicalRecords.forEach((record: any) => {
        timeline.push({
          type: 'medical',
          date: record.recordDate,
          title: record.recordType === 'vaccination' ? 'Vacunación' : 
                 record.recordType === 'checkup' ? 'Chequeo' : 
                 record.recordType === 'treatment' ? 'Tratamiento' : 'Registro Médico',
          veterinarian: record.veterinarian,
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          notes: record.notes,
          data: record,
        });
      });

      // Sort by date descending (most recent first)
      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json({
        dog,
        timeline,
        summary: {
          totalTrainingSessions: trainingSessions.length,
          totalProgressEntries: progressEntries.length,
          totalMedicalRecords: medicalRecords.length,
        },
      });
    } catch (error) {
      console.error("Error fetching dog progress:", error);
      res.status(500).json({ message: "Failed to fetch dog progress" });
    }
  });

  // Client portal - Request appointment
  app.post('/api/client-portal/request-appointment', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'client') {
        return res.status(403).json({ message: "Access denied. Client role required." });
      }

      const client = await storage.getClientByUserId(user.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const { dogId, packageId, preferredDate, preferredTime, notes } = req.body;

      if (!dogId || !preferredDate) {
        return res.status(400).json({ message: "Dog and preferred date are required" });
      }

      // Verify the dog belongs to this client
      const dog = await storage.getDog(dogId);
      if (!dog || dog.clientId !== client.id) {
        return res.status(403).json({ message: "Dog not found or access denied" });
      }

      // Create appointment date with time
      const appointmentDateTime = new Date(preferredDate);
      if (preferredTime) {
        const [hours, minutes] = preferredTime.split(':');
        appointmentDateTime.setHours(parseInt(hours), parseInt(minutes || '0'));
      } else {
        appointmentDateTime.setHours(9, 0); // Default to 9 AM
      }

      // Create the appointment with pending status
      const appointmentData: any = {
        clientId: client.id,
        dogId,
        appointmentDate: appointmentDateTime,
        status: 'pending',
        notes: notes || `Solicitud de cita del cliente`,
      };

      // If package is selected (not "none"), get the service from the package
      if (packageId && packageId !== 'none') {
        const pkg = await storage.getServicePackage(packageId);
        if (pkg && pkg.clientId === client.id && pkg.remainingSessions > 0) {
          appointmentData.serviceId = pkg.serviceId;
          appointmentData.packageId = packageId;
          appointmentData.notes = `${notes || ''}\n[Usando paquete: ${pkg.packageName}]`.trim();
        }
      }

      const appointment = await storage.createAppointment(appointmentData);

      res.json({ 
        message: "Appointment request submitted successfully",
        appointment 
      });
    } catch (error) {
      console.error("Error requesting appointment:", error);
      res.status(500).json({ message: "Failed to request appointment" });
    }
  });

  // Object storage routes for serving pet images
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // For pet images, we allow access to authenticated users (simplified ACL)
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Dog Records/Expediente endpoints
  app.get('/api/dogs/:dogId/record', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const record = await storage.getDogCompleteRecord(dogId);
      
      if (!record) {
        return res.status(404).json({ message: "Dog record not found" });
      }

      res.json(record);
    } catch (error) {
      console.error("Error fetching dog record:", error);
      res.status(500).json({ message: "Failed to fetch dog record" });
    }
  });

  // Medical Records endpoints
  app.post('/api/medical-records', isAuthenticated, async (req, res) => {
    try {
      const { recordDate, ...rest } = req.body;
      const medicalRecord = await storage.createMedicalRecord({
        ...rest,
        recordDate: recordDate ? new Date(recordDate) : new Date(),
      });
      res.json(medicalRecord);
    } catch (error) {
      console.error("Error creating medical record:", error);
      res.status(400).json({ message: "Failed to create medical record" });
    }
  });

  app.get('/api/dogs/:dogId/medical-records', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const records = await storage.getMedicalRecordsByDogId(dogId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      res.status(500).json({ message: "Failed to fetch medical records" });
    }
  });

  app.get('/api/medical-records/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const record = await storage.getMedicalRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }

      res.json(record);
    } catch (error) {
      console.error("Error fetching medical record:", error);
      res.status(500).json({ message: "Failed to fetch medical record" });
    }
  });

  app.put('/api/medical-records/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { recordDate, ...rest } = req.body;
      const record = await storage.updateMedicalRecord(id, {
        ...rest,
        ...(recordDate && { recordDate: new Date(recordDate) }),
      });
      res.json(record);
    } catch (error) {
      console.error("Error updating medical record:", error);
      res.status(400).json({ message: "Failed to update medical record" });
    }
  });

  app.delete('/api/medical-records/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMedicalRecord(id);
      res.json({ message: "Medical record deleted successfully" });
    } catch (error) {
      console.error("Error deleting medical record:", error);
      res.status(500).json({ message: "Failed to delete medical record" });
    }
  });

  // Training Sessions endpoints
  app.post('/api/training-sessions', isAuthenticated, async (req, res) => {
    try {
      const { sessionDate, ...rest } = req.body;
      const session = await storage.createTrainingSession({
        ...rest,
        sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
      });
      res.json(session);
    } catch (error) {
      console.error("Error creating training session:", error);
      res.status(400).json({ message: "Failed to create training session" });
    }
  });

  app.get('/api/dogs/:dogId/training-sessions', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const sessions = await storage.getTrainingSessionsByDogId(dogId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching training sessions:", error);
      res.status(500).json({ message: "Failed to fetch training sessions" });
    }
  });

  app.get('/api/training-sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getTrainingSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Training session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching training session:", error);
      res.status(500).json({ message: "Failed to fetch training session" });
    }
  });

  app.put('/api/training-sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { sessionDate, ...rest } = req.body;
      const session = await storage.updateTrainingSession(id, {
        ...rest,
        ...(sessionDate && { sessionDate: new Date(sessionDate) }),
      });
      res.json(session);
    } catch (error) {
      console.error("Error updating training session:", error);
      res.status(400).json({ message: "Failed to update training session" });
    }
  });

  app.delete('/api/training-sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTrainingSession(id);
      res.json({ message: "Training session deleted successfully" });
    } catch (error) {
      console.error("Error deleting training session:", error);
      res.status(500).json({ message: "Failed to delete training session" });
    }
  });

  // Evidence endpoints
  app.post('/api/evidence', isAuthenticated, async (req, res) => {
    try {
      const evidence = await storage.createEvidence(req.body);
      res.json(evidence);
    } catch (error) {
      console.error("Error creating evidence:", error);
      res.status(400).json({ message: "Failed to create evidence" });
    }
  });

  app.get('/api/dogs/:dogId/evidence', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const evidences = await storage.getEvidenceByDogId(dogId);
      res.json(evidences);
    } catch (error) {
      console.error("Error fetching evidence:", error);
      res.status(500).json({ message: "Failed to fetch evidence" });
    }
  });

  app.get('/api/training-sessions/:sessionId/evidence', isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const evidences = await storage.getEvidenceByTrainingSessionId(sessionId);
      res.json(evidences);
    } catch (error) {
      console.error("Error fetching session evidence:", error);
      res.status(500).json({ message: "Failed to fetch session evidence" });
    }
  });

  app.delete('/api/evidence/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEvidence(id);
      res.json({ message: "Evidence deleted successfully" });
    } catch (error) {
      console.error("Error deleting evidence:", error);
      res.status(500).json({ message: "Failed to delete evidence" });
    }
  });

  // Teacher Portal Routes
  
  // Get today's appointments for a teacher
  app.get('/api/teacher/appointments/today', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const appointments = await storage.getTodayAppointmentsByTeacher(req.user.id);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching teacher appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get dogs assigned to a teacher
  app.get('/api/teacher/assigned-dogs', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const dogs = await storage.getAssignedDogsByTeacher(req.user.id);
      res.json(dogs);
    } catch (error) {
      console.error("Error fetching assigned dogs:", error);
      res.status(500).json({ message: "Failed to fetch assigned dogs" });
    }
  });

  // Get recent notes for a teacher
  app.get('/api/teacher/notes/recent', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const notes = await storage.getRecentNotesByTeacher(req.user.id);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching recent notes:", error);
      res.status(500).json({ message: "Failed to fetch recent notes" });
    }
  });

  // Get teacher personal statistics
  app.get('/api/teacher/stats', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getTeacherStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching teacher stats:", error);
      res.status(500).json({ message: "Failed to fetch teacher stats" });
    }
  });

  // Get training sessions for teacher's assigned dogs
  app.get('/api/teacher/training-sessions', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get assigned dogs and then their training sessions
      const assignedDogs = await storage.getAssignedDogsByTeacher(req.user.id);
      const dogIds = assignedDogs.map(dog => dog.id);
      
      if (dogIds.length === 0) {
        return res.json([]);
      }

      // Get training sessions for all assigned dogs
      const sessionsPromises = dogIds.map(dogId => storage.getTrainingSessionsByDogId(dogId));
      const sessionsArrays = await Promise.all(sessionsPromises);
      const allSessions = sessionsArrays.flat();
      
      // Sort by session date descending
      const sortedSessions = allSessions.sort((a, b) => 
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
      );
      
      res.json(sortedSessions);
    } catch (error) {
      console.error("Error fetching teacher training sessions:", error);
      res.status(500).json({ message: "Failed to fetch training sessions" });
    }
  });

  // Object Storage endpoints for evidence files
  app.post('/api/teacher/evidence/upload-url', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // For now, return a placeholder - will implement object storage integration
      const uploadURL = `https://placeholder-upload-url.com/evidence/${Date.now()}`;
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Create teacher assignment
  app.post('/api/teacher/assignments', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const assignmentData = req.body;
      const assignment = await storage.createTeacherAssignment(assignmentData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating teacher assignment:", error);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  // Get teacher assignments
  app.get('/api/teacher/assignments', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getAllTeacherAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching teacher assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Update teacher assignment
  app.put('/api/teacher/assignments/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const assignment = await storage.updateTeacherAssignment(id, updateData);
      res.json(assignment);
    } catch (error) {
      console.error("Error updating teacher assignment:", error);
      res.status(500).json({ message: "Failed to update assignment" });
    }
  });

  // Task endpoints
  // Create task (admin only)
  app.post('/api/tasks', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({
        ...taskData,
        createdBy: req.user.id,
      });
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: "Failed to create task" });
    }
  });

  // Get all tasks (admin only)
  app.get('/api/tasks', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get tasks by date range (for calendar view)
  app.get('/api/tasks/range', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }
      const tasks = await storage.getTasksByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by range:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get tasks for logged-in teacher
  app.get('/api/teacher/tasks', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied" });
      }
      const tasks = await storage.getTasksByTeacher(req.user.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching teacher tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get unread tasks count for logged-in teacher
  app.get('/api/teacher/tasks/unread', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied" });
      }
      const count = await storage.getUnreadTasksByTeacher(req.user.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread tasks count:", error);
      res.status(500).json({ message: "Failed to fetch unread tasks count" });
    }
  });

  // Get single task
  app.get('/api/tasks/:id', isAuthenticated, async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Update task
  app.put('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Only admin or assigned teacher can update
      if (req.user.role !== 'admin' && task.assignedTeacher.id !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedTask = await storage.updateTask(req.params.id, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  // Mark task as read
  app.put('/api/tasks/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Only assigned teacher can mark as read
      if (task.assignedTeacher.id !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.markTaskAsRead(req.params.id);
      res.json({ message: "Task marked as read" });
    } catch (error) {
      console.error("Error marking task as read:", error);
      res.status(500).json({ message: "Failed to mark task as read" });
    }
  });

  // Delete task (admin only)
  app.delete('/api/tasks/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Assessment routes (Evaluaciones de Valoración)
  app.post('/api/assessments', isAuthenticated, async (req: any, res) => {
    try {
      const { assessmentDate, ...rest } = req.body;
      const assessmentData = insertAssessmentSchema.parse({
        ...rest,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : new Date(),
        evaluatorId: req.user.id,
      });
      const assessment = await storage.createAssessment(assessmentData);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(400).json({ message: "Failed to create assessment" });
    }
  });

  app.get('/api/dogs/:dogId/assessments', isAuthenticated, async (req, res) => {
    try {
      const assessments = await storage.getAssessmentsByDogId(req.params.dogId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.get('/api/assessments/:id', isAuthenticated, async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  app.put('/api/assessments/:id', isAuthenticated, async (req, res) => {
    try {
      const { assessmentDate, ...rest } = req.body;
      const assessmentData = insertAssessmentSchema.partial().parse({
        ...rest,
        ...(assessmentDate && { assessmentDate: new Date(assessmentDate) }),
      });
      const assessment = await storage.updateAssessment(req.params.id, assessmentData);
      res.json(assessment);
    } catch (error) {
      console.error("Error updating assessment:", error);
      res.status(400).json({ message: "Failed to update assessment" });
    }
  });

  app.delete('/api/assessments/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteAssessment(req.params.id);
      res.json({ message: "Assessment deleted successfully" });
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ message: "Failed to delete assessment" });
    }
  });

  // ============ Package Template Routes (Plantillas de Paquetes) ============

  // Get all package templates
  app.get('/api/package-templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getPackageTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching package templates:", error);
      res.status(500).json({ message: "Error al obtener las plantillas de paquetes" });
    }
  });

  // Get active package templates only
  app.get('/api/package-templates/active', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getActivePackageTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching active templates:", error);
      res.status(500).json({ message: "Error al obtener las plantillas activas" });
    }
  });

  // Get package templates by category
  app.get('/api/package-templates/category/:category', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getPackageTemplatesByCategory(req.params.category);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates by category:", error);
      res.status(500).json({ message: "Error al obtener las plantillas por categoría" });
    }
  });

  // Get single package template
  app.get('/api/package-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const template = await storage.getPackageTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Plantilla no encontrada" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Error al obtener la plantilla" });
    }
  });

  // Create package template (admin only)
  app.post('/api/package-templates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const template = await storage.createPackageTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(400).json({ message: "Error al crear la plantilla" });
    }
  });

  // Update package template (admin only)
  app.put('/api/package-templates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const template = await storage.updatePackageTemplate(req.params.id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(400).json({ message: "Error al actualizar la plantilla" });
    }
  });

  // Delete package template (admin only)
  app.delete('/api/package-templates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deletePackageTemplate(req.params.id);
      res.json({ message: "Plantilla eliminada exitosamente" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Error al eliminar la plantilla" });
    }
  });

  // ============ Service Package Routes (Gestión de Paquetes) ============
  
  // Get all packages (admin only)
  app.get('/api/packages', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const packages = await storage.getServicePackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Error al obtener los paquetes" });
    }
  });

  // Get packages by client
  app.get('/api/clients/:clientId/packages', isAuthenticated, async (req: any, res) => {
    try {
      const packages = await storage.getServicePackagesByClient(req.params.clientId);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching client packages:", error);
      res.status(500).json({ message: "Error al obtener los paquetes del cliente" });
    }
  });

  // Get active packages by client
  app.get('/api/clients/:clientId/packages/active', isAuthenticated, async (req: any, res) => {
    try {
      const packages = await storage.getActivePackagesByClient(req.params.clientId);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching active packages:", error);
      res.status(500).json({ message: "Error al obtener los paquetes activos" });
    }
  });

  // Get single package
  app.get('/api/packages/:id', isAuthenticated, async (req, res) => {
    try {
      const pkg = await storage.getServicePackage(req.params.id);
      if (!pkg) {
        return res.status(404).json({ message: "Paquete no encontrado" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Error fetching package:", error);
      res.status(500).json({ message: "Error al obtener el paquete" });
    }
  });

  // Create package
  app.post('/api/packages', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { purchaseDate, expiryDate, price, totalSessions, sessionsUsed, sessionsRemaining, ...rest } = req.body;
      const packageData = insertServicePackageSchema.parse({
        ...rest,
        price: price !== undefined ? String(price) : undefined,
        totalSessions: totalSessions !== undefined ? Number(totalSessions) : undefined,
        sessionsUsed: sessionsUsed !== undefined ? Number(sessionsUsed) : 0,
        sessionsRemaining: sessionsRemaining !== undefined ? Number(sessionsRemaining) : (totalSessions !== undefined ? Number(totalSessions) : 0),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      });
      const pkg = await storage.createServicePackage(packageData);
      res.json(pkg);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(400).json({ message: "Error al crear el paquete" });
    }
  });

  // Update package
  app.put('/api/packages/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { purchaseDate, expiryDate, ...rest } = req.body;
      const packageData = insertServicePackageSchema.partial().parse({
        ...rest,
        ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
      });
      const pkg = await storage.updateServicePackage(req.params.id, packageData);
      res.json(pkg);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(400).json({ message: "Error al actualizar el paquete" });
    }
  });

  // Delete package
  app.delete('/api/packages/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteServicePackage(req.params.id);
      res.json({ message: "Paquete eliminado exitosamente" });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ message: "Error al eliminar el paquete" });
    }
  });

  // Get packages with alerts
  app.get('/api/packages/alerts/pending', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const packages = await storage.getPackagesWithAlerts();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages with alerts:", error);
      res.status(500).json({ message: "Error al obtener paquetes con alertas" });
    }
  });

  // Get package dashboard metrics
  app.get('/api/packages/dashboard/metrics', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const metrics = await storage.getPackageDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching package metrics:", error);
      res.status(500).json({ message: "Error al obtener métricas de paquetes" });
    }
  });

  // ============ Package Session Routes (Control de Sesiones) ============
  
  // Get sessions by package
  app.get('/api/packages/:packageId/sessions', isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getPackageSessionsByPackage(req.params.packageId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching package sessions:", error);
      res.status(500).json({ message: "Error al obtener las sesiones del paquete" });
    }
  });

  // Get sessions by client
  app.get('/api/clients/:clientId/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessions = await storage.getPackageSessionsByClient(req.params.clientId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching client sessions:", error);
      res.status(500).json({ message: "Error al obtener las sesiones del cliente" });
    }
  });

  // Consume session from package
  app.post('/api/packages/:packageId/consume', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionDate, ...rest } = req.body;
      const sessionData = insertPackageSessionSchema.omit({ packageId: true }).parse({
        ...rest,
        sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
        registeredBy: req.user.id,
      });
      const result = await storage.consumeSession(req.params.packageId, sessionData);
      res.json(result);
    } catch (error: any) {
      console.error("Error consuming session:", error);
      res.status(400).json({ message: error.message || "Error al registrar la sesión" });
    }
  });

  // ============ Package Alert Routes (Alertas y Notificaciones) ============
  
  // Get all unread alerts (admin)
  app.get('/api/alerts/unread', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const alerts = await storage.getAllUnreadAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching unread alerts:", error);
      res.status(500).json({ message: "Error al obtener las alertas" });
    }
  });

  // Get alerts by client
  app.get('/api/clients/:clientId/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const alerts = await storage.getPackageAlertsByClient(req.params.clientId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching client alerts:", error);
      res.status(500).json({ message: "Error al obtener las alertas del cliente" });
    }
  });

  // Get unread alerts by client
  app.get('/api/clients/:clientId/alerts/unread', isAuthenticated, async (req: any, res) => {
    try {
      const alerts = await storage.getUnreadAlertsByClient(req.params.clientId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching unread alerts:", error);
      res.status(500).json({ message: "Error al obtener las alertas no leídas" });
    }
  });

  // Mark alert as read
  app.put('/api/alerts/:id/read', isAuthenticated, async (req, res) => {
    try {
      await storage.markAlertAsRead(req.params.id);
      res.json({ message: "Alerta marcada como leída" });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Error al marcar la alerta como leída" });
    }
  });

  // Mark all alerts as read for client
  app.put('/api/clients/:clientId/alerts/read-all', isAuthenticated, async (req, res) => {
    try {
      await storage.markAllAlertsAsRead(req.params.clientId);
      res.json({ message: "Todas las alertas marcadas como leídas" });
    } catch (error) {
      console.error("Error marking all alerts as read:", error);
      res.status(500).json({ message: "Error al marcar las alertas como leídas" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
