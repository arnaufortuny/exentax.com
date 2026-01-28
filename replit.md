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
- **Email System:** Professional, modern email templates with metadata, SVG icons, and a unified design.
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