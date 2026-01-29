# Easy US LLC - Project Overview

## Overview
Easy US LLC is a business formation service catering to Spanish-speaking entrepreneurs. It facilitates the establishment of LLCs in New Mexico, Wyoming, and Delaware, offering comprehensive support including banking assistance, annual maintenance services, and multilingual support with a strong focus on Spanish. The project aims to provide a streamlined and user-friendly experience for international clients navigating the US business landscape.

## User Preferences
I want to be communicated with in a clear and concise manner. I prefer explanations that are easy to understand, avoiding overly technical jargon. I appreciate an iterative development approach where I can provide feedback throughout the process. Please ask for my approval before implementing any significant changes to the codebase or design.

## System Architecture
The application features a modern UI/UX with a consistent design system (Primary Green: #6EDC8A, Carbon Black: #0E1215, Off White: #F7F7F5, Soft Gray: #E6E9EC, Text Gray: #6B7280) and typography (Inter for titles, Sans-serif for body). Animations are handled with Framer Motion.

The architecture includes:
- **Client-side:** Built with React, utilizing pages for main application sections (Home, Servicios, FAQ, Contacto) and shared layout components (Navbar, Footer, HeroSection, Newsletter).
- **Server-side:** An Express backend with Drizzle ORM for database interactions.
- **Database:** Drizzle schema and Zod types define the data structure. Key database indexes are applied for performance.
- **Email System:** Professional, modern email templates with metadata, SVG icons, and a unified design. Three IONOS email accounts configured:
  - **System emails:** no-reply@easyusllc.com (OTP, welcome, confirmations, order updates)
  - **Support/replies:** hola@easyusllc.com (reply-to for all emails)
  - **Trustpilot reviews:** BCC automático a Trustpilot (easyusllc.com+62fb280c0a@invite.trustpilot.com) cuando pedido completado
  - **Admin notifications:** arnau@easyusllc.com (receives system notifications)
  - **Test mode active:** All emails redirect to afortuny07@gmail.com with original recipient in subject.
- **Authentication:** Robust authentication system with OTP verification, session management, and secure password handling.
- **Form Management:** Multi-step wizard patterns for LLC, maintenance, and contact forms with auto-fill capabilities for authenticated users.
- **Admin Panel:** Integrated directly into the client dashboard for users with admin privileges, providing full control over orders, users, and messages.
- **Performance:** Gzip compression, advanced cache headers, lazy loading, `content-visibility: auto` for images, non-blocking font loading, and optimized animation durations.
- **Security:** Enhanced rate limiting, comprehensive security headers (HSTS, COOP, CORP, CSP), and secure API endpoints with validation.
- **Internationalization:** Primary focus on Spanish language support.
- **Responsiveness:** Fully responsive design across all components, including mobile-optimized dashboards, forms, and admin interfaces.

## External Dependencies
- **Drizzle ORM:** For database interaction and schema definition.
- **Zod:** For data validation.
- **Express.js:** Backend framework.
- **Framer Motion:** For UI animations.
- **shadcn/ui:** For consistent UI components and design system.
- **TanStack Query:** For data fetching and caching on the client-side.
- **wouter:** For client-side routing.
- **Mercury / Relay:** For banking assistance integrations.
- **Stripe:** For payment processing portal integration.
- **Google Fonts:** Inter and DM Sans for typography.

## UX Enhancements (January 2026)
- **Route Prefetching:** Custom hook in navbar that prefetches routes on hover/focus for faster navigation.
- **PWA Support:** Service Worker and manifest for offline capability and app-like experience.
- **Step Progress Indicator:** Visual component showing "Paso X de Y" with animated progress bar in all form wizards.
- **Form Draft Auto-save:** Hook that automatically saves form progress to localStorage with 1-second debounce, restores drafts when form is pristine.
- **Direction-aware Transitions:** AnimatePresence-based step transitions that animate based on navigation direction (forward/backward).

## Order & Account System (January 2026)
- **Mandatory Account Creation:** LLC and maintenance orders require user account with password (min 8 characters).
- **Auto-verified Accounts:** New accounts created during order process are automatically verified (emailVerified: true).
- **Welcome Email:** New users receive welcome email with client ID after account creation.
- **Payment Methods:** Two options available:
  - Bank transfer to Fortuny Consulting LLC (Account: 141432778929495, Routing: 121145433, Column N.A.)
  - Payment link delivered via email
- **Deferred Order Creation:** Orders are only created at final form submission, not on page load. Form data is collected locally until the user completes and submits.
- **Existing User Detection:** When entering email (step 3 for LLC, step 3 for maintenance), system checks via `/api/auth/check-email` if account exists:
  - If exists: User is prompted to log in (step 21 for LLC, step 20 for maintenance) instead of creating new account
  - After successful login: User continues with authenticated session, skipping OTP verification
- **Form Steps:** LLC form has 21 steps + login step (21), maintenance form has 12 steps + login step (20).
- **Contact Form:** Does NOT require account creation.

## OTP Verification System (January 2026)
- **Email OTP Verification:** LLC and maintenance orders REQUIRE email OTP verification before account creation.
- **OTP Endpoints:** `/api/register/send-otp` and `/api/register/verify-otp` handle account verification.
- **Password Reset OTP:** `/api/password-reset/send-otp` and `/api/password-reset/confirm` handle password recovery.
- **OTP Security:** 6-digit codes with 10-minute expiration, verified records valid for 30-minute window.
- **Email Change Detection:** OTP state resets automatically when user changes email to prevent verification bypass.
- **Backend Enforcement:** All account creation endpoints verify OTP record in contactOtps table (otpType="account_verification", verified=true).
- **Contact Form:** Uses separate OTP system (otpType="contact") for verification.

## Code Optimization (January 2026)
- **Unused Code Cleanup:** Removed deprecated OTP endpoints for LLC/maintenance applications.
- **Form Schema Optimization:** Cleaned up form schemas to only include required fields for the account flow.
- **Route Security:** All admin endpoints protected with `isAdmin` middleware including `/api/seed-admin` and `/api/admin/test-emails`.
- **API Routes:** 64+ unique endpoints with no duplicates, organized by resource (admin, user, orders, messages, etc.).
- **Payment Method Persistence:** Both LLC and maintenance claim-order endpoints now properly save the selected payment method.
- **LLC Data Updates:** Fixed `/api/llc/:id/data` endpoint to correctly update LLC applications instead of messages table.

## API Route Organization
- **Admin Routes:** `/api/admin/*` - All protected with `isAdmin` middleware
- **User Routes:** `/api/user/*` - Protected with `isAuthenticated` middleware
- **Public Routes:** Health check, products, newsletter subscribe, contact, OTP verification
- **Order Routes:** `/api/orders/*`, `/api/llc/*`, `/api/maintenance/*`
- **Document Routes:** `/api/documents/*`, `/api/user/documents/*`

## UI/UX Unification (January 2026)
- **Dashboard Dialogs:** All admin dialogs (create user, create order, send message, edit user, request documents, create invoice, upload document) now use unified styling:
  - DialogContent: rounded-2xl containers with mx-4 sm:mx-auto for mobile optimization
  - DialogHeader: text-xl font-black titles with DialogDescription for context
  - Labels: text-sm font-black text-primary mb-2 block
  - Inputs: rounded-full border-gray-200 focus:border-accent h-11
  - Textareas: rounded-xl border-gray-200 focus:border-accent
  - Select triggers: rounded-full h-11 with rounded-xl dropdown content
  - Buttons: rounded-full font-black, primary uses bg-accent text-primary
  - DialogFooter: flex-col sm:flex-row gap-3 mt-6 for mobile stacking
  - Long forms: max-h-[90vh] overflow-y-auto for scrollable content
- **Mobile Responsiveness:** All dialogs optimized for mobile with proper button stacking and spacing
- **Typography Consistency:** font-black for all labels and titles, consistent text sizing throughout

## Unified ID System (January 2026)
- **Clients:** 8-digit numeric ID (e.g., 12345678) - guaranteed unique
- **LLC Orders:** STATE-8digits format (e.g., NM-12345678, WY-12345678, DE-12345678)
- **Maintenance Orders:** STATE-8digits format (same as LLC orders)
- **Tickets/Messages:** 8-digit unique numeric ID (e.g., 87654321)
- **Documents:** 8-digit unique ID
- **Invoices:** Use the order's requestCode (e.g., NM-12345678)
- **Payments:** Use the order's requestCode
- **ID Generator Module:** Centralized at `server/lib/id-generator.ts` with uniqueness verification

## Form & Input Improvements (January 2026)
- **No Placeholders Policy:** All input fields across authentication, registration, and forms use labels only - no placeholder text
- **OTP Fields:** Numeric input mode with 6-digit max length, centered text display
- **Input Styling:** Consistent border-black/20 for form fields, rounded-full buttons, h-11/h-14 heights
- **Confirmation Pages:** Compact mobile-optimized layout with prominent order/ticket number display
- **Request Code Display:** Order numbers (NM/WY/DE-XXXXXXXX format) shown immediately after form submission

## Performance Optimizations (January 2026)
- **Lazy Loading:** All routes use React.lazy() with Suspense for code splitting
- **Route Prefetching:** Custom hook in navbar prefetches routes on hover/focus
- **Fast Spinner:** Minimal loading state with accent-colored spinning circle
- **Hot Module Replacement:** Vite HMR for instant development updates

## Message System (January 2026)
- **User Association:** Messages from authenticated users are automatically linked to their account
- **Email Notifications:** Auto-reply sent to user, admin notification via logActivity
- **Reply System:** Full threaded reply support via `/api/messages/:id/reply` endpoint
- **Dashboard Integration:** Users see their message history in the Messages tab

## Email Templates & Subjects (January 2026)
- **Professional Format:** All emails use modern design with Inter font, rounded buttons (pill shape), dark header with logo, consistent branding
- **16 Active Templates:** OTP, Welcome, Account Under Review, Account VIP, Account Reactivated, Confirmation, Auto-reply, Order Update, Order Completed, New Message, Account Deactivated, Newsletter, Admin Note, Payment Request, Document Request, Message Reply, Password Change OTP, Order Event
- **Design System:**
  - Header: Dark gradient (#0E1215) with circular logo and company name
  - Buttons: Pill-shaped (border-radius: 50px) with green background (#6EDC8A) and shadow
  - Typography: Inter font from Google Fonts
  - Content boxes: Rounded corners (16px) with subtle borders
  - Footer: Dark background with accent line and address
- **Subject Line Format:** Clear and professional without emojis:
  - OTP: "Tu código de verificación | Easy US LLC"
  - Welcome: "Bienvenido a Easy US LLC - Acceso a tu panel"
  - VIP: "Tu cuenta ha sido actualizada a estado VIP"
  - Reactivated: "Tu cuenta ha sido reactivada"
  - Confirmation: "Solicitud recibida - Referencia [CODE]"
  - Auto-reply: "Hemos recibido tu mensaje - Ticket #[ID]"
  - Newsletter: "Confirmación de suscripción a Easy US LLC"
  - Admin Note: "[Título] - Ticket #[ID]"
  - Payment Request: "Pago pendiente - Easy US LLC"
  - Document Request: "Acción Requerida: Solicitud de Documentación"
  - Message Reply: "Nueva respuesta a tu consulta - Ticket #[ID]"
- **Automatic Status Emails:** Emails sent automatically when admin changes account status (VIP, active, deactivated)
- **All emails use centralized templates** - No more inline HTML in routes.ts