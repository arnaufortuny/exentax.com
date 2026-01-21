# Easy US LLC - Replit Agent Guide

## Overview

Easy US LLC is a full-stack web application for a business formation service that helps users create LLCs (Limited Liability Companies) in the United States. The platform targets Spanish-speaking entrepreneurs looking to establish US-based companies, offering packages for New Mexico, Wyoming, and Delaware formations.

The application handles the complete LLC formation workflow: product selection, order creation, application form completion with document uploads, and status tracking. It integrates with Stripe for payments and uses Replit Auth for user authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion
- **Build Tool**: Vite with custom path aliases (@/, @shared/, @assets/)

The frontend follows a pages-based structure where each route corresponds to a page component. Components are organized into UI primitives (shadcn/ui), layout components, and feature-specific components.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage

The backend uses a storage abstraction layer (server/storage.ts) that implements database operations. This pattern allows for easier testing and potential future database swaps.

### Data Storage
- **Database**: PostgreSQL (provisioned via Replit)
- **Schema Location**: shared/schema.ts using Drizzle ORM
- **Migrations**: Managed via drizzle-kit with migrations stored in /migrations folder

Key database tables:
- `users` and `sessions` - Authentication (required for Replit Auth)
- `products` - LLC packages with pricing
- `orders` - Purchase records linked to users and products
- `llc_applications` - Form data for LLC formation applications
- `application_documents` - Uploaded document references

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Implementation**: Passport.js with custom OIDC strategy
- **Session Storage**: PostgreSQL via connect-pg-simple
- **Protected Routes**: Uses `isAuthenticated` middleware for API endpoints requiring auth

The auth system supports guest order creation - users can start an order without logging in, and a guest user record is created automatically.

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Database schemas and Zod validation schemas
- `routes.ts` - API endpoint definitions with input/output types
- `models/auth.ts` - User and session table definitions

## External Dependencies

### Payment Processing
- **Stripe**: Payment processing integration (stripe package installed, checkout flow implemented)

### Database
- **PostgreSQL**: Primary database, connection via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit Auth**: OpenID Connect authentication via replit.com/oidc
- Required environment variables: ISSUER_URL, REPL_ID, SESSION_SECRET

### Email (Package Installed)
- **Nodemailer**: Email sending capability (nodemailer package present)

### AI Services (Packages Installed)
- **OpenAI**: openai package installed
- **Google Generative AI**: @google/generative-ai package installed

### Third-Party Banking Partners (Referenced in UI)
- Mercury Bank
- Relay Financial

These are mentioned in the chatbot and UI for user guidance about US banking options, not direct API integrations.

### Build and Development
- **Vite**: Frontend development server and build tool
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development