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
- **Colors:** Primary Metallic Blue (#2C5F8A / accent), Carbon Black, Off White, Soft Gray, Text Gray. No green/emerald colors. All UI elements use metallic blue accent. Status labels use semantic colors (red for error/cancelled, yellow for warning/pending, green for completed/active). Action required badge is red.
- **Typography:** Space Grotesk (headings), Inter (body), DM Sans (UI)
- **Theme:** Full dark/light mode with CSS custom properties and localStorage persistence
- **Animations:** Framer Motion with page transitions
- **Components:** shadcn/ui with custom elevation utilities.

### Security Features
- **Encryption:** AES-256-CBC for sensitive data, SHA-256 for file integrity.
- **Authentication:** bcrypt password hashing (12 rounds), session-based with regeneration, CSRF protection.
- **Rate Limiting:** IP-based throttling, order creation limits.
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
- **Route Protection:** Client-side `AccountStatusGuard` and server-side middleware (`isNotUnderReview`, `isAuthenticated`, `isAdmin`, `hasPermission`) for role-based access control.
- **Staff Roles & Permissions:** Granular permissions defined in `staff_roles` table, assigned to users, with admin bypass.

## External Dependencies
- **Database:** Neon (PostgreSQL hosting)
- **Email:** IONOS SMTP
- **Authentication:** Google OAuth
- **Storage:** Replit Object Storage
- **Error Monitoring:** Sentry (optional)
- **Review Platform:** Trustpilot (optional)