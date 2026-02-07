# Easy US LLC - Compressed Project Overview

## Overview
Easy US LLC is a platform designed to simplify US business formation, specifically for LLCs in New Mexico, Wyoming, and Delaware, catering primarily to Spanish-speaking entrepreneurs. The project aims to provide comprehensive support, including banking assistance, annual maintenance, and multilingual services, to streamline complex legal and financial procedures for international clients. Its vision is to achieve a significant market presence by offering accessible, high-quality services to a niche market.

## User Preferences
I want to be communicated with in a clear and concise manner. I prefer explanations that are easy to understand, avoiding overly technical jargon. I appreciate an iterative development approach where I can provide feedback throughout the process. Please ask for my approval before implementing any significant changes to the codebase or design.

**CRITICAL RULE - NEVER DELETE CODE WITHOUT PERMISSION:**
- NEVER delete, remove, or significantly modify existing code without explicit user permission
- Always ASK before making destructive changes
- If there's a problem, PROPOSE the solution and await approval before implementing
- This rule has maximum priority
- ONLY touch what is explicitly asked — do not modify other sections, components, or spacing unless requested

## Recent Changes
- **2026-02-07:** Payment accounts UI fully internationalized — replaced 24+ hardcoded Spanish strings with i18n t() calls, added 22 paymentAccounts translation keys under dashboard.admin in all 7 locale files
- **2026-02-07:** Added missing support-related translations — supportPermissions, supportPermissionsDesc, users.supportBadge added to all 7 locale files for admin dashboard support role display
- **2026-02-07:** Admin dashboard restructured — admin users now see admin tabs directly in sidebar (Metrics, Orders, Communications, Incomplete, Users, Billing, Calendar, Docs, Payment Methods, Discounts) instead of nested user+admin structure. Support users retain limited support panel. Mobile navigation updated accordingly.
- **2026-02-07:** Payment accounts management — new `payment_accounts` database table (28th table) with admin CRUD UI panel. Three default accounts seeded: Thread Bank CHECKING, Column N.A. CHECKING, Saxo Payments IBAN. Admin can create, edit, toggle active/inactive, and delete payment accounts.
- **2026-02-07:** PDF invoice generator updated — now dynamically renders all active payment accounts from database instead of single hardcoded account. Falls back to default accounts when none configured.
- **2026-02-07:** Payment form simplification — removed detailed bank account information from LLC and Maintenance form payment steps. Now shows only simple radio options ("Transferencia bancaria" / "Link de pago") without displaying actual banking details. Users see bank details only in generated invoice PDFs.
- **2026-02-07:** LLC form account creation (step 14) — replaced all hardcoded Spanish strings with i18n translation keys, added PasswordStrength indicator, fixed password field sizing to match button height, fixed error handling in claim-order flow, added `application.account` (18 keys) and `auth.accountDeactivated` translations across all 7 languages
- **2026-02-07:** FAQ answer formatting — removed `**` markdown markers from taxes answer (a6) across all 7 languages, added `whitespace-pre-line` for proper numbered list display
- **2026-02-06:** Bank account details updated to Thread Bank NA (routing: 064209588, account: 200002330558) in PDF invoice generator
- **2026-02-06:** Fixed "Compara aquí" link on LLC formation page — now navigates to state comparison section (#state-comparison) instead of tax comparator (#comparador)
- **2026-02-06:** Animation optimizations — CSS animations slowed from 0.2s to 0.4s, Framer Motion transitions from 0.35s to 0.6s, reduced y-offsets from 15px to 10px for smoother, more premium feel
- **2026-02-06:** Navigation fixes — hash scrolling works correctly for #pricing/#comparador/#state-comparison, pages scroll to top on route change, eliminated double-scroll race condition by centralizing scroll logic
- **2026-02-06:** Mobile image cards — replaced fixed h-44 heights with aspect-[16/9] for proper scaling without clipping
- **2026-02-06:** Removed animate-pulse from swipe hint arrows in servicios page
- **2026-02-06:** Mercury logo replaced with new brand image in footer

## System Architecture
The application features a modern, responsive UI/UX with a consistent design system (Primary Green, Carbon Black, Off White, Soft Gray, Text Gray) and a premium fintech typography hierarchy (Space Grotesk 800 for hero/marketing titles, Inter 700 for UI headings h2-h6, DM Sans for body/forms), with UI animations powered by Framer Motion. It supports a full dark/light theme system. The project uses two distinct domains: `creamostullc.com` for isolated landing pages and `easyusllc.com` for the main website, which includes home, services, FAQ, legal, dashboard, forms, and authentication with full i18n support.

**Technical Implementations:**
- **Client-side:** Built with React, utilizing Wouter for routing, a modular structure, and native HTML `<select>` elements.
- **Server-side:** Powered by an Express.js backend, providing extensive API endpoints for various functionalities including admin, user management, orders, LLC applications, maintenance, messaging, newsletters, authentication, and PDF generation.
- **Database:** PostgreSQL with Drizzle ORM and Zod for type validation. 28 tables including users, orders, llc_applications, maintenance_applications, messages, sessions, audit_logs, payment_accounts, and more. Key indexes for performance.
- **Banking:** Invoice PDFs dynamically render all active payment accounts from `payment_accounts` database table. Default accounts: Thread Bank CHECKING, Column N.A. CHECKING, Saxo Payments IBAN. Admin can manage accounts via dashboard.
- **Email System:** Manages professional email templates via IONOS for notifications, support, and review requests.
- **Authentication:** Features OTP verification, robust session management, secure passwords, Google OAuth with auto-account creation, and CSRF protection. Users must be 18+ for LLC creation.
- **Form Management:** Implements multi-step wizard forms (LLC, maintenance, contact) with auto-fill for authenticated users, local storage draft saving, and unauthenticated data transfer upon account creation.
- **Admin Panel:** Admin users see admin tabs directly in sidebar (no nested user+admin structure). Includes comprehensive control over orders, users, messages, payment accounts, discounts, and billing. Support users see limited support panel with sub-tabs.
- **Performance Optimizations:** Includes Gzip compression, advanced cache headers, lazy loading, non-blocking font loading, PWA support, in-memory cache, an email queue system, and optimized Vite build processes. Animations use gentle easing (0.4-0.7s durations, 10px offsets).
- **Security:** Employs enhanced rate limiting, comprehensive security headers (HSTS, COOP, CORP, CSP), CSRF protection, secure API endpoints with validation, HTML sanitization, audit logging, protected file serving, advanced fraud detection, OTP for sensitive changes, LLC data locking, AES-256-CBC encryption for sensitive data, SHA-256 file integrity verification, and document access logging. Password requirements include minimum 8 characters, uppercase, lowercase, number, and symbol.
- **Internationalization (i18n):** Full 7-language support (Spanish/English/Catalan/French/German/Italian/Portuguese) via react-i18next with over 2200 translation keys per language. WhatsApp pre-filled messages are internationalized via a centralized `whatsapp.ts` helper with per-context translation keys.
- **PDF Generation:** Supports both client-side and server-side PDF generation for documents like invoices and operating agreements.
- **Testing:** Utilizes Vitest for an automated test suite with 29 tests covering validation, i18n, theme, and PDF generation.
- **SEO Optimization:** Includes targeted keywords, structured data (JSON-LD), server-side SEO headers, optimized robots.txt, dual sitemaps, and meta tags.
- **Unified ID System:** Centralized `id-generator.ts` for all unique IDs across the system, ensuring uniqueness against the database.
- **Document Backup System:** Automated hourly incremental backup of `/uploads/` files to Replit Object Storage with state tracking and audit logging.
- **Navigation:** ScrollToTop component handles route changes (scrolls to top on new pages, defers to click handlers for hash navigation). Hash scrolling managed by navbar/footer handlers with 500ms/400ms delays for page load.

**Feature Specifications:**
- **Order & Account System:** Mandatory account creation for orders, flexible payment options, and detection of existing users.
- **Pricing:** Clearly defined pricing for LLC formation and maintenance in New Mexico, Wyoming, and Delaware, including state fees and first-year services, managed via a centralized configuration.
- **OTP Verification System:** Used for account creation, password resets, sensitive profile changes, and email verification.
- **Messaging System:** Links messages from authenticated users, sends email notifications, supports threaded replies, and integrates with the user dashboard.
- **Admin Features:** Includes payment link management, CRUD operations for users and orders, document request management, and invoice generation with status tracking and payment due dates.
- **Compliance Calendar System:** Automatically calculates IRS deadlines, annual reports, and registered agent renewals, with hourly reminders and intelligent 6-month extensions.
- **Progress Widget:** A visual 5-step progress tracker for LLC and Maintenance applications.
- **Abandoned Application Recovery:** Tracks and recovers incomplete applications with email reminders.
- **Client Tools:** Provides an Invoice Generator, Operating Agreement Generator, and a Price Calculator (tax comparison tool).
- **State Comparison:** Interactive comparison of New Mexico, Wyoming, and Delaware with pros, cons, ideal scenarios, pricing, and processing times. Link from LLC formation page ("Compara aquí") navigates to #state-comparison section.

## Database Schema (28 tables)
- users, sessions, orders, order_events, products
- llc_applications, maintenance_applications, application_documents
- messages, message_replies, user_notifications
- newsletter_subscribers, contact_otps, email_verification_tokens
- password_reset_tokens, rate_limit_entries
- audit_logs, document_access_logs, encrypted_fields
- accounting_transactions, discount_codes, payment_accounts
- consultation_availability, consultation_blocked_dates, consultation_bookings, consultation_types
- calculator_consultations, guest_visitors

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
- **Google Fonts:** Typography (Space Grotesk for hero/marketing, Inter for UI headings, DM Sans for body).
- **nodemailer:** Email sending.
