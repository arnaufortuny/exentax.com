# Easy US LLC - Project Overview

## Overview
Easy US LLC is a business formation service for Spanish-speaking entrepreneurs, specializing in LLC formation in New Mexico, Wyoming, and Delaware. The project offers comprehensive support including banking assistance, annual maintenance, and multilingual services, primarily in Spanish. Its core purpose is to provide a streamlined and user-friendly experience for international clients navigating the US business landscape, aiming for a significant market presence by simplifying complex legal and financial processes.

## User Preferences
I want to be communicated with in a clear and concise manner. I prefer explanations that are easy to understand, avoiding overly technical jargon. I appreciate an iterative development approach where I can provide feedback throughout the process. Please ask for my approval before implementing any significant changes to the codebase or design.

## System Architecture
The application is built with a modern UI/UX, featuring a consistent design system (Primary Green: #6EDC8A, Carbon Black: #0E1215, Off White: #F7F7F5, Soft Gray: #E6E9EC, Text Gray: #6B7280) and typography (Inter for titles, Sans-serif for body). UI animations are handled with Framer Motion.

**Technical Implementations:**
- **Client-side:** Developed with React, utilizing a modular structure for pages (Home, Servicios, FAQ, Contacto) and reusable layout components (Navbar, Footer, HeroSection, Newsletter). Client-side routing is managed by Wouter.
- **Server-side:** Powered by an Express.js backend.
- **Database:** Drizzle ORM defines the schema with Zod for type validation, incorporating key indexes for performance.
- **Email System:** Professional email templates are managed through three IONOS accounts for system notifications, support, and Trustpilot review requests. All emails are designed for consistency and branding.
- **Authentication:** Features robust OTP verification, session management, and secure password handling. Account creation is mandatory for orders, with automatic verification and a welcome email. Includes Google OAuth only (no Apple) with CSRF-protected redirect flow, modern multi-color Google icon, and automatic account creation for new OAuth users. Users can connect/disconnect Google from their profile.
- **Form Management:** Multi-step wizard patterns for LLC, maintenance, and contact forms, including auto-fill for authenticated users and auto-saving drafts to local storage. Address fields are standardized across all forms with separate fields: streetType (Calle, Avenida, etc.), address, city, province, postalCode, and country. When non-authenticated users create an account at the end of the LLC form, all their address and profile data is automatically copied to the new user account.
- **Admin Panel:** Integrated into the client dashboard for privileged users, offering full control over orders, users, and messages.
- **Performance Optimizations:** Includes Gzip compression, advanced cache headers, lazy loading, `content-visibility: auto` for images, non-blocking font loading, and route prefetching. PWA support is also implemented for an app-like experience.
- **Security:** Enhanced rate limiting, comprehensive security headers (HSTS, COOP, CORP, CSP), secure API endpoints with validation, HTML sanitization, and audit logging. A centralized security module manages these functions.
- **Internationalization (i18n):** Full bilingual support (Spanish/English) via react-i18next. Translation files in `client/src/locales/`. Language toggle in navbar with automatic detection.
- **Dark Mode:** Complete dark/light theme system with ThemeProvider hook (`client/src/hooks/use-theme.tsx`). Theme persisted in localStorage. CSS variables defined in `index.css` for seamless switching. Optimized dark mode palette using softer gray-blue tones (hsl(220 15% 10%)) for better eye comfort. All components use semantic color tokens (bg-background, bg-card, bg-muted, text-foreground, border-border) ensuring proper adaptation in both modes without breaking light mode design. Theme toggle uses white background with text abbreviations (ES/EN) and Check icon for selected state.
- **PDF Generation:** Optimized PDF generation using PDFKit (replacing puppeteer). Invoice and receipt generation via `server/lib/pdf-generator.ts`. Lower memory footprint, faster generation.
- **Testing:** Automated test suite with Vitest (22+ tests). Run with `npm run test`. Tests cover validation, i18n, theme, and PDF generation.
- **SEO Optimization:** Maximum SEO with targeted keywords (tu LLC, Limited Liability Company, fiscalidad, optimización impuestos, tax). Structured data (JSON-LD) with Organization, Service offers (6 total: 3 formation + 3 maintenance), FAQPage, LocalBusiness, and BreadcrumbList schemas. Optimized meta tags, Open Graph, Twitter cards. Favicon configured for search engines. Sitemap.xml and robots.txt properly configured.
- **Responsiveness:** Fully responsive design across all components, optimized for mobile devices.
- **Unified ID System:** Utilizes unique 8-digit numeric or alphanumeric IDs for clients, orders (e.g., NM-12345678), tickets, documents, invoices, and payments, managed by a centralized ID generator.
- **Validation Messages:** Standardized Spanish messages for all input validations.

**Feature Specifications:**
- **Order & Account System:** Mandatory account creation for LLC and maintenance orders, auto-verified accounts, welcome emails, and flexible payment options (bank transfer or payment link). Existing user detection prompts for login to continue orders.
- **Pricing (January 2026):** Formation: New Mexico 739€, Wyoming 899€, Delaware 1199€. Maintenance: New Mexico 539€, Wyoming 699€, Delaware 899€. All prices include state fees and first year services.
- **OTP Verification System:** Email OTP verification is required for account creation and password resets, with 6-digit codes valid for 10 minutes, and state reset on email changes.
- **Messaging System:** Automatically links messages from authenticated users, sends email notifications to users and admins, supports threaded replies, and integrates message history into the user dashboard.
- **Admin Features:** Includes payment link generation, full CRUD operations for users and orders, document request management, and invoice generation.
- **Compliance Calendar System:** Automatic calculation of IRS deadlines (1120/5472 on April 15 following year), Annual Reports for Delaware and Wyoming (12 months from formation), and Registered Agent renewals (12 months). Hourly reminder service sends notifications 60 days before deadlines. Responsive calendar UI with mobile-optimized grid layout.

## External Dependencies
- **Drizzle ORM:** For database interaction.
- **Zod:** For data validation.
- **Express.js:** Backend framework.
- **Framer Motion:** For UI animations.
- **shadcn/ui:** For UI components and design system.
- **TanStack Query:** For client-side data fetching and caching.
- **wouter:** For client-side routing.
- **Mercury / Relay:** For banking assistance integrations.
- **Stripe:** For payment processing portal integration.
- **Google Fonts:** For typography (Inter).