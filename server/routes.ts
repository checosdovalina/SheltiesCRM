import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, authenticateUser, registerAdmin } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import {
  insertClientSchema,
  insertDogSchema,
  insertServiceSchema,
  insertAppointmentSchema,
  insertInvoiceSchema,
  insertExpenseSchema,
  insertProgressEntrySchema,
  insertPetTypeSchema,
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
      const dogData = insertDogSchema.parse(req.body);
      console.log("[DEBUG] Creating dog with data:", JSON.stringify(dogData, null, 2)); // Debug log
      const dog = await storage.createDog(dogData);
      console.log("[DEBUG] Created dog result:", JSON.stringify(dog, null, 2)); // Debug log
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
      res.json(dog);
    } catch (error) {
      console.error("Error fetching dog:", error);
      res.status(500).json({ message: "Failed to fetch dog" });
    }
  });

  app.put('/api/dogs/:id', isAuthenticated, async (req, res) => {
    try {
      const dogData = insertDogSchema.partial().parse(req.body);
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
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const appointments = await storage.getAppointmentsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
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
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(400).json({ message: "Failed to update appointment" });
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

  app.put('/api/dogs/:id', isAuthenticated, async (req, res) => {
    try {
      const dogData = insertDogSchema.partial().parse(req.body);
      const dog = await storage.updateDog(req.params.id, dogData);
      res.json(dog);
    } catch (error) {
      console.error("Error updating dog:", error);
      res.status(400).json({ message: "Failed to update dog" });
    }
  });

  app.delete('/api/dogs/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDog(req.params.id);
      res.json({ message: "Dog deleted successfully" });
    } catch (error) {
      console.error("Error deleting dog:", error);
      res.status(500).json({ message: "Failed to delete dog" });
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

  // Serve dog images
  app.get('/dog-images/:imageId(*)', async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const imagePath = `/dog-images/${req.params.imageId}`;
      const imageFile = await objectStorageService.getDogImageFile(imagePath);
      await objectStorageService.downloadObject(imageFile, res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ message: "Image not found" });
      }
      console.error("Error serving dog image:", error);
      res.status(500).json({ message: "Failed to serve image" });
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'client') {
        return res.status(403).json({ message: "Access denied. Client role required." });
      }

      const client = await storage.getClientByUserId(userId);
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'client') {
        return res.status(403).json({ message: "Access denied. Client role required." });
      }

      const client = await storage.getClientByUserId(userId);
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'client') {
        return res.status(403).json({ message: "Access denied. Client role required." });
      }

      const client = await storage.getClientByUserId(userId);
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

  // Object storage routes for serving pet images
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // Check ACL policy if needed (for now, allow all authenticated users to view pet images)
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: (req as any).session?.userId,
      });
      
      if (!canAccess) {
        return res.sendStatus(404); // Return 404 instead of 401 for security
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
