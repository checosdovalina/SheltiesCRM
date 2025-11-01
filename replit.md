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

### November 1, 2025 - Complete Expediente System with Medical Records, Training & Evidence

#### Major Feature: Full Expediente System with CRUD Operations
- **Database Schema Extended**: Added 40+ new fields to `dogs` table for complete expediente (medical/behavioral record) tracking
- **New Data Models**: Medical records, training sessions, and evidence tables with proper relations to dogs
- **Expediente Fields Include**:
  - **Objetivos**: Problem description, training objectives
  - **Antecedentes**: Acquisition source, arrival age, canine family
  - **Rutina**: Daily routine, feeding schedule
  - **Salud**: Veterinarian, vaccines, diseases, disease predisposition
  - **Comportamiento**: Fears, aggression, hyperactivity, destruction, reactivity, anxiety, hypersensitivity, other behaviors
  - **Observaciones Físicas**: Posture, eye shape, body movement, physical temp, teeth condition, smell, muscle tension, touch reactive, salivating, sweating paws, shedding
  - **Movimiento**: Balance, gait, speed, coordination
  - **Correa**: Leash comfort, leash pulling, leash reactive, leash aggressive
  - **Interacción Social**: Calming signals, reaction to strangers, reaction to other dogs
  - **Owner Disposition**: Owner's commitment and disposition

#### New Pages and Components
- **Expediente Detail Page** (`/expediente/:id`): Professional two-column layout with:
  - Left sidebar: General pet information (always visible)
  - Right side: Four tabs (Resumen, Médico, Entrenamientos, Evidencias)
  - PDF-style formatting with color-coded cards, badges, and professional layout
  - Fully responsive for desktop, iPad, and iPhone Pro Max 15
- **Medical Record Modal** (`medical-record-modal.tsx`): Add medical records with date, type, veterinarian, diagnosis, treatment, and notes
- **Training Session Modal** (`training-modal.tsx`): Record training sessions with date, duration, trainer, exercises, progress, and observations
- **Evidence Modal** (`evidence-modal.tsx`): Upload evidence with type, date, description, and file URL
- **Enhanced Dog Modal**: Tabbed interface with 8 sections (Básico, Objetivos, Historia, Rutina, Salud, Comportamiento, Observaciones, Movimiento)
- **Routes Updated**: Added `/expediente/:id` and `/expedientes` routes

#### API Endpoints
- **GET `/api/dogs/:id/medical-records`**: Fetch all medical records for a dog
- **POST `/api/medical-records`**: Create new medical record
- **GET `/api/dogs/:id/training-sessions`**: Fetch all training sessions for a dog
- **POST `/api/training-sessions`**: Create new training session
- **GET `/api/dogs/:id/evidence`**: Fetch all evidence for a dog
- **POST `/api/evidence`**: Create new evidence entry
- **GET `/api/dogs/:id`**: Enhanced to include client information for full expediente display

#### Technical Improvements
- **Boolean Fields**: Added default values (false) to all boolean fields to prevent null-related errors
- **Data Migration**: Existing pet records updated to have false defaults for new boolean fields
- **Type Safety**: All new fields properly typed with Zod validation
- **Cache Invalidation**: Fixed critical bug where query keys were misaligned - now records appear immediately after creation without page refresh
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes
- **Professional UI**: PDF-style formatting with color-coded sections matching provided templates

#### User Experience
- **For Professors/Admins**: Can now:
  - Complete comprehensive behavioral assessment when registering pets
  - Add medical records with detailed information
  - Record training sessions with progress tracking
  - Upload evidence (photos, videos, documents)
  - View complete expediente in professional format
- **Tab Organization**: Information organized into logical sections for easier navigation
- **Professional Display**: Expediente shows all information in clean, color-coded cards
- **Immediate Updates**: New records appear instantly without page refresh
- **Mobile Optimization**: Compact layout for smaller screens while maintaining functionality

### November 1, 2025 - Pet Form Focus Issue Fix

#### Critical Bug Fix
- **Input Focus Problem**: Fixed critical issue where users could only type one character in form fields before focus jumped
- **Root Cause**: Uppy Dashboard Modal (from @uppy/react) was capturing focus and conflicting with Radix UI Dialog
- **Solution**: Replaced Uppy-based ImageUploader with SimpleImageUploader using native HTML file input

#### Component Changes
- **SimpleImageUploader**: New component created using native file input with manual fetch to upload endpoint
- **PetTypeSelector**: Memoized component to prevent unnecessary re-renders
- **DogModal**: Optimized with useCallback and useMemo to minimize re-renders

#### Known Limitations
- **Object Storage**: Image upload will show errors if Replit object storage sidecar is unavailable (port 1106)
- **Error Handling**: Image upload errors are now gracefully handled and displayed to user via toast notifications

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