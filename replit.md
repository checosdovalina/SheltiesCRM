# Shelties CRM

## Overview

Shelties CRM is a comprehensive customer relationship management system specifically designed for dog training businesses. The application provides tools for managing clients, dogs, appointments, services, billing, expenses, and progress tracking. Built as a full-stack web application, it features a React-based frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack React Query for server state management
- **Forms**: React Hook Form with Zod schema validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful architecture with resource-based endpoints
- **Middleware**: Custom logging, error handling, and authentication middleware
- **Session Management**: Express sessions with PostgreSQL storage

### Authentication & Authorization
- **Provider**: Replit Auth (OpenID Connect)
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Role-based access control (admin/client roles)
- **Security**: Secure cookies, CSRF protection, and session management

### Database Design
- **Database**: PostgreSQL with Neon serverless
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**: Users, Clients, Dogs, Services, Appointments, Invoices, Expenses, Progress Entries
- **Relationships**: Proper foreign key constraints and relational design
- **Session Storage**: Dedicated sessions table for authentication state

### Data Validation
- **Schema Definition**: Zod schemas for runtime type checking
- **Validation Layer**: Shared validation schemas between frontend and backend
- **Type Safety**: Full TypeScript integration with Drizzle Zod for database types

### Development & Deployment
- **Development**: Hot module replacement with Vite
- **Production Build**: Separate client and server builds
- **Static Assets**: Vite handles client-side asset optimization
- **Environment**: Replit-optimized with development tooling integration

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Custom WebSocket constructor for Neon compatibility

### Authentication Services
- **Replit Auth**: OpenID Connect provider for user authentication
- **Session Management**: PostgreSQL-based session storage for scalability

### UI & Component Libraries
- **Radix UI**: Headless, accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component system based on Radix UI

### Development Tools
- **Replit Integration**: Development environment with error overlays and cartographer
- **TypeScript**: Static type checking across the entire codebase
- **ESLint/Prettier**: Code formatting and linting (implied by project structure)

### Runtime Dependencies
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Utility for managing CSS class variations
- **CLSX**: Conditional CSS class utility

## Recent Changes

### October 30, 2025 - Calendar Enhancements and Navigation Fix

#### Calendar Features Added
- **Teacher Filter**: Admin-only teacher dropdown to view individual teacher schedules
- **Task Integration**: Calendar now displays both appointments and tasks for selected teachers
- **Availability View**: Shows free time slots for selected teacher on selected date (8:00-19:00 working hours)
- **Teacher-specific Filtering**: Both appointments and tasks are filtered by selected teacher
- **API Endpoint**: Added `/api/teachers` endpoint to fetch list of teachers for calendar filter

#### Navigation Enhancement
- **Calendar Link Added**: Added "Calendario" link to main navigation menu using CalendarDays icon
- **Route**: Accessible at `/calendar` path for all authenticated users
- **Mobile Navigation**: Calendar now appears in mobile navigation as well

#### Bug Fixes
- **Records Page Fix**: Fixed Array.isArray validation in Records page to prevent flatMap errors when data is not yet loaded
- **Type Safety**: Added proper TypeScript types to useQuery hooks to prevent runtime errors

#### Technical Details
- Calendar defaults to "all teachers" view to preserve non-admin experience
- Working hours currently hardcoded to 8:00-19:00 (configurable in future)
- Teacher filter only visible to admin users
- Both appointments and tasks count toward occupied time slots in availability view