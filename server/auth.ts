import bcrypt from 'bcrypt';
import session from 'express-session';
import crypto from 'crypto';
import type { Express, RequestHandler } from 'express';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';
import type { User, LoginData, RegisterData } from '@shared/schema';

const SALT_ROUNDS = 12;

// Generate or get session secret
function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  // Generate a random secret if not provided (for development or first-time setup)
  const generatedSecret = crypto.randomBytes(32).toString('hex');
  console.warn('WARNING: SESSION_SECRET not set. Generated temporary secret. For production, set SESSION_SECRET environment variable.');
  return generatedSecret;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const isProduction = process.env.NODE_ENV === 'production';
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: getSessionSecret(),
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction, // true in production with HTTPS
      maxAge: sessionTtl,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/', // Ensure cookie is available for all paths
    },
    proxy: isProduction, // Trust first proxy in production
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(loginData: LoginData): Promise<User | null> {
  try {
    const user = await storage.getUserByEmail(loginData.email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await verifyPassword(loginData.password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function registerAdmin(registerData: RegisterData): Promise<User | null> {
  try {
    // Check if any admin exists
    const existingAdmins = await storage.getAdminUsers();
    if (existingAdmins.length > 0) {
      throw new Error('Admin user already exists');
    }

    const hashedPassword = await hashPassword(registerData.password);
    
    const adminUser = await storage.createUserWithPassword({
      email: registerData.email,
      password: hashedPassword,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      role: 'admin'
    });

    return adminUser;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}

export function setupAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const isAdmin: RequestHandler = async (req: any, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }
  next();
};

// Declare module augmentation for session
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}