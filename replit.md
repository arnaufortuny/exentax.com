# Exentax — Complete Platform Documentation

## Overview

Exentax is a full-stack SaaS platform designed to simplify US LLC formation for international entrepreneurs, particularly Spanish-speaking clients. It provides end-to-end services including business formation in New Mexico, Wyoming, and Delaware, annual maintenance, banking assistance, compliance tracking, and multilingual professional support. The platform is production-ready, featuring a comprehensive admin panel, secure document handling, automated compliance calendar, and advanced self-healing error recovery.

## User Preferences

- **Primary Language:** Spanish with full English support
- **Language Defaults:** Detected from browser, stored in user profile
- **UI/UX:**
  - Dark mode as default option
  - Mobile-first responsive design
  - Bilingual email templates with localized branding
  - Clear, non-technical communication
- **Development Workflow:**
  - Iterative feedback at each stage
  - Approval required for significant changes
  - Exhaustive testing before deployment
  - Consistent branded templates for all communications

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with Vite, Wouter for routing, TanStack React Query for state management.
- **UI Components:** shadcn/ui with Radix UI primitives, styled with Tailwind CSS supporting Light/Dark/Forest themes.
- **Internationalization:** react-i18next with 7 languages (ES, EN, CA, FR, DE, IT, PT).
- **Validation:** Zod schemas with react-hook-form.
- **Key Features:** Custom hooks for authentication, form draft saving, mobile responsiveness, dynamic page titles, push notifications, theme switching, and toast notifications.

### Backend Architecture
- **Framework:** Express.js with TypeScript.
- **Authentication:** Session-based, JWT token, and Google OAuth 2.0 with Passport.js. OTP verification and account lockout.
- **Security:** CSRF protection, rate limiting, AES-256-GCM encryption, input sanitization, security headers (Helmet), and audit logging.
- **Core Services:** Email queueing (Gmail API), Google Calendar/Meet integration, server-side PDF generation, document encryption, web push notifications, automated backups, and structured logging.
- **Scheduled Tasks:** Automated OTP cleanup, compliance reminders, abandoned application reminders, and consultation reminders.
- **API Routes:** Modular structure for authentication, orders, LLC applications, maintenance, messaging, contacts, consultations, user profiles, documents, security, and extensive admin functionalities.

### Database Schema
- **ORM:** Drizzle ORM for a type-safe schema with 33 tables.
- **Key Areas:** Users & Auth, Orders & Products, LLC Applications, Maintenance, Consultations, Communications, Compliance & Accounting, Data Security & Compliance, and Admin Management.
- **Schema Layer:** `shared/schema.ts` as the single source of truth, with Zod insert schemas and TypeScript types for consistency.

### Multi-Language Support
- **Coverage:** 7 languages with 100% key parity verified across all JSON translation files.
- **Localization:** Localized email templates, server-side PDF generation, dynamic page titles, and locale-aware formatting.

### Theming System
- **Modes:** Light, Dark, Forest, implemented with CSS custom properties and HSL values.
- **Persistence:** Theme preference saved to localStorage, with dynamic `theme-color` for mobile browsers.

### Security Features
- **Auth & AuthZ:** bcrypt hashing, secure httpOnly cookies, RBAC, OTP, account lockout.
- **Data Protection:** AES-256-GCM encryption, file hashing, TLS/HTTPS, token expirations.
- **Request Security:** CSRF token validation, rate limiting on sensitive endpoints, input sanitization, Zod validation.
- **Audit & Logging:** Comprehensive audit logs for admin actions, document access, and IP tracking.
- **Compliance:** GDPR-compliant data handling, user consent tracking, environment variable for secrets.

### Error Handling & Recovery
- **Self-Healing:** Query-level retries (3x query, 2x mutation with exponential backoff), CSRF auto-refresh.
- **Error Boundaries:** `PanelErrorBoundary` for dashboard panels with auto-retry logic.
- **Global Handling:** Zod validation to 400, DB errors to 503 with `Retry-After` header.
- **Health Checks:** `GET /_health` endpoint for database and pool connectivity status.

### SEO Optimization
- Dynamic sitemap, JSON-LD structured data, meta tags, hreflang attributes, mobile optimization, and dynamic i18n page titles.

### Deployment & Scaling
- **Platform:** Replit Autoscale.
- **Build:** TypeScript compilation via esbuild.
- **Database:** PostgreSQL (Neon-backed) with connection pooling.
- **Configuration:** Environment variables for all credentials and settings.

## External Dependencies

- **Database:** PostgreSQL (Neon-backed)
- **Email Service:** Gmail API (via Replit google-mail connector)
- **Authentication:** Google OAuth 2.0 (Replit handled)
- **Storage:** Replit Object Storage
- **Calendar:** Google Calendar + Meet (via Replit google-calendar connector)
- **PDF Generation:** pdfkit (server-side), jspdf (client-side)
- **Push Notifications:** web-push npm package
- **Error Monitoring:** Sentry (optional)
- **Review Platform:** Trustpilot (optional)