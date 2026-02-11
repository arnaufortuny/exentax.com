# Easy US LLC — Platform Documentation

## Overview
Easy US LLC is a full-stack SaaS platform designed to simplify US LLC formation for international entrepreneurs, particularly Spanish-speaking clients. It provides end-to-end services including business formation in New Mexico, Wyoming, and Delaware, annual maintenance, banking assistance, compliance tracking, and multilingual professional support. The platform is production-ready, featuring a comprehensive admin panel, secure document handling, and an automated compliance calendar, aiming to facilitate US business entry for a global audience.

## User Preferences
- Clear, concise communication without technical jargon
- Iterative development with feedback at each stage
- Approval required before significant codebase or design changes
- Spanish as primary language, with full multilingual support
- Exhaustive testing and validation before deployment
- All emails must follow consistent templates with full multilingual support

## System Architecture

### Tech Stack
- **Frontend:** React 18 + Vite, Wouter, TanStack Query v5, shadcn/ui + Radix, Tailwind CSS, Framer Motion
- **Backend:** Express.js (Node.js), TypeScript
- **Database:** PostgreSQL (Neon-backed), Drizzle ORM, Zod validation
- **Authentication:** Custom session-based with bcrypt, Google OAuth, document-based identity verification
- **Email:** Nodemailer via IONOS SMTP with branded HTML templates
- **PDF Generation:** jspdf (client-side), pdfkit (server-side)
- **Storage:** Replit Object Storage + local filesystem for identity documents
- **Internationalization:** react-i18next (7 languages: ES, EN, CA, FR, DE, IT, PT)

### Design System
- **Colors:** Green Primary (#00C48C), Green Neon (#00E57A), Green Lima (#B4ED50), Dark Base (#0A1F17), Card Dark (#112B1E), Deep Green (#00855F). Light bg #F5FBF8, dark bg #050505, forest bg #0A1F17. Status labels: amber (pending), purple (processing), green (completed/active/paid), red (cancelled/error), lime (documents_ready/filed). VIP badge uses lima-to-green gradient.
- **Typography:** Space Grotesk (h1/h2 hero headings), Inter (h3/h4 section headings), DM Sans (body/UI)
- **Theme:** Three modes: Light, Dark (pure black AMOLED), Forest (green dark). CSS class system: `.dark` for black mode, `.dark.forest` for green mode. Both share `.dark` class so all `dark:` Tailwind utilities apply to both. System auto-detection maps to dark/light. Stored in localStorage key `ui-theme`. Inspired by relayfi.com aesthetic.
- **Animations:** Framer Motion with page transitions
- **Navbar:** Glassmorphism (backdrop-blur-md, bg-white/95 light, bg-[#0A1F17]/95 dark) with green accents
- **Footer:** Dark green design (bg-[#0A1F17]) with #00C48C hover links, white/80 text, #112B1E separators
- **Button Variants:** default (green), cta (green), secondary (lima), neon, outline (green border), ghost, destructive, link, premium
- **Badge Variants:** default, pending, processing, completed, cancelled, paid, documentsReady, active, inactive, draft, submitted, filed, vip
- **Components:** shadcn/ui with custom elevation utilities.

### Security Features
- **Encryption:** AES-256-CBC for sensitive data, SHA-256 for file integrity.
- **Authentication:** bcrypt password hashing (12 rounds), session-based with regeneration, CSRF protection.
- **Rate Limiting:** DB-backed (PostgreSQL) rate limiting with in-memory fallback, IP-based throttling, order creation limits.
- **Input Validation:** Centralized Zod schema validation, email normalization, DOMPurify sanitization.
- **Document Security:** Secure download with access logging, type/size validation.
- **Account Protection:** Failed login attempt tracking, suspicious activity detection.

### Core Flows and Features
- **Account Status System:** `Active`, `Pending` (limited access for email/identity verification), `Deactivated`. Enforced by client-side guards and server-side middleware.
- **Email System:** Branded, multilingual (7 languages) templates for OTP, welcome, order updates, identity verification, account status changes, and admin notifications.
- **Order Status Flow:** `pending` → `processing` → `completed` (or `cancelled`), with email and in-app notifications.
- **Identity Verification:** Workflow from `none` to `approved`/`rejected` with file handling (PDF/JPG/PNG, max 5MB) and notifications.
- **Internationalization:** 7 languages with 100% key parity, automatic detection, and server-side language preference use.
- **Client Tools:** Invoice Generator, Operating Agreement Generator, CSV Transaction Generator, Price Calculator, State Comparison.
- **Admin Panel:** Comprehensive management for users, orders, documents, communications, accounting, consultations, and analytics.
- **Form System:** Multi-step wizards, draft saving, unauthenticated data transfer, age verification, and integrated OTP.
- **Compliance Calendar:** Automated IRS deadline calculation, annual report reminders, registered agent renewal tracking.
- **Route Protection:** Client-side `AccountStatusGuard` and server-side middleware (`isNotUnderReview`, `isAuthenticated`, `isAdmin`, `hasPermission`) for role-based access control. All async route handlers wrapped with `asyncHandler` for error safety.
- **Staff Roles & Permissions:** Granular permissions defined in `staff_roles` table, assigned to users, with admin bypass.

## External Dependencies
- **Database:** Neon (PostgreSQL hosting)
- **Email:** IONOS SMTP
- **Authentication:** Google OAuth
- **Storage:** Replit Object Storage
- **Error Monitoring:** Sentry (optional)
- **Review Platform:** Trustpilot (optional)