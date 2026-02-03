# Easy US LLC - Project Overview

## Overview
Easy US LLC provides business formation services, specifically for LLCs in New Mexico, Wyoming, and Delaware, targeting Spanish-speaking entrepreneurs. The project aims to simplify the US business formation process for international clients by offering comprehensive support, including banking assistance, annual maintenance, and multilingual services, primarily in Spanish. The overarching goal is to achieve significant market presence by streamlining complex legal and financial procedures.

## User Preferences
I want to be communicated with in a clear and concise manner. I prefer explanations that are easy to understand, avoiding overly technical jargon. I appreciate an iterative development approach where I can provide feedback throughout the process. Please ask for my approval before implementing any significant changes to the codebase or design.

## Recent Changes (February 2026)
- **Custom Icons**: Updated calendar, email, and money icons with custom branded images
- **Operating Agreement Generator**: Full i18n support with 93 translation keys, auto-save to Document Center
- **LLC Data Locking**: When EIN is assigned, LLC data becomes locked for data integrity
- **Production Review**: Complete security audit, performance optimization, and i18n verification
- **Unified ID System**: Centralized order code generator with state prefix pattern (NM-12345678)

## Domain Separation

**Two domains:**

| Domain | Router | Description |
|--------|--------|-------------|
| `creamostullc.com` | Standalone | Landing pages, NO i18n, hardcoded Spanish, isolated |
| `easyusllc.com` | `MainRouter` | Main website: home, services, FAQ, legal, dashboard, forms, auth |

**Domain Routes:**

| Route | creamostullc.com | easyusllc.com |
|-------|------------------|---------------|
| `/` | LinktreePage | Home |
| `/tu-llc` | Sales (funnel) | - |
| `/auth/*` | - | Login/Register/Recovery |
| `/dashboard` | - | Dashboard |
| `/llc/*` | - | Forms |
| `/tools/*` | - | Invoice Generator, Operating Agreement, Price Calculator |
| `/servicios`, `/faq` | - | Info pages |
| `/legal/*` | - | Legal pages |

**RULES:**
1. **NEVER** modify `linktree.tsx` or `funnel.tsx` when making changes to the main web system
2. **NEVER** import shared components from main web into linktree/funnel (they are self-contained)
3. **NEVER** add i18n to linktree/funnel - they use hardcoded Spanish intentionally
4. Each domain has its own loading screen using the green progress bar (NO spinner circles)

**Architecture in App.tsx:**
```javascript
if (isLinktreeDomain) → LinktreePage or Sales
else → MainRouter
```

## System Architecture
The application features a modern UI/UX with a consistent design system (Primary Green, Carbon Black, Off White, Soft Gray, Text Gray) and typography (Inter, Sans-serif), with UI animations powered by Framer Motion.

**Technical Implementations:**
- **Client-side:** Built with React, featuring a modular structure for pages and reusable layout components, with Wouter handling client-side routing. All dropdown selectors use native HTML `<select>` elements for maximum compatibility.
- **Server-side:** An Express.js backend manages extensive API endpoints for various functionalities including admin, user, orders, LLC applications, maintenance, messaging, newsletter, authentication, and PDF generation.
- **Database:** Drizzle ORM is used for schema definition with Zod for type validation, incorporating key indexes.
- **Email System:** Professional email templates with base64 embedded logo for reliable cross-client display, managed via IONOS accounts for notifications, support, and review requests.
- **Authentication:** Features robust OTP verification, session management, secure password handling, and Google OAuth integration with automatic account creation and CSRF protection.
- **Form Management:** Multi-step wizard forms for LLC, maintenance, and contact, including auto-fill for authenticated users and local storage draft saving. Address fields are standardized, and unauthenticated users' data is transferred upon account creation. Users must be 18+ for LLC creation.
- **Admin Panel:** Integrated within the client dashboard for privileged users, offering comprehensive control over orders, users, and messages.
- **Performance Optimizations:** Includes Gzip compression, advanced cache headers, lazy loading with retry logic, content-visibility, non-blocking font loading, route prefetching, PWA support, in-memory cache for admin statistics, and an email queue system with retry logic.
- **Client Tools:** 
  - **Invoice Generator:** Allows clients to create professional PDF invoices
  - **Operating Agreement Generator:** Creates legal Operating Agreements for completed LLCs with EIN, 16-section template, auto-saves to Document Center
  - **Price Calculator:** Tax comparison tool for Spanish freelancers vs US LLC
- **Security:** Enhanced rate limiting (109 protected endpoints), comprehensive security headers (HSTS, COOP, CORP, CSP), CSRF protection, secure API endpoints with validation, HTML sanitization, audit logging, and protected file serving. Advanced fraud detection includes IP tracking, login counting with periodic OTP, automatic account review, and IP-based order blocking. Sensitive profile changes require OTP and trigger admin alerts. LLC data locked after EIN assignment.
- **Internationalization (i18n):** Full bilingual support (Spanish/English) via react-i18next, with 1400+ translation keys. Operating Agreement PDF uses 93 dedicated i18n keys.
- **Legal Pages System:** Bilingual legal pages (`/legal/*` routes) are implemented with a reusable component, consistent design, dark mode support, and PDF download functionality.
- **Loading Screen:** An animated loading bar with a green progress bar is displayed during page transitions and lazy loading.
- **Dark Mode:** A complete dark/light theme system with persistence in localStorage, utilizing CSS variables and semantic color tokens for seamless adaptation.
- **PDF Generation:** Modern single-page designs with real bank details, payment links for invoices, and contact information.
- **Testing:** An automated test suite using Vitest covers validation, i18n, theme, and PDF generation.
- **SEO Optimization:** Maximized SEO with targeted keywords, structured data (JSON-LD) across multiple schemas, server-side SEO headers, an enhanced robots.txt, dual sitemaps, and optimized meta tags.
- **Responsiveness:** Fully responsive design optimized for mobile devices.
- **Unified ID System:** Uses unique 8-digit numeric or alphanumeric IDs for various entities, managed by centralized ID generator at `server/lib/id-generator.ts`. Order codes follow pattern: `{STATE}-{8-DIGITS}` (e.g., NM-12345678, WY-87654321).
- **Validation Messages:** Standardized Spanish messages for all input validations.

**Feature Specifications:**
- **Order & Account System:** Mandatory account creation for orders, with options to create an account at the end of a form. Supports flexible payment options and detects existing users.
- **Pricing:** Clearly defined pricing for LLC formation and maintenance in New Mexico, Wyoming, and Delaware, including state fees and first-year services.
- **OTP Verification System:** Utilized for account creation, password resets, sensitive profile changes, and email verification.
- **Messaging System:** Automatically links messages from authenticated users, sends email notifications, supports threaded replies, and integrates with the user dashboard.
- **Admin Features:** Includes payment link management, CRUD operations for users and orders, document request management, invoice generation with status tracking, and payment due dates.
- **Compliance Calendar System:** Automatic calculation of IRS deadlines, annual reports, and registered agent renewals, with hourly reminder services. Supports intelligent 6-month extensions.
- **Progress Widget:** A visual 5-step progress tracker for LLC and Maintenance applications.
- **Abandoned Application Recovery:** Tracks and recovers incomplete applications with email reminders and automatic deletion after 48 hours.
- **Tax Comparator Tool:** An interactive calculator comparing Spanish freelancer taxes with US LLC structures, displaying savings and detailed breakdowns.
- **Operating Agreement Generator:** Professional 16-section legal document generator for completed LLCs with validated EIN, Easy US LLC branding, editable fields, automatic save to Document Center.

## Custom Icons
The application uses custom branded SVG icons stored in `client/src/assets/icons/`:
- `calendar-icon.svg` - Custom calendar icon for fiscal calendar widget (48x48, brand colors #22C55E/#DCFCE7)
- `money-icon.svg` - Custom money/bill icon for financial displays (48x48, brand colors)
- `tracking-icon.svg` - Custom clock icon for "Seguimiento" in client panel (48x48, brand colors)
- `email-icon.svg` - Custom email envelope icon (48x48, uses currentColor fill)

## External Dependencies
- **Drizzle ORM:** Database interaction.
- **Zod:** Data validation.
- **Express.js:** Backend framework.
- **Framer Motion:** UI animations.
- **shadcn/ui:** UI components and design system.
- **TanStack Query:** Client-side data fetching and caching.
- **wouter:** Client-side routing.
- **react-i18next:** Internationalization.
- **jspdf:** Client-side PDF generation.
- **pdfkit:** Server-side PDF generation.
- **Mercury / Relay:** Banking assistance integrations.
- **Stripe:** Payment processing portal integration.
- **Google Fonts:** Typography (Inter).
- **nodemailer:** Email sending.
