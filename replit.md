# Exentax — Complete Platform Documentation

## Overview
Exentax is a full-stack SaaS platform designed to simplify US LLC formation for international entrepreneurs, particularly Spanish-speaking clients. It provides end-to-end services including business formation in New Mexico, Wyoming, and Delaware, annual maintenance, banking assistance, compliance tracking, and multilingual professional support. The platform is production-ready, featuring a comprehensive admin panel, secure document handling, and an automated compliance calendar, aiming to facilitate US business entry for a global audience.

## User Preferences
- Clear, concise communication without technical jargon
- Iterative development with feedback at each stage
- Approval required before significant codebase or design changes
- Spanish as primary language, with full multilingual support (7 languages)
- Exhaustive testing and validation before deployment
- All emails must follow consistent branded Exentax templates with full multilingual support

## System Architecture
Exentax is built with a React (Vite, TypeScript) frontend using Wouter for routing, TanStack Query for data management, and shadcn/ui with Tailwind CSS for UI. The backend is an Express.js (Node.js, TypeScript) application, interfacing with a PostgreSQL database via Drizzle ORM. Authentication is custom, session-based, supporting email/password, Google OAuth, and OTP verification. The system emphasizes secure document handling, email notifications, and web push notifications.

Key architectural patterns include:
- **Modular Frontend:** Components are organized into `ui`, `layout`, `forms`, `auth`, `dashboard`, `legal` categories. Hooks manage authentication, form drafts, mobile detection, and push notifications.
- **Robust Backend Services:** API routes are logically grouped (e.g., `auth`, `user`, `orders`, `llc`, `admin`). Core services handle authentication, backups, email, PDF generation, rate limiting, and security.
- **Shared Schema:** Drizzle ORM schema and Zod validation schemas are shared between frontend and backend to ensure data consistency.
- **Multi-language Support:** `react-i18next` handles 7 languages across UI, email templates, and generated PDFs, with 100% key parity.
- **Security-First Design:** Implements AES-256-GCM encryption for sensitive data, PostgreSQL-backed rate limiting, comprehensive security headers (CSP, HSTS), input validation/sanitization, and detailed audit logging.
- **Theming System:** Supports Light, Dark, and Forest modes, with dynamic `theme-color` meta tag updates for a consistent mobile experience.
- **Wizards and Flows:** Complex user interactions like registration, LLC formation, and maintenance applications are guided through multi-step wizards with draft saving and progress tracking.
- **Dashboard:** A central hub for clients and administrators, featuring URL-based tab navigation, modular panels, and server-side pagination for data-intensive sections.
- **Document Request Tracking:** Admin can request specific documents from clients. The system tracks requests through a lifecycle (sent → pending_upload → uploaded → approved/rejected → completed), automatically links client uploads to matching requests, and provides full CRUD management in the admin panel with audit logging.
- **PDF Generation:** Server-side `pdfkit` for official documents (invoices, operating agreements) and client-side `jspdf` for user-generated tools.
- **Scheduled Tasks:** Background services for data backups, abandoned application reminders, rate limit cleanup, consultation reminders, and audit log cleanup, monitored by a task watchdog.
- **SEO Optimization:** Dynamic sitemap generation, structured data (JSON-LD), comprehensive meta tags, and `hreflang` attributes.
- **GDPR Compliance:** Features user data export and self-service account deactivation, with admin-only full data deletion capabilities.

## External Dependencies
- **Database:** PostgreSQL (Neon-backed)
- **Email Service:** IONOS SMTP
- **Authentication:** Google OAuth
- **Storage:** Replit Object Storage
- **Error Monitoring:** Sentry (optional)
- **Review Platform:** Trustpilot (optional)
- **Push Notifications:** web-push npm package
- **PDF Generation (Server-side):** pdfkit
- **PDF Generation (Client-side):** jspdf

## Recent Changes
- **2026-02-13:** Removed green shadow/outline animations from all buttons (default, cta, neon variants). Changed button focus ring to neutral color.
- **2026-02-13:** Removed green hover shadow from Card component.
- **2026-02-13:** Email templates: changed header from hard green gradient to soft green (#F0FAF5), footer updated to "Exentax Holdings LLC".
- **2026-02-13:** Email sending address changed from no-reply@easyusllc.com to no-reply@exentax.com. SMTP credentials updated.
- **2026-02-13:** All "Easy US LLC" references replaced with "Exentax" or "Exentax Holdings LLC" across README, service worker, and email templates.
- **2026-02-13:** Contact email confirmed as hola@exentax.com across all pages and legal sections.