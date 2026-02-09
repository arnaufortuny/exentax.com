# Easy US LLC — Platform Documentation

## Overview

Easy US LLC is a full-stack SaaS platform that simplifies US LLC formation for international entrepreneurs, primarily targeting Spanish-speaking clients. The platform supports LLC creation in New Mexico, Wyoming, and Delaware, providing end-to-end services including business formation, annual maintenance, banking assistance, compliance tracking, and multilingual professional support.

**Domains:**
- `easyusllc.com` — Main platform (home, services, dashboard, forms, auth, legal, FAQ)
- `creamostullc.com` — Isolated landing pages and marketing funnels

**Current State:** Production-ready with 28 database tables, 7-language i18n (2,515 keys per language), comprehensive admin panel, secure document handling, and automated compliance calendar.

---

## User Preferences

- Clear, concise communication without technical jargon
- Iterative development with feedback at each stage
- Approval required before significant codebase or design changes
- Spanish as primary language, with full multilingual support

---

## System Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Wouter (routing), TanStack Query v5 |
| UI System | shadcn/ui + Radix primitives, Tailwind CSS, Framer Motion |
| Backend | Express.js (Node.js), TypeScript |
| Database | PostgreSQL (Neon-backed via Replit), Drizzle ORM |
| Validation | Zod + drizzle-zod |
| Auth | Custom session-based (express-session), Google OAuth, OTP verification |
| Email | Nodemailer via IONOS SMTP |
| PDF | jspdf (client-side), pdfkit (server-side) |
| Storage | Replit Object Storage (document backups) |
| i18n | react-i18next with 7 languages |

### Design System

- **Colors:** Primary Green, Carbon Black, Off White, Soft Gray, Text Gray
- **Typography:** Space Grotesk (headings), Inter (body), DM Sans (UI elements)
- **Theme:** Full dark/light mode with CSS custom properties
- **Animations:** Framer Motion for page transitions and UI interactions
- **Components:** shadcn/ui with custom elevation utilities (hover-elevate, active-elevate-2)

### Project Structure

```
├── client/src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard tab components (profile, services, wallet, messages, notifications, consultations, admin panels)
│   │   ├── forms/              # Multi-step wizard form components
│   │   ├── layout/             # Navbar, footer, layout wrappers
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── icons.tsx           # Custom icon components
│   │   ├── llc-progress-widget.tsx
│   │   ├── state-comparison.tsx
│   │   └── tax-comparator.tsx
│   ├── pages/
│   │   ├── auth/               # Login, register, forgot-password
│   │   ├── legal/              # Terms, privacy, refunds, cookies
│   │   ├── home.tsx            # Landing page
│   │   ├── servicios.tsx       # Services page
│   │   ├── contacto.tsx        # Contact with OTP verification
│   │   ├── faq.tsx             # FAQ page
│   │   ├── dashboard.tsx       # Main user/admin dashboard
│   │   ├── llc-formation.tsx   # LLC application wizard
│   │   ├── maintenance.tsx     # Annual maintenance wizard
│   │   ├── invoice-generator.tsx
│   │   ├── csv-generator.tsx
│   │   ├── operating-agreement.tsx
│   │   ├── price-calculator.tsx
│   │   └── linktree.tsx
│   ├── locales/                # Translation files (es, en, ca, fr, de, it, pt)
│   ├── lib/                    # Utilities, i18n config, query client
│   └── hooks/                  # Custom React hooks
├── server/
│   ├── routes/                 # API route modules
│   │   ├── admin-billing.ts    # Orders, invoices, discount codes, payment accounts
│   │   ├── admin-comms.ts      # Newsletter, messages, guest tracking, calculator consultations
│   │   ├── admin-documents.ts  # Document management, payment links, notes
│   │   ├── admin-orders.ts     # Order management, incomplete applications
│   │   ├── admin-users.ts      # User CRUD, deactivation, password reset
│   │   ├── accounting.ts       # Financial transaction tracking
│   │   ├── auth-ext.ts         # Extended auth (email check, OTP, password reset)
│   │   ├── consultations.ts    # Booking system for consultations
│   │   ├── contact.ts          # Contact form, newsletter subscribe/unsubscribe
│   │   ├── llc.ts              # LLC application data management
│   │   ├── maintenance.ts      # Maintenance application handling
│   │   ├── messages.ts         # User messaging system
│   │   ├── orders.ts           # Order creation and invoicing
│   │   ├── user-profile.ts     # Profile, documents, deadlines, notifications, password
│   │   └── shared.ts           # Shared middleware (isAdmin, db, logAudit)
│   ├── lib/
│   │   ├── custom-auth.ts      # Auth system (login, register, logout, session)
│   │   ├── auth-service.ts     # User creation, admin detection
│   │   ├── email-service.ts    # Email templates and sending
│   │   └── id-generator.ts     # Unified ID generation system
│   ├── oauth.ts                # Google OAuth integration
│   ├── routes.ts               # Route registration, health check, CSRF
│   ├── storage.ts              # IStorage interface and DatabaseStorage
│   ├── sitemap.ts              # SEO sitemaps and robots.txt
│   └── vite.ts                 # Vite dev server integration (DO NOT MODIFY)
├── shared/
│   └── schema.ts               # Drizzle ORM schema (28 tables) + Zod validators
├── uploads/                    # User documents (admin-docs/, client-docs/)
└── drizzle/                    # Database migrations
```

---

## Database Schema (28 Tables)

**Core:** users, sessions, orders, order_events, products
**LLC:** llc_applications, maintenance_applications, application_documents
**Financial:** payment_accounts, discount_codes, accounting_transactions
**Communication:** messages, message_replies, newsletter_subscribers, user_notifications
**Auth:** email_verification_tokens, password_reset_tokens, contact_otps, rate_limit_entries
**Admin:** audit_logs, document_access_logs, encrypted_fields
**Consultations:** consultation_types, consultation_availability, consultation_blocked_dates, consultation_bookings
**Analytics:** guest_visitors, calculator_consultations

---

## API Routes Summary

**Authentication:** `/api/auth/*` — Register, login, logout, Google OAuth, OTP verification, password reset
**User Profile:** `/api/user/*` — Profile CRUD, documents, deadlines, notifications, password change
**LLC Formation:** `/api/llc/*` — Application data, claim orders
**Maintenance:** `/api/maintenance/*` — Annual maintenance applications
**Orders:** `/api/orders/*` — Order creation, invoicing, events
**Contact:** `/api/contact/*` — Contact form with OTP, newsletter
**Consultations:** `/api/consultations/*` — Booking, availability, user bookings
**Admin:** `/api/admin/*` — Full admin panel (orders, users, documents, billing, communications, accounting, consultations, stats, audit logs)
**System:** `/api/healthz`, `/api/csrf-token`, `/api/sitemap.xml`, `/robots.txt`

---

## Key Features

### Security
- AES-256-CBC encryption for sensitive LLC data
- CSRF protection with token validation
- Enhanced rate limiting per endpoint
- OTP verification for sensitive operations
- SHA-256 file integrity verification
- Document access logging and audit trails
- Secure document download with ownership verification (no internal paths exposed)
- Session-based authentication with secure cookies
- HTML sanitization on all user inputs

### Internationalization (i18n)
- 7 languages: Spanish (es), English (en), Catalan (ca), French (fr), German (de), Italian (it), Portuguese (pt)
- 2,500 translation keys per language, all synchronized
- Automatic language detection from browser/localStorage
- Language preference saved to user profile

### Client Tools
- **Invoice Generator** — Create professional invoices with PDF export
- **Operating Agreement Generator** — Auto-generate LLC operating agreements
- **CSV Transaction Generator** — Export transaction records
- **Price Calculator** — Tax comparison tool across states
- **State Comparison** — Interactive NM/WY/DE comparison

### Admin Panel
- Order lifecycle management with status tracking
- User management (CRUD, deactivation, password reset)
- Document review and approval workflow
- Payment link generation and discount codes
- Invoice creation and management
- Accounting dashboard with income/expense tracking
- Newsletter broadcasting
- Guest visitor analytics
- Consultation booking management
- Audit log viewer

### Form System
- Multi-step wizard with progress indicator
- Auto-fill from existing user data
- Local storage draft saving
- Unauthenticated data transfer on account creation
- Age verification (18+ for LLC formation)

### Compliance Calendar
- Automatic IRS deadline calculation
- Annual report reminders
- Registered agent renewal tracking
- Tax extension support

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Express + Vite on port 5000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push schema changes to database |
| `npm run test` | Run test suite (Vitest) |

---

## Environment Variables

**Required:**
- `DATABASE_URL` — PostgreSQL connection string (auto-provided by Replit)
- `SESSION_SECRET` — Express session encryption key
- `ENCRYPTION_KEY` — AES-256 encryption key for sensitive data

**Email (IONOS SMTP):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

**Google OAuth:**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Optional:**
- `ADMIN_EMAIL` — Admin account email
- `BASE_URL` — Public URL for email links
- `SENTRY_DSN` — Error monitoring
- `TRUSTPILOT_BCC_EMAIL` — Review request BCC

---

## Performance Optimizations

- Gzip compression on all responses
- Advanced cache headers (Cache-Control: no-cache for HTML, long-term for assets)
- React lazy loading with retry logic for all page components
- PWA support with service worker
- In-memory caching for frequently accessed data
- Email queue system for non-blocking sends
- Optimized database queries with proper indexing

---

## SEO

- Targeted keywords for LLC formation services
- JSON-LD structured data on key pages
- Server-side SEO headers
- Optimized robots.txt
- Dual sitemaps (easyusllc.com + creamostullc.com)
- Open Graph and meta tags for social sharing

---

## Recent Changes (February 2026)

- **Security:** Implemented secure document download endpoint with ownership verification; sanitized all API responses to remove internal file paths; converted hardcoded auth error messages to error codes for i18n compatibility; added `account_review` to AuditAction type for OTP security tracking
- **Mobile UX:** Optimized nav button behavior (context-aware: "Cerrar Sesión" on dashboard, "Mi Área" elsewhere); fixed mobile overlay z-index and scroll; reduced mobile field sizes
- **Translations:** 2,515 keys synchronized across all 7 languages; fixed hardcoded Spanish in LLC ownership section; added singleOwnerLabel, needMultipleOwners, consultWhatsApp keys
- **OAuth:** Improved host fallback to use environment-based URLs instead of hardcoded localhost
- **Dashboard:** Adjusted mobile padding for better edge spacing; removed jarring tab animation; added Trustpilot button spacing
- **Email i18n:** All email subjects now translate across 7 languages (admin password reset, newsletter subscription, document notifications, payment requests, security alerts)
- **OTP Security:** Profile change OTP allows 5 retry attempts with clear error messages; automatic account review after max failed attempts
- **Documentation Center:** Redesigned with status badges (pending/approved/rejected), document type labels, upload dates; prevented deletion of approved documents (frontend + backend); "Upload again" option for rejected documents
- **Support System:** Replaced WhatsApp-only contact with inline inquiry form in Messages tab (title, reason selector, message body, ticket ID generation); message list now shows status badges and ticket IDs
- **Performance:** Optimized document N+1 query to batch-fetch uploaders with single query instead of per-document lookups
- **Code Cleanup:** Removed unused `path` import from server/index.ts; TypeScript compiles with zero errors
- **Order Events i18n:** Converted hardcoded Spanish order event text ("Pedido Recibido") to i18n keys for proper multilingual display in timeline
- **PDF Invoices:** Removed right-aligned "INVOICE" text from both standard and custom invoice PDFs; updated bank name from "Saxo Payments" to "BANKING CIRCLE SA"
- **LLC Progress Widget:** Added green border highlighting when order status is 'completed'
- **Dashboard Timeline:** Added i18n text parser for order event timeline entries; localized date formatting based on user language
