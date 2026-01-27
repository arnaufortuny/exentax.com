# Easy US LLC - Project Overview

## Description
Easy US LLC is a business formation service for Spanish-speaking entrepreneurs looking to establish LLCs in the United States (New Mexico, Wyoming, Delaware).

## Design System
- **Colors**:
  - Primary Green: #6EDC8A
  - Carbon Black: #0E1215
  - Off White: #F7F7F5
  - Soft Gray: #E6E9EC
  - Text Gray: #6B7280
- **Typography**: Inter for titles, Sans-serif for body.
- **Animations**: Framer Motion (fadeIn, staggerContainer).

## Key Features
- LLC formation in 3 states.
- Banking assistance (Mercury, Relay).
- Annual maintenance services.
- Multilingual support (Spanish focus).

## Project Structure
- `client/src/pages/`: Main application pages (Home, Servicios, FAQ, Contacto).
- `client/src/components/layout/`: Shared layout components (Navbar, Footer, HeroSection, Newsletter).
- `shared/schema.ts`: Drizzle database schema and Zod types.
- `server/`: Express backend with Drizzle storage.

## Recent Changes
- **Authentication System Fix (Jan 2026):**
  - Fixed login/register race condition - now waits for session confirmation before redirect
  - Uses window.location.href for full page reload ensuring cookies are sent
  - Email sending failures no longer block registration/password reset
  - Invoice generator updated with complete business details (EASY US LLC, FORTUNY CONSULTING LLC)
  - Newsletter section unified across all pages (integrated into Footer)
  - Newsletter text now displays in black color
- **Contact Form & Order System (Jan 2026):**
  - Completely rewrote contact form to use 7-step wizard pattern matching LLC/Maintenance forms
  - Steps: name, surname, email, phone, subject, message, OTP verification, submit
  - Unified deterministic order number format: `${statePrefix}-${year}${orderNum.slice(0,2)}-${orderNum.slice(2)}` (e.g., NM-2600-0001)
  - Storage layer getOrder now populates product, application, and user relations for invoice/receipt generation
  - Order submission works both with and without user login (optional userId)
- **Mobile & Admin Optimizations (Jan 2026):**
  - Added discreet login button (UserIcon) to mobile navbar for guests, dashboard link for authenticated users
  - Admin dashboard fully responsive with card-based views on mobile (<md breakpoint) replacing tables
  - Tabs show icons only on mobile with full labels on desktop
  - Secure admin role system using ADMIN_EMAIL env var (auto-assigned on registration)
  - Protected /api/seed-admin endpoint with ADMIN_SEED_SECRET token requirement
- **Profile & Auto-fill Enhancements (Jan 2026):**
  - Added PATCH /api/user/profile endpoint with Zod validation for profile updates
  - Enhanced user profile with address fields (streetType, city, province, postalCode, country)
  - Auto-fill support in application forms for logged-in users (name, email, phone, address, businessActivity)
  - Dashboard profile section displays all fields including email verification status
- **Client Dashboard Enhancements (Jan 2026):**
  - Dynamic order timeline fetched from orderEvents API with real-time updates
  - Enhanced messaging system with ticket IDs (MSG-{id}) and reply functionality
  - Proper TanStack Query implementation with hierarchical cache keys
  - Invoice viewing and Stripe portal integration
- **Contact Form Improvements:**
  - Message ID capture and display on confirmation page
  - URL parameter support for orderId and ticket tracking
  - Green checkmark confirmation with prominent ticket numbers
- **Design System Compliance:**
  - Removed custom hover/active states from Button components
  - Standardized with built-in shadcn elevation utilities
- Migrated Navbar and Footer to use semantic design tokens (accent, primary, primary-foreground).
- Standardized all email notifications (client/admin) with professional minimalist design.
- Implemented automated response system for customer contact with 24-48h SLAs.
- Enhanced application tracking with unified ticket IDs for both client and admin.
- Added optional phone number field to contact form for improved lead quality.
- Optimized performance: Implemented Gzip compression, advanced cache headers (1 year for assets), and Lazy Loading for all routes.
- Improved rendering efficiency using `content-visibility: auto` in CSS and better font smoothing.
- Refined project structure and error handling across backend services.
- Removed legacy popups for maintenance packs and streamlined navigation to contact form with auto-subject.
- Cleaned up unused components (state-selector-popup) and documentation files.
- Standardized mobile UI across all application forms (LLC Formation and Maintenance Pack).
- Implemented consistent design tokens: rounded-full buttons, flex-2 primary actions, and touch-optimized scaling.
- Enhanced form responsiveness with adjusted typography, spacing, and smooth motion animations.
- Updated Terms & Conditions page with comprehensive legal content and PDF download functionality.
- Synchronized all legal documentation with official company identity (Fortuny Consulting LLC).
