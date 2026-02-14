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
- **Email Service:** Gmail API (via Replit google-mail connector, `server/lib/gmail-client.ts`)
- **Authentication:** Google OAuth
- **Storage:** Replit Object Storage
- **Error Monitoring:** Sentry (optional)
- **Review Platform:** Trustpilot (optional)
- **Push Notifications:** web-push npm package
- **PDF Generation (Server-side):** pdfkit
- **PDF Generation (Client-side):** jspdf

## Configuration
- **Admin Email:** Centralized in `server/lib/config.ts` via `ADMIN_EMAIL` env var (fallback: afortuny07@gmail.com)
- **Contact Phone:** Centralized in `client/src/lib/constants.ts` as `CONTACT_PHONE` / `CONTACT_PHONE_DISPLAY`
- **Self-Healing:** QueryClient has auto-retry (3x queries, 2x mutations) with exponential backoff, skips retry on 401/403/404. CSRF auto-refresh on 403. PanelErrorBoundary auto-retries (3x with 5s delay, 30s cooldown reset). Backend returns 503+Retry-After for DB errors. Health check at `/_health` includes DB status.

## Recent Changes
- **2026-02-13:** Dashboard refactored: reduced from 2,830 to 1,807 lines (36% reduction). Extracted `useUserProfileState` hook (19 useState + 7 mutations, 304 lines), `useAdminState` hook (~60 useState + 13 mutations + 11 queries, 649 lines), `DashboardSidebar` component (141 lines), and 6 admin forms into lazy-loaded components (PaymentLinkForm, AdminDocUploadForm, ResetPasswordForm, IdvRequestForm, IdvRejectForm, DocRejectForm). All files in `client/src/pages/dashboard/` subdirectories.
- **2026-02-13:** Self-healing system: PanelErrorBoundary auto-retries (3x, 5s delay, 30s cooldown reset, deterministic error detection). QueryClient skips retry on 401/403/404. Global toast for network errors. Backend returns 503+Retry-After for DB errors. Health check includes DB status.
- **2026-02-13:** Admin email centralized in `server/lib/config.ts` (env-based). Phone number centralized in `client/src/lib/constants.ts`. Removed 9 hardcoded email and 8 hardcoded phone instances.
- **2026-02-13:** Page titles now i18n-aware (use-page-title.ts). Linktree page fully translated. Form-select placeholder uses t().
- **2026-02-13:** Audit logging added for: document uploads (llc.ts, user-documents.ts), invoice create/delete/status-change, order deletion, document review.
- **2026-02-13:** Removed unused code: products queries in home/servicios, DashboardContext system (4 files), StrategyIcon/ContinuousIcon, dead imports.
- **2026-02-13:** Admin data tables have mobile horizontal scroll. DocumentsPanel has loading skeleton.
- **2026-02-13:** Global error handler: ZodError→400 with details, DB errors→503, no stack trace leaks.
- **2026-02-13:** Comprehensive security audit: CSRF protection hardened (fixed startsWith matching), rate limiting added to OTP/registration/password-reset, input sanitization added to messages/LLC/maintenance routes, global error handler hardened (no stack traces leaked).
- **2026-02-13:** PDF invoice generator constrained to 1 page max for admin invoices. Added text truncation, item limits, and fixed footer positioning.
- **2026-02-13:** Order/payment status transition validation added with explicit state machine rules. Transaction safety added for cascade deletes.
- **2026-02-13:** Storage layer hardened with existence checks before updates.
- **2026-02-13:** Consultation calendar loading state added.
- **2026-02-13:** Database verified: 33 tables, 107 indexes, 28 FK constraints, all in sync with Drizzle schema. Zero orphaned records.
- **2026-02-13:** Translation verified: 3,215 keys across 7 languages, 100% parity, no empty values.
- **2026-02-13:** README updated with comprehensive project documentation.
- **2026-02-13:** Removed green shadow/outline animations from all buttons. Changed button focus ring to neutral color.
- **2026-02-13:** Removed green hover shadow from Card component.
- **2026-02-13:** Email templates: changed header from hard green gradient to soft green (#F0FAF5), footer updated to "Exentax Holdings LLC".
- **2026-02-13:** Email sending address changed from no-reply@easyusllc.com to no-reply@exentax.com. SMTP credentials updated.
- **2026-02-13:** All "Easy US LLC" references replaced with "Exentax" or "Exentax Holdings LLC" across README, service worker, and email templates.
- **2026-02-13:** Contact email confirmed as hola@exentax.com across all pages and legal sections.
- **2026-02-14:** Email system migrated from IONOS SMTP (nodemailer) to Gmail API via Replit google-mail connector. Created `server/lib/gmail-client.ts`. Removed SMTP env vars (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_USER_SUPPORT, SMTP_USER_TRUSTPILOT, SMTP_USER_ADMIN). Email queue system preserved with Gmail backend. All email functions (sendEmail, queueEmail, sendTrustpilotEmail) now use Gmail API.