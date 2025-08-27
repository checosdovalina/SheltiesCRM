import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Create default services if none exist
  try {
    const services = await storage.getServices();
    if (services.length === 0) {
      log("Creating default services...");
      await storage.createService({
        name: "Entrenamiento Básico",
        type: "training",
        price: "50.00",
        description: "Entrenamiento básico de obediencia para perros",
        duration: 60,
        isActive: true
      });
      await storage.createService({
        name: "Guardería Diaria", 
        type: "daycare",
        price: "30.00",
        description: "Servicio de guardería para mascotas durante el día",
        duration: 480,
        isActive: true
      });
      await storage.createService({
        name: "Pensión Nocturna",
        type: "boarding", 
        price: "80.00",
        description: "Pensión nocturna para mascotas",
        duration: 1440,
        isActive: true
      });
      await storage.createService({
        name: "Consulta de Comportamiento",
        type: "other",
        price: "75.00", 
        description: "Consulta especializada en comportamiento canino",
        duration: 90,
        isActive: true
      });
      log("Default services created successfully");
    }
  } catch (error) {
    console.error("Error creating default services:", error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
