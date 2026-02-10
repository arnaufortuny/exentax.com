# Easy US LLC — Platform Documentation

## Overview
Easy US LLC is a full-stack SaaS platform designed to streamline US LLC formation for international entrepreneurs, particularly Spanish-speaking clients. It facilitates LLC creation in New Mexico, Wyoming, and Delaware, offering end-to-end services such as business formation, annual maintenance, banking assistance, compliance tracking, and multilingual professional support. The platform is production-ready, featuring a comprehensive admin panel, secure document handling, and an automated compliance calendar, aiming to simplify US business entry for a global audience.

## User Preferences
- Clear, concise communication without technical jargon
- Iterative development with feedback at each stage
- Approval required before significant codebase or design changes
- Spanish as primary language, with full multilingual support

## System Architecture

### Tech Stack
- **Frontend:** React 18 + Vite, Wouter, TanStack Query v5, shadcn/ui + Radix, Tailwind CSS, Framer Motion
- **Backend:** Express.js (Node.js), TypeScript
- **Database:** PostgreSQL (Neon-backed), Drizzle ORM, Zod
- **Authentication:** Custom session-based, Google OAuth, document-based identity verification
- **Email:** Nodemailer via IONOS SMTP
- **PDF Generation:** jspdf (client-side), pdfkit (server-side)
- **Storage:** Replit Object Storage
- **Internationalization:** react-i18next (7 languages)

### Design System
- **Colors:** Primary Green, Carbon Black, Off White, Soft Gray, Text Gray
- **Typography:** Space Grotesk, Inter, DM Sans
- **Theme:** Full dark/light mode with CSS custom properties
- **Animations:** Framer Motion
- **Components:** shadcn/ui with custom elevation utilities

### Project Structure
The project is structured into `client/`, `server/`, `shared/`, `uploads/`, and `drizzle/` directories.
- `client/`: Contains React components for dashboard, forms, layout, pages (auth, legal, home, services, dashboard, LLC/maintenance forms), locales, utilities, and hooks.
- `server/`: Houses API routes (admin, accounting, auth, consultations, contact, LLC, maintenance, messages, orders, user-profile), custom authentication, email services, ID generation, OAuth integration, and storage interfaces.
- `shared/`: Defines the Drizzle ORM schema (28 tables) and Zod validators.

### Key Features
- **Security:** AES-256 encryption, CSRF protection, rate limiting, document-based identity verification, SHA-256 file integrity, document access logging, secure document download, DOMPurify HTML sanitization, session regeneration after authentication, request body size limits (1MB), Permissions-Policy headers.
- **Identity Verification:** Document-based workflow (request → upload → approve/reject) replacing OTP system. Admin requests verification, client uploads ID document (PDF/JPG/PNG, max 5MB), admin reviews and approves/rejects with email notifications in 7 languages. Account suspended during review. Documents stored in `uploads/identity-docs/`.
- **Internationalization:** Support for 7 languages with 2,500+ translation keys, automatic language detection, and user preference saving.
- **Client Tools:** Invoice Generator, Operating Agreement Generator, CSV Transaction Generator, Price Calculator (tax comparison), State Comparison.
- **Admin Panel:** Comprehensive management for orders, users, documents, billing, communications, accounting, consultations, and analytics.
- **Form System:** Multi-step wizards, auto-fill, draft saving, unauthenticated data transfer, age verification.
- **Compliance Calendar:** Automated IRS deadline calculation, annual report reminders, registered agent tracking.
- **Stability:** Database retry logic with exponential backoff (`server/lib/db-utils.ts`), structured logging (`server/lib/logger.ts`), health check with pool diagnostics (`/api/healthz`), optimized database indexes.
- **Code Organization:** User routes split into focused modules: `user-profile.ts`, `user-documents.ts`, `user-security.ts`.

## External Dependencies
- **Database Hosting:** Neon (for PostgreSQL)
- **Email Service:** IONOS SMTP
- **Authentication:** Google OAuth
- **Error Monitoring:** Sentry (optional)
- **Review Platform:** Trustpilot (via BCC email, optional)