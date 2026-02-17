# Shelties CRM

## Overview

Shelties CRM is a comprehensive customer relationship management system tailored for dog training businesses. It manages clients, dogs, appointments, services, billing, expenses, and progress tracking. The system facilitates complete expediente tracking for dogs, including medical records, training sessions, and behavioral observations, and offers a gallery feature for sharing media publicly. It's built as a full-stack web application with a React frontend and a Node.js/Express backend, using PostgreSQL for data persistence and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **UI**: shadcn/ui (Radix UI primitives), Tailwind CSS
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Build**: Vite

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js (REST API)
- **ORM**: Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect) via Passport.js, PostgreSQL-backed sessions
- **Authorization**: Role-based access control (admin/client)

### Database
- **Type**: PostgreSQL (Neon serverless)
- **Schema Management**: Drizzle Kit
- **Key Entities**: Users, Clients, Dogs, Services, Appointments, Invoices, Expenses, Progress Entries, Medical Records, Training Sessions, Evidence, Gallery Days, Gallery Items
- **Data Validation**: Zod schemas for type-safe validation

### Core Features
- **Comprehensive Expediente System**: Detailed dog profiles including medical history, behavioral assessments, and training logs.
- **Appointment & Task Management**: Calendar view with teacher-specific filtering and availability.
- **Client & Service Management**: Tools for managing customer information and service offerings.
- **Gallery Module**: Create and manage media galleries with public sharing capabilities.

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL
- **Replit Object Storage**: For file uploads (e.g., gallery items, evidence)

### Authentication Services
- **Replit Auth**: OpenID Connect provider

### UI & Component Libraries
- **Radix UI**: Headless UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **shadcn/ui**: Component library

### Runtime Utilities
- **Date-fns**: Date manipulation
- **Zod**: Schema validation