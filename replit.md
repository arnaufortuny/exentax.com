# Easy US LLC — Platform Documentation

## Overview
Easy US LLC is a full-stack SaaS platform designed to streamline US LLC formation for international entrepreneurs, particularly Spanish-speaking clients. It facilitates LLC creation in New Mexico, Wyoming, and Delaware, offering end-to-end services such as business formation, annual maintenance, banking assistance, compliance tracking, and multilingual professional support. The platform is production-ready, featuring a comprehensive admin panel, secure document handling, and an automated compliance calendar, aiming to simplify US business entry for a global audience.

## User Preferences
- Clear, concise communication without technical jargon
- Iterative development with feedback at each stage
- Approval required before significant codebase or design changes
- Spanish as primary language, with full multilingual support
- Exhaustive testing and validation before deployment
- All emails must follow consistent templates with full multilingual support

## System Architecture

### Tech Stack
- **Frontend:** React 18 + Vite, Wouter (routing), TanStack Query v5, shadcn/ui + Radix, Tailwind CSS, Framer Motion
- **Backend:** Express.js (Node.js), TypeScript
- **Database:** PostgreSQL (Neon-backed), Drizzle ORM, Zod validation
- **Authentication:** Custom session-based with bcrypt, Google OAuth, document-based identity verification
- **Email:** Nodemailer via IONOS SMTP with branded HTML templates
- **PDF Generation:** jspdf (client-side), pdfkit (server-side)
- **Storage:** Replit Object Storage + local filesystem for identity documents
- **Internationalization:** react-i18next (7 languages: ES, EN, CA, FR, DE, IT, PT)

### Design System
- **Colors:** Primary Metallic Blue (#2C5F8A / accent), Carbon Black, Off White, Soft Gray, Text Gray — NO green/emerald anywhere
- **Color Rules:** All UI elements use metallic blue accent. Status labels (account/order/payment/invoice/query) use semantic colors: red (error/cancelled), yellow (warning/pending), green (completed/active). Action required badge is red.
- **Typography:** Space Grotesk (headings), Inter (body), DM Sans (UI)
- **Theme:** Full dark/light mode with CSS custom properties and localStorage persistence
- **Animations:** Framer Motion with page transitions
- **Components:** shadcn/ui with custom elevation utilities (hover-elevate, active-elevate-2)
- **Wallet Tab:** Removed — was a test feature, no longer exists in client dashboard

### Project Structure
```
├── client/                     # React frontend
│   ├── src/
│   │   ├── assets/             # Static assets (icons, images)
│   │   ├── components/         # Reusable components
│   │   │   ├── account-status-guard.tsx  # Centralized route protection
│   │   │   ├── auth/           # Social login, auth components
│   │   │   ├── dashboard/      # Dashboard panels and tabs
│   │   │   ├── forms/          # Shared form components
│   │   │   ├── layout/         # Navbar, Footer, Newsletter
│   │   │   └── ui/             # shadcn/ui base components
│   │   ├── hooks/              # Custom React hooks (useAuth, useFormDraft, etc.)
│   │   ├── lib/                # Utilities
│   │   │   ├── validation.ts   # Centralized email validation
│   │   │   ├── queryClient.ts  # TanStack Query + CSRF token management
│   │   │   ├── sanitize.ts     # DOMPurify wrapper
│   │   │   ├── whatsapp.ts     # WhatsApp integration
│   │   │   └── i18n.ts         # i18next configuration
│   │   ├── locales/            # 7 language JSON files (2,500+ keys each)
│   │   └── pages/              # Route pages
│   │       ├── auth/           # Login, Register, Forgot Password
│   │       ├── dashboard.tsx   # Main dashboard (client + admin)
│   │       ├── llc-formation.tsx    # LLC formation wizard
│   │       ├── maintenance.tsx      # Annual maintenance wizard
│   │       ├── contacto.tsx         # Contact form with OTP
│   │       ├── home.tsx, servicios.tsx, faq.tsx  # Public pages
│   │       ├── invoice-generator.tsx, operating-agreement.tsx  # Tools
│   │       └── legal/          # Privacy, Terms, Cookies
│   └── public/                 # Static files
├── server/                     # Express backend
│   ├── db.ts                   # Database connection pool
│   ├── index.ts                # Server entry point
│   ├── storage.ts              # Storage interface (IStorage)
│   ├── lib/
│   │   ├── auth-service.ts     # User registration, login, OTP, password reset
│   │   ├── custom-auth.ts      # Session management, middleware, OAuth
│   │   ├── email.ts            # Email sending + HTML templates
│   │   ├── email-translations.ts   # Email content in 7 languages (3,000+ lines)
│   │   ├── security.ts         # Encryption, validation, sanitization, audit logging
│   │   ├── logger.ts           # Structured logging with redaction
│   │   ├── db-utils.ts         # Database retry logic with exponential backoff
│   │   ├── pdf-generator.ts    # Server-side invoice PDF generation
│   │   └── id-generator.ts     # Unique ID generation (client IDs, order codes)
│   └── routes/
│       ├── shared.ts           # Shared middleware exports
│       ├── auth-ext.ts         # Auth endpoints (send-otp, verify-otp, forgot-password)
│       ├── llc.ts              # LLC formation + claim-order
│       ├── maintenance.ts      # Maintenance orders
│       ├── orders.ts           # Order management
│       ├── contact.ts          # Contact form + newsletter
│       ├── messages.ts         # Client-admin messaging
│       ├── user-profile.ts     # Profile management
│       ├── user-documents.ts   # Document management + identity verification upload
│       ├── user-security.ts    # Email verification, password change
│       ├── admin-users.ts      # Admin: user management + identity verification
│       ├── admin-orders.ts     # Admin: order status management
│       ├── admin-documents.ts  # Admin: document management + secure download
│       ├── admin-comms.ts      # Admin: newsletters, announcements
│       └── accounting.ts       # Admin: financial reporting
├── shared/
│   └── schema.ts               # Drizzle ORM schema (28 tables) + Zod validators
├── drizzle/                    # Database migrations
├── uploads/
│   └── identity-docs/          # Identity verification documents (server-local)
└── tests/                      # Test files
```

## Key Features

### Security
- **Encryption:** AES-256-CBC for sensitive data fields, SHA-256 file integrity verification
- **Authentication:** bcrypt password hashing (12 rounds), session-based with regeneration after login
- **CSRF Protection:** Double-submit cookie pattern with token rotation
- **Rate Limiting:** IP-based request throttling, order creation limits per IP
- **Input Validation:** Centralized email validation (`server/lib/security.ts` + `client/src/lib/validation.ts`), email normalization (trim/lowercase), Zod schema validation on all endpoints, DOMPurify HTML sanitization
- **Document Security:** Secure download with access logging, file type validation (PDF/JPG/PNG), 5MB size limits
- **Headers:** Permissions-Policy, request body size limits (1MB)
- **Account Protection:** Failed login attempt tracking with temporary account locking, suspicious activity detection with automatic account flagging

### Account Status System
- **Active:** Full platform access
- **Pending:** Limited access — can verify email, upload identity documents, view notifications only. Enforced by `AccountStatusGuard` component on frontend and `isNotUnderReview` middleware on backend
- **Deactivated:** No access — shows deactivation page with logout only
- **Identity Verification Flow:** Admin requests → Client uploads document → Admin approves/rejects. Upload endpoint (`/api/user/identity-verification/upload`) bypasses `isNotUnderReview` middleware to allow pending account uploads

### Email System
- **Transport:** IONOS SMTP via Nodemailer
- **Templates:** Branded HTML with consistent styling (green accent, white cards, responsive layout)
- **Languages:** All emails sent in user's preferred language (7 languages fully translated)
- **Email Types:** OTP verification, welcome, confirmation, order updates, identity verification requests/approvals/rejections, account status changes (VIP/reactivated/deactivated), admin notifications, newsletter, auto-reply
- **Normalization:** All emails normalized (trimmed + lowercased) before validation and database operations

### Order Status Flow
- `pending` → `processing` → `completed` (or `cancelled`)
- Status changes trigger email notifications and in-app notifications in user's language
- Admin can update status via dashboard with email notifications

### Identity Verification
- **Workflow:** `none` → `requested` (admin action) → `uploaded` (client uploads doc) → `approved`/`rejected` (admin review)
- **File Handling:** PDF/JPG/PNG, max 5MB, stored in `uploads/identity-docs/` with SHA-256 hash
- **Notifications:** Email sent at each step in user's preferred language
- **Rejection:** Clears document, allows re-upload with admin notes displayed to client

### Internationalization
- 7 languages: Spanish (primary), English, Catalan, French, German, Italian, Portuguese
- 2,500+ translation keys per locale, 100% key parity across all 7 files
- Automatic language detection from browser + user preference saving
- All server-side emails use user's `preferredLanguage`
- Translation keys validated by automated tests

### Client Tools
- **Invoice Generator:** Client-side PDF generation with customizable fields
- **Operating Agreement Generator:** Multi-member LLC agreements with download
- **CSV Transaction Generator:** Bank transaction CSV for tax reporting
- **Price Calculator:** Tax comparison (Spain, UK, Germany, France, Bulgaria vs US)
- **State Comparison:** Side-by-side LLC state comparison (NM, WY, DE)

### Admin Panel
- **Users:** Full user management, identity verification workflow, account status control
- **Orders:** Status updates with email notifications, order event timeline
- **Documents:** Secure upload/download, access logging, document assignment
- **Communications:** Newsletter management, direct email, announcements
- **Accounting:** Revenue reports, payment tracking, financial summaries
- **Consultations:** Consultation scheduling and management
- **Analytics:** Dashboard with key metrics and activity tracking

### Form System
- Multi-step wizards with progress tracking
- Auto-fill from authenticated user data
- Draft saving with `useFormDraft` hook (localStorage)
- Unauthenticated data transfer (form → account creation → data association)
- Age verification (18+) with date validation
- OTP email verification integrated into forms

### Compliance Calendar
- Automated IRS deadline calculation
- Annual report reminders by state
- Registered agent renewal tracking

### Route Protection
- **`AccountStatusGuard`** (client): Centralized component wrapping all protected routes (dashboard, forms, tools). Renders deactivation/pending pages based on account status
- **`isNotUnderReview`** (server): Middleware blocking POST/PUT/PATCH for pending/deactivated accounts on sensitive endpoints. Excluded from identity verification upload endpoint
- **`isAuthenticated`** (server): Session validation middleware
- **`isAdmin`/`isAdminOrSupport`** (server): Role-based access control

## Stability
- Database connection pool with retry logic and exponential backoff (`server/lib/db-utils.ts`)
- Structured JSON logging with sensitive data redaction (`server/lib/logger.ts`)
- Health check endpoint with pool diagnostics (`/api/healthz`)
- Optimized database indexes for common queries
- Backup service for document files (runs every 60 minutes)
- Abandoned application cleanup (automated)

## Testing
- **Framework:** Vitest
- **Tests:** 77 unit tests across 7 test files
- **Coverage Areas:**
  - Encryption: text/buffer/file integrity/error handling (21 tests)
  - Security: sanitization, validation, password rules (21 tests)
  - Logger: levels, redaction, context (7 tests)
  - PDF generation: invoice output (3 tests)
  - i18n: translation key parity across 7 languages (13 tests)
  - Theme: dark/light mode (4 tests)
  - Validation: form schemas (8 tests)
- **Run:** `npm test`

## External Dependencies
- **Database:** Neon (PostgreSQL hosting)
- **Email:** IONOS SMTP
- **Authentication:** Google OAuth (via Replit integration)
- **Storage:** Replit Object Storage (via Replit integration)
- **Error Monitoring:** Sentry (optional, via VITE_SENTRY_DSN)
- **Review Platform:** Trustpilot (optional, via BCC email)

## Development Notes
- Frontend runs on Vite dev server, backend on Express — both served via port 5000
- `npm run dev` starts both frontend and backend concurrently
- Database schema changes: modify `shared/schema.ts` then run `npm run db:push`
- Email templates defined in `server/lib/email.ts`, translations in `server/lib/email-translations.ts`
- All email inputs normalized server-side (trim + lowercase) before validation and DB queries
- Centralized client-side email validation in `client/src/lib/validation.ts`
- Centralized server-side email validation in `server/lib/security.ts` (`validateEmail` + `normalizeEmail`)
