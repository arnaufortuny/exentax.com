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

## System Architecture
The application features a modern, responsive UI/UX with a consistent design system (Primary Green, Carbon Black, Off White, Soft Gray, Text Gray) and Inter typography, with UI animations powered by Framer Motion. It supports a full dark/light theme system. The project uses two distinct domains: `creamostullc.com` for isolated landing pages and `easyusllc.com` for the main website, which includes home, services, FAQ, legal, dashboard, forms, and authentication with full i18n support.

**Technical Implementations:**
- **Client-side:** Built with React, utilizing Wouter for routing, a modular structure, and native HTML `<select>` elements.
- **Server-side:** Powered by an Express.js backend, providing extensive API endpoints for various functionalities including admin, user management, orders, LLC applications, maintenance, messaging, newsletters, authentication, and PDF generation.
- **Database:** Uses Drizzle ORM with Zod for type validation and incorporates key indexes.
- **Email System:** Manages professional email templates via IONOS for notifications, support, and review requests.
- **Authentication:** Features OTP verification, robust session management, secure passwords, Google OAuth with auto-account creation, and CSRF protection. Users must be 18+ for LLC creation.
- **Form Management:** Implements multi-step wizard forms (LLC, maintenance, contact) with auto-fill for authenticated users, local storage draft saving, and unauthenticated data transfer upon account creation.
- **Admin Panel:** Integrated within the client dashboard, offering comprehensive control over orders, users, and messages.
- **Performance Optimizations:** Includes Gzip compression, advanced cache headers, lazy loading, non-blocking font loading, PWA support, in-memory cache, an email queue system, and optimized Vite build processes.
- **Security:** Employs enhanced rate limiting, comprehensive security headers (HSTS, COOP, CORP, CSP), CSRF protection, secure API endpoints with validation, HTML sanitization, audit logging, protected file serving, advanced fraud detection, OTP for sensitive changes, LLC data locking, AES-256-CBC encryption for sensitive data, SHA-256 file integrity verification, and document access logging. Password requirements include minimum 8 characters, uppercase, lowercase, number, and symbol.
- **Internationalization (i18n):** Full trilingual support (Spanish/English/Catalan) via react-i18next with over 1400 translation keys.
- **PDF Generation:** Supports both client-side and server-side PDF generation for documents like invoices and operating agreements.
- **Testing:** Utilizes Vitest for an automated test suite covering validation, i18n, theme, and PDF generation.
- **SEO Optimization:** Includes targeted keywords, structured data (JSON-LD), server-side SEO headers, optimized robots.txt, dual sitemaps, and meta tags.
- **Unified ID System:** Centralized `id-generator.ts` for all unique IDs across the system, ensuring uniqueness against the database.
- **Document Backup System:** Automated hourly incremental backup of `/uploads/` files to Replit Object Storage with state tracking and audit logging.

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