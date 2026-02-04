# Easy US LLC - Project Overview

## Overview
Easy US LLC simplifies US business formation, specifically for LLCs in New Mexico, Wyoming, and Delaware, for Spanish-speaking entrepreneurs. The project aims to provide comprehensive support including banking assistance, annual maintenance, and multilingual services, primarily in Spanish, to streamline complex legal and financial procedures for international clients and achieve significant market presence.

## User Preferences
I want to be communicated with in a clear and concise manner. I prefer explanations that are easy to understand, avoiding overly technical jargon. I appreciate an iterative development approach where I can provide feedback throughout the process. Please ask for my approval before implementing any significant changes to the codebase or design.

## System Architecture
The application features a modern UI/UX with a consistent design system (Primary Green, Carbon Black, Off White, Soft Gray, Text Gray) and Inter typography, with UI animations powered by Framer Motion.

**UI/UX Decisions:**
- **Design System:** Consistent color palette (Primary Green, Carbon Black, Off White, Soft Gray, Text Gray) and typography (Inter, Sans-serif).
- **Animations:** GPU-accelerated animations with optimized easing curves for snappier UX, using Framer Motion.
- **Responsiveness:** Fully responsive design optimized for mobile devices.
- **Dark Mode:** Complete dark/light theme system with persistence, utilizing CSS variables and semantic color tokens.
- **Domain Separation:** Two distinct domains: `creamostullc.com` for isolated landing pages (Linktree, Sales funnel, hardcoded Spanish, no i18n, no shared components) and `easyusllc.com` for the main website (home, services, FAQ, legal, dashboard, forms, auth) with full i18n.

**Technical Implementations:**
- **Client-side:** React, Wouter for routing, modular structure, native HTML `<select>` elements.
- **Server-side:** Express.js backend with extensive API endpoints for admin, user, orders, LLC applications, maintenance, messaging, newsletter, authentication, and PDF generation.
- **Database:** Drizzle ORM with Zod for type validation, incorporating key indexes.
- **Email System:** Professional templates with base64 embedded logos, managed via IONOS for notifications, support, and review requests.
- **Authentication:** OTP verification, session management, secure passwords, Google OAuth with auto-account creation, CSRF protection. Users must be 18+ for LLC creation.
- **Form Management:** Multi-step wizard forms (LLC, maintenance, contact) with auto-fill for authenticated users, local storage draft saving, and unauthenticated data transfer upon account creation.
- **Admin Panel:** Integrated within the client dashboard for privileged users, offering comprehensive control over orders, users, and messages.
- **Performance Optimizations:** Gzip compression, advanced cache headers, lazy loading with retry logic, content-visibility, non-blocking font loading, route prefetching, PWA support, in-memory cache, email queue system, optimized Vite build.
- **Security:** Enhanced rate limiting, comprehensive security headers (HSTS, COOP, CORP, CSP), CSRF protection, secure API endpoints with validation, HTML sanitization, audit logging, protected file serving, advanced fraud detection (IP tracking, login counting, account review, IP-based blocking), OTP for sensitive changes, LLC data locking after EIN assignment, AES-256-CBC encryption for sensitive data and documents, SHA-256 file integrity verification, document access logging.
- **Password Requirements:** Minimum 8 characters, uppercase, lowercase, number, and symbol required. Visual strength indicator (red to green bar) in registration form.
- **Internationalization (i18n):** Full trilingual support (Spanish/English/Catalan) via react-i18next with 1400+ translation keys. Operating Agreement PDF uses 93 dedicated i18n keys.
- **PDF Generation:** Single-page designs with real bank details, payment links, and contact information.
- **Testing:** Automated test suite using Vitest for validation, i18n, theme, and PDF generation.
- **SEO Optimization:** Targeted keywords, structured data (JSON-LD), server-side SEO headers, enhanced robots.txt, dual sitemaps, optimized meta tags, preconnect/dns-prefetch, fetchpriority for critical images.
- **Unified ID System:** Centralized ID generator (`server/lib/id-generator.ts`) for unique 8-digit numeric or alphanumeric IDs. Order codes follow `{STATE}-{8-DIGITS}` pattern.
- **Document Backup System:** Automated hourly incremental backup of `/uploads/` files to Replit Object Storage (GCS) with state tracking and audit logging.

**Feature Specifications:**
- **Order & Account System:** Mandatory account creation for orders, flexible payment options, detects existing users.
- **Pricing:** Clearly defined pricing for LLC formation and maintenance in New Mexico, Wyoming, and Delaware, including state fees and first-year services. Uses centralized configuration.
- **OTP Verification System:** For account creation, password resets, sensitive profile changes, and email verification.
- **Messaging System:** Links messages from authenticated users, sends email notifications, supports threaded replies, integrates with user dashboard.
- **Admin Features:** Payment link management, CRUD operations for users and orders, document request management, invoice generation with status tracking, payment due dates.
- **Compliance Calendar System:** Automatic calculation of IRS deadlines, annual reports, registered agent renewals, with hourly reminders and intelligent 6-month extensions.
- **Progress Widget:** Visual 5-step progress tracker for LLC and Maintenance applications.
- **Abandoned Application Recovery:** Tracks and recovers incomplete applications with email reminders.
- **Client Tools:**
    - **Invoice Generator:** Creates professional PDF invoices.
    - **Operating Agreement Generator:** Creates legal Operating Agreements for completed LLCs with EIN, 16-section template, auto-saves to Document Center.
    - **Price Calculator:** Tax comparison tool for Spanish freelancers vs US LLC.

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