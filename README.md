# Exentax — Plataforma Integral de Formación de LLCs en EE.UU.

## Descripci&oacute;n General

Exentax es una plataforma SaaS full-stack de producci&oacute;n dise&ntilde;ada para simplificar la creaci&oacute;n y gesti&oacute;n de empresas LLC en Estados Unidos (New Mexico, Wyoming, Delaware). Est&aacute; enfocada en emprendedores internacionales, especialmente hispanohablantes, ofreciendo servicios end-to-end que incluyen formaci&oacute;n empresarial, mantenimiento anual, asistencia bancaria, cumplimiento normativo, y soporte profesional multiling&uuml;e en 7 idiomas.

**Dominio:** [exentax.com](https://exentax.com)

---

## Stack Tecnol&oacute;gico

### Frontend
| Tecnolog&iacute;a | Uso |
|---|---|
| React 18 + TypeScript | Framework UI con tipado est&aacute;tico |
| Vite | Bundler y servidor de desarrollo |
| Tailwind CSS + shadcn/ui | Sistema de dise&ntilde;o y componentes |
| Wouter | Enrutamiento SPA ligero |
| TanStack Query v5 | Gesti&oacute;n de estado servidor y cach&eacute; |
| react-i18next | Internacionalizaci&oacute;n (7 idiomas) |
| react-hook-form + Zod | Formularios con validaci&oacute;n tipada |
| Framer Motion | Animaciones y transiciones |
| jspdf | Generaci&oacute;n PDF cliente (herramientas usuario) |

### Backend
| Tecnolog&iacute;a | Uso |
|---|---|
| Express.js + TypeScript | Servidor API REST |
| PostgreSQL (Neon) | Base de datos relacional |
| Drizzle ORM | ORM con migraciones y tipado |
| Gmail API (googleapis) | Env&iacute;o de emails transaccionales |
| Google Calendar API | Creaci&oacute;n de eventos con Google Meet |
| Replit Object Storage | Almacenamiento de documentos |
| web-push | Notificaciones push del navegador |
| pdfkit | Generaci&oacute;n PDF servidor (facturas, acuerdos) |
| Zod | Validaci&oacute;n de schemas compartidos |

### Temas Visuales
- **Light Mode**: Interfaz clara por defecto
- **Dark Mode**: Tema oscuro completo
- **Forest Mode**: Tema verde naturaleza
- Meta tag `theme-color` din&aacute;mico para experiencia m&oacute;vil consistente

---

## Arquitectura del Proyecto

```
exentax/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── App.tsx                  # Router principal + proveedores
│   │   ├── pages/                   # P&aacute;ginas de la aplicaci&oacute;n
│   │   │   ├── home.tsx             # Landing page principal
│   │   │   ├── servicios.tsx        # P&aacute;gina de servicios
│   │   │   ├── faq.tsx              # Preguntas frecuentes
│   │   │   ├── contacto.tsx         # Formulario de contacto con OTP
│   │   │   ├── start.tsx            # P&aacute;gina de inicio r&aacute;pido
│   │   │   ├── linktree.tsx         # P&aacute;gina tipo Linktree
│   │   │   ├── llc-formation.tsx    # Wizard de formaci&oacute;n LLC (multi-paso)
│   │   │   ├── maintenance.tsx      # Formulario de mantenimiento anual
│   │   │   ├── agendar-consultoria.tsx  # Reserva de consultor&iacute;a gratuita
│   │   │   ├── dashboard.tsx        # Dashboard principal (cliente + admin)
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx        # Inicio de sesi&oacute;n
│   │   │   │   ├── register.tsx     # Registro de cuenta
│   │   │   │   └── forgot-password.tsx  # Recuperaci&oacute;n de contrase&ntilde;a
│   │   │   ├── legal/
│   │   │   │   ├── terminos.tsx     # T&eacute;rminos y condiciones
│   │   │   │   ├── privacidad.tsx   # Pol&iacute;tica de privacidad
│   │   │   │   ├── reembolsos.tsx   # Pol&iacute;tica de reembolsos
│   │   │   │   └── cookies.tsx      # Pol&iacute;tica de cookies
│   │   │   ├── tools/
│   │   │   │   ├── invoice-generator.tsx     # Generador de facturas PDF
│   │   │   │   ├── price-calculator.tsx      # Calculadora de precios
│   │   │   │   ├── operating-agreement.tsx   # Generador de Operating Agreement
│   │   │   │   └── csv-generator.tsx         # Generador de reportes CSV
│   │   │   └── dashboard/
│   │   │       ├── components/
│   │   │       │   └── DashboardSidebar.tsx  # Sidebar del dashboard
│   │   │       └── panels/
│   │   │           ├── user/                 # Paneles del cliente
│   │   │           │   ├── CalendarPanel.tsx
│   │   │           │   ├── DocumentsPanel.tsx
│   │   │           │   ├── PaymentsPanel.tsx
│   │   │           │   ├── PendingReviewCard.tsx
│   │   │           │   └── ToolsPanel.tsx
│   │   │           └── admin/                # Paneles del administrador
│   │   │               ├── AdminDashboardPanel.tsx
│   │   │               ├── AdminUsersPanel.tsx
│   │   │               ├── AdminOrdersPanel.tsx
│   │   │               ├── AdminDocsPanel.tsx
│   │   │               ├── AdminBillingPanel.tsx
│   │   │               ├── AdminCommsPanel.tsx
│   │   │               ├── AdminCalendarPanel.tsx
│   │   │               ├── AdminDiscountsPanel.tsx
│   │   │               ├── AdminIncompletePanel.tsx
│   │   │               └── forms/            # Formularios admin (15 forms)
│   │   ├── components/
│   │   │   ├── ui/                   # Componentes base shadcn/ui (30+)
│   │   │   ├── layout/              # Navbar, Footer, Hero, Newsletter
│   │   │   ├── forms/               # Componentes de formulario reutilizables
│   │   │   ├── auth/                # Login social (Google OAuth)
│   │   │   ├── dashboard/           # Tabs y paneles del dashboard
│   │   │   ├── legal/               # Layout p&aacute;ginas legales
│   │   │   └── icons.tsx            # Barrel export de iconos Lucide
│   │   ├── hooks/
│   │   │   ├── use-auth.ts          # Autenticaci&oacute;n y sesi&oacute;n
│   │   │   ├── use-form-draft.ts    # Guardado de borradores de formularios
│   │   │   ├── use-mobile.tsx       # Detecci&oacute;n de dispositivo m&oacute;vil
│   │   │   ├── use-page-title.ts    # T&iacute;tulos i18n + meta tags OG
│   │   │   ├── use-prefetch.tsx     # Precarga de datos
│   │   │   ├── use-push-notifications.ts  # Notificaciones push
│   │   │   ├── use-theme.tsx        # Gesti&oacute;n de tema (light/dark/forest)
│   │   │   └── use-toast.ts         # Sistema de notificaciones toast
│   │   ├── locales/                 # 7 archivos de traducci&oacute;n
│   │   │   ├── es.json (3,215+ claves)
│   │   │   ├── en.json
│   │   │   ├── ca.json (Catal&aacute;n)
│   │   │   ├── fr.json (Franc&eacute;s)
│   │   │   ├── de.json (Alem&aacute;n)
│   │   │   ├── it.json (Italiano)
│   │   │   └── pt.json (Portugu&eacute;s)
│   │   └── lib/
│   │       ├── queryClient.ts       # TanStack Query config + apiRequest
│   │       ├── validation.ts        # Validaciones compartidas
│   │       └── constants.ts         # Constantes (tel&eacute;fono, etc.)
│   └── public/
│       └── sw.js                    # Service Worker para push notifications
│
├── server/                          # Backend Express
│   ├── index.ts                     # Entrada principal + inicializaci&oacute;n
│   ├── routes.ts                    # Registro de rutas + tareas programadas
│   ├── sitemap.ts                   # Generaci&oacute;n din&aacute;mica de sitemap.xml
│   ├── storage.ts                   # Interfaz IStorage + implementaci&oacute;n
│   ├── vite.ts                      # Configuraci&oacute;n Vite (no modificar)
│   ├── routes/                      # Endpoints API (19 archivos)
│   │   ├── shared.ts               # Middleware compartido (auth, session, IP)
│   │   ├── auth-ext.ts             # Autenticaci&oacute;n extendida (check-email, OTP)
│   │   ├── consultations.ts        # Sistema de consultor&iacute;as completo
│   │   ├── contact.ts              # Formulario de contacto
│   │   ├── llc.ts                  # Formaci&oacute;n y gesti&oacute;n de LLCs
│   │   ├── maintenance.ts          # Mantenimiento anual
│   │   ├── messages.ts             # Mensajer&iacute;a interna
│   │   ├── orders.ts               # &Oacute;rdenes de servicio
│   │   ├── user-documents.ts       # Documentos del usuario
│   │   ├── user-profile.ts         # Perfil de usuario
│   │   ├── user-security.ts        # Seguridad de cuenta
│   │   ├── push.ts                 # Notificaciones push
│   │   ├── accounting.ts           # Contabilidad y transacciones
│   │   ├── admin-billing.ts        # Facturaci&oacute;n admin
│   │   ├── admin-comms.ts          # Comunicaciones admin
│   │   ├── admin-documents.ts      # Documentos admin
│   │   ├── admin-orders.ts         # &Oacute;rdenes admin
│   │   ├── admin-roles.ts          # Roles y permisos admin
│   │   └── admin-users.ts          # Gesti&oacute;n de usuarios admin
│   ├── lib/                         # Servicios core (22 archivos)
│   │   ├── config.ts               # Configuraci&oacute;n centralizada
│   │   ├── auth-service.ts         # Servicio de autenticaci&oacute;n
│   │   ├── custom-auth.ts          # Auth personalizada (sesi&oacute;n, Google)
│   │   ├── token-auth.ts           # Tokens de autenticaci&oacute;n
│   │   ├── email.ts                # 46 plantillas de email + cola
│   │   ├── email-translations.ts   # Traducciones de emails (7 idiomas)
│   │   ├── gmail-client.ts         # Cliente Gmail API
│   │   ├── google-calendar-client.ts  # Cliente Google Calendar + Meet
│   │   ├── pdf-generator.ts        # Generaci&oacute;n de PDFs (facturas, acuerdos)
│   │   ├── push-service.ts         # Servicio de notificaciones push
│   │   ├── security.ts             # Rate limiting + sanitizaci&oacute;n
│   │   ├── rate-limiter.ts         # Rate limiter en memoria + PostgreSQL
│   │   ├── csrf.ts                 # Protecci&oacute;n CSRF
│   │   ├── backup.ts               # Sistema de backups programados
│   │   ├── backup-service.ts       # Servicio de backup de datos
│   │   ├── abandoned-service.ts    # Recordatorios de solicitudes abandonadas
│   │   ├── task-watchdog.ts        # Monitor de tareas programadas
│   │   ├── logger.ts               # Sistema de logging estructurado
│   │   ├── id-generator.ts         # Generador de IDs &uacute;nicos
│   │   ├── db-utils.ts             # Utilidades de base de datos
│   │   ├── api-metrics.ts          # M&eacute;tricas de API
│   │   └── sentry.ts               # Integraci&oacute;n Sentry (opcional)
│   └── replit_integrations/         # Conectores Replit
│
├── shared/
│   └── schema.ts                    # 29 tablas Drizzle + schemas Zod (693 l&iacute;neas)
│
└── drizzle.config.ts                # Configuraci&oacute;n Drizzle (no modificar)
```

---

## Rutas Frontend (SPA)

| Ruta | Componente | Descripci&oacute;n | Acceso |
|---|---|---|---|
| `/` | `Home` | Landing page con hero, servicios, FAQ, newsletter | P&uacute;blico |
| `/servicios` | `Servicios` | Cat&aacute;logo detallado de servicios | P&uacute;blico |
| `/faq` | `FAQ` | Preguntas frecuentes expandibles | P&uacute;blico |
| `/contacto` | `Contacto` | Formulario de contacto con verificaci&oacute;n OTP | P&uacute;blico |
| `/start` | `StartPage` | P&aacute;gina de inicio r&aacute;pido / CTA | P&uacute;blico |
| `/links` | `LinktreePage` | P&aacute;gina tipo Linktree con enlaces | P&uacute;blico |
| `/agendar-consultoria` | `AgendarConsultoria` | Reserva de consultor&iacute;a gratuita (5 pasos) | P&uacute;blico* |
| `/llc/formation` | `LlcFormation` | Wizard de formaci&oacute;n LLC (multi-paso) | P&uacute;blico |
| `/llc/maintenance` | `MaintenancePage` | Solicitud de mantenimiento anual | P&uacute;blico |
| `/auth/login` | `Login` | Inicio de sesi&oacute;n (email/password + Google) | P&uacute;blico |
| `/auth/register` | `Register` | Registro con verificaci&oacute;n OTP | P&uacute;blico |
| `/auth/forgot-password` | `ForgotPassword` | Recuperaci&oacute;n de contrase&ntilde;a (3 pasos) | P&uacute;blico |
| `/dashboard` | `Dashboard` | Panel principal cliente/admin | Autenticado |
| `/tools/invoice` | `InvoiceGenerator` | Generador de facturas PDF | P&uacute;blico |
| `/tools/price-calculator` | `PriceCalculator` | Calculadora de precios LLC | P&uacute;blico |
| `/tools/operating-agreement` | `OperatingAgreement` | Generador de Operating Agreement | P&uacute;blico |
| `/tools/csv-generator` | `CsvGenerator` | Generador de reportes CSV | P&uacute;blico |
| `/legal/terminos` | `Legal` | T&eacute;rminos y condiciones | P&uacute;blico |
| `/legal/privacidad` | `Privacidad` | Pol&iacute;tica de privacidad | P&uacute;blico |
| `/legal/reembolsos` | `Reembolsos` | Pol&iacute;tica de reembolsos | P&uacute;blico |
| `/legal/cookies` | `Cookies` | Pol&iacute;tica de cookies | P&uacute;blico |

*\*La consultor&iacute;a gratuita es solo para usuarios sin cuenta. Usuarios registrados son redirigidos a login. Usuarios con LLC son redirigidos a consultor&iacute;a de pago.*

### Dashboard - Tabs por URL (`/dashboard?tab=...`)

| Tab | Panel | Descripci&oacute;n |
|---|---|---|
| `services` | ServicesTab | Servicios contratados y estado de &oacute;rdenes |
| `documents` | DocumentsPanel | Documentos subidos/recibidos con solicitudes pendientes |
| `payments` | PaymentsPanel | Facturas, pagos y enlaces de pago |
| `calendar` | CalendarPanel | Calendario de compliance y fechas l&iacute;mite |
| `messages` | MessagesTab | Mensajer&iacute;a interna con soporte |
| `consultations` | ConsultationsTab | Reserva de consultor&iacute;as (gratuitas o de pago) |
| `tools` | ToolsPanel | Herramientas: facturas, acuerdos, calculadora |
| `notifications` | NotificationsTab | Centro de notificaciones |
| `profile` | ProfileTab | Perfil, seguridad, idioma, newsletter, GDPR |

### Dashboard Admin - Tabs adicionales

| Tab | Panel | Descripci&oacute;n |
|---|---|---|
| `admin` | AdminDashboardPanel | Estad&iacute;sticas generales, m&eacute;tricas CRM, sistema |
| `admin-users` | AdminUsersPanel | CRUD usuarios, verificaci&oacute;n identidad, roles |
| `admin-orders` | AdminOrdersPanel | Gesti&oacute;n completa de &oacute;rdenes y estados |
| `admin-docs` | AdminDocsPanel | Revisi&oacute;n de documentos, aprobaci&oacute;n/rechazo |
| `admin-billing` | AdminBillingPanel | Facturas, cuentas de pago, contabilidad |
| `admin-comms` | AdminCommsPanel | Mensajes, notas, newsletter, consultor&iacute;as |
| `admin-calendar` | AdminCalendarPanel | Gesti&oacute;n de disponibilidad y citas |
| `admin-discounts` | AdminDiscountsPanel | C&oacute;digos de descuento CRUD |
| `admin-incomplete` | AdminIncompletePanel | Solicitudes abandonadas con seguimiento |

---

## API Endpoints

### Autenticaci&oacute;n y Registro

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| POST | `/api/auth/check-email` | Verificar si email existe (rate limited) |
| POST | `/api/register/send-otp` | Enviar OTP de registro por email |
| POST | `/api/register/verify-otp` | Verificar OTP de registro |
| POST | `/api/password-reset/send-otp` | Enviar OTP recuperaci&oacute;n contrase&ntilde;a |
| POST | `/api/password-reset/verify-name` | Verificar nombre para reset |
| POST | `/api/password-reset/confirm` | Confirmar nueva contrase&ntilde;a |
| POST | `/api/seed-admin` | Crear cuenta admin inicial |

### Consultor&iacute;as

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/consultations/settings` | Configuraci&oacute;n: horarios, d&iacute;as disponibles |
| GET | `/api/consultations/free-slots?date=` | Slots disponibles por fecha |
| GET | `/api/consultations/types` | Tipos de consultor&iacute;a (gratuita/pago) |
| GET | `/api/consultations/availability` | Disponibilidad general |
| GET | `/api/consultations/user-has-llc` | Verificar si usuario tiene LLC (auth) |
| GET | `/api/consultations/my` | Mis consultor&iacute;as reservadas (auth) |
| POST | `/api/consultations/check-email` | Verificar email + estado LLC |
| POST | `/api/consultations/book-free` | Reservar consultor&iacute;a gratuita (p&uacute;blico) |
| POST | `/api/consultations/book` | Reservar consultor&iacute;a (autenticado) |
| POST | `/api/consultations/:id/cancel` | Cancelar consultor&iacute;a (auth) |

### Usuario (Autenticado)

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/user/profile` | Obtener perfil de usuario |
| PUT | `/api/user/profile` | Actualizar perfil (con OTP para email) |
| POST | `/api/user/profile/confirm-otp` | Confirmar cambio de email |
| POST | `/api/user/profile/resend-otp` | Reenviar OTP de cambio |
| POST | `/api/user/profile/cancel-pending` | Cancelar cambio pendiente |
| POST | `/api/user/change-password` | Cambiar contrase&ntilde;a |
| POST | `/api/user/request-password-otp` | OTP para cambio contrase&ntilde;a |
| POST | `/api/user/send-verification-otp` | OTP verificaci&oacute;n email |
| POST | `/api/user/verify-email` | Verificar email |
| PUT | `/api/user/language` | Cambiar idioma preferido |
| GET | `/api/user/account` | Estado de cuenta |
| GET | `/api/user/data-export` | Exportar datos (GDPR) |
| GET | `/api/user/completed-llcs` | LLCs completadas |
| GET | `/api/user/deadlines` | Fechas l&iacute;mite compliance |

### Documentos de Usuario

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/user/documents` | Listar documentos |
| POST | `/api/user/documents/upload` | Subir documento |
| GET | `/api/user/documents/:id/download` | Descargar documento |
| DELETE | `/api/user/documents/:id` | Eliminar documento |
| GET | `/api/user/document-requests` | Solicitudes de documentos pendientes |
| POST | `/api/user/document-requests/:requestId/upload` | Subir documento solicitado |
| POST | `/api/user/identity-verification/upload` | Subir verificaci&oacute;n de identidad |

### &Oacute;rdenes y Pagos

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/orders/:id` | Detalle de orden |
| GET | `/api/orders/:id/events` | Eventos/historial de la orden |
| GET | `/api/orders/:id/invoice` | Factura de la orden |
| GET | `/api/user/invoices` | Listar facturas |
| GET | `/api/user/invoices/:id/download` | Descargar factura PDF |
| GET | `/api/products` | Cat&aacute;logo de productos/servicios |
| GET | `/api/payment-accounts/active` | Cuentas de pago activas |
| POST | `/api/discount-codes/validate` | Validar c&oacute;digo de descuento |

### LLC y Mantenimiento

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| POST | `/api/llc/claim-order` | Solicitar formaci&oacute;n LLC (wizard) |
| GET | `/api/llc/:id/data` | Datos de la LLC |
| POST | `/api/llc/:id/pay` | Registrar pago de LLC |
| POST | `/api/maintenance/claim-order` | Solicitar mantenimiento anual |
| GET | `/api/maintenance/orders` | &Oacute;rdenes de mantenimiento |
| GET | `/api/maintenance/:id` | Detalle de mantenimiento |

### Mensajes y Notificaciones

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/messages` | Listar mensajes |
| POST | `/api/messages` | Enviar mensaje |
| GET | `/api/messages/:id/replies` | Respuestas de un mensaje |
| POST | `/api/messages/:id/reply` | Responder mensaje |
| GET | `/api/user/notifications` | Listar notificaciones |
| PUT | `/api/user/notifications/:id/read` | Marcar como le&iacute;da |
| DELETE | `/api/user/notifications/:id` | Eliminar notificaci&oacute;n |

### Notificaciones Push

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/push/vapid-key` | Obtener clave VAPID p&uacute;blica |
| POST | `/api/push/subscribe` | Suscribir a push |
| POST | `/api/push/unsubscribe` | Desuscribir de push |

### Newsletter

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/newsletter/status` | Estado de suscripci&oacute;n |
| POST | `/api/newsletter/subscribe` | Suscribirse |
| POST | `/api/newsletter/unsubscribe` | Desuscribirse |

### Contacto

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| POST | `/api/contact/send-otp` | Enviar OTP para formulario contacto |
| POST | `/api/contact/verify-otp` | Verificar OTP y enviar mensaje |
| POST | `/api/calculator/consultation` | Enviar resultados calculadora |

### Tracking

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| POST | `/api/guest/track` | Tracking de visitantes an&oacute;nimos |

### Admin - Usuarios

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/admin/users` | Listar usuarios (paginado) |
| POST | `/api/admin/users/create` | Crear usuario |
| GET | `/api/admin/users/:id` | Detalle usuario |
| PUT | `/api/admin/users/:id` | Actualizar usuario |
| POST | `/api/admin/users/:id/deactivate` | Desactivar cuenta |
| POST | `/api/admin/users/:id/reactivate` | Reactivar cuenta |
| POST | `/api/admin/users/:id/reset-password` | Resetear contrase&ntilde;a |
| POST | `/api/admin/users/:userId/request-identity-verification` | Solicitar verificaci&oacute;n identidad |
| POST | `/api/admin/users/:userId/approve-identity-verification` | Aprobar identidad |
| POST | `/api/admin/users/:userId/reject-identity-verification` | Rechazar identidad |
| GET | `/api/admin/users/:userId/identity-document` | Ver documento identidad |
| POST | `/api/admin/users/:userId/assign-role` | Asignar rol |
| GET | `/api/admin/users/:id/documents/download` | Descargar docs usuario |
| GET | `/api/admin/staff-users` | Listar staff |

### Admin - &Oacute;rdenes

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/admin/orders` | Listar &oacute;rdenes (paginado, filtros) |
| POST | `/api/admin/orders/create` | Crear orden LLC |
| POST | `/api/admin/orders/create-custom` | Crear orden personalizada |
| POST | `/api/admin/orders/create-maintenance` | Crear orden mantenimiento |
| GET | `/api/admin/orders/:id` | Detalle orden |
| PUT | `/api/admin/orders/:id` | Actualizar orden |
| DELETE | `/api/admin/orders/:id` | Eliminar orden (con cascada) |
| PUT | `/api/admin/orders/:id/status` | Cambiar estado (m&aacute;quina de estados) |
| PUT | `/api/admin/orders/:id/inline` | Edici&oacute;n inline r&aacute;pida |
| POST | `/api/admin/orders/:id/payment-link` | Enviar enlace de pago |
| POST | `/api/admin/orders/:id/generate-invoice` | Generar factura |
| GET | `/api/admin/orders/:id/events` | Eventos de la orden |

### Admin - Documentos

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/admin/documents` | Listar todos los documentos |
| POST | `/api/admin/documents/upload` | Subir documento admin |
| PUT | `/api/admin/documents/:id/review` | Aprobar/rechazar documento |
| DELETE | `/api/admin/documents/:id` | Eliminar documento |
| POST | `/api/admin/request-document` | Solicitar documento a cliente |
| GET | `/api/admin/document-requests` | Listar solicitudes activas |
| PUT | `/api/admin/document-requests/:id` | Actualizar solicitud |

### Admin - Facturaci&oacute;n y Contabilidad

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/admin/invoices` | Listar facturas |
| POST | `/api/admin/invoices/create` | Crear factura |
| GET | `/api/admin/invoices/:id` | Detalle factura |
| PUT | `/api/admin/invoices/:id` | Actualizar factura |
| DELETE | `/api/admin/invoices/:id` | Eliminar factura |
| PUT | `/api/admin/invoices/:id/status` | Cambiar estado factura |
| GET | `/api/admin/invoices/:id/download` | Descargar PDF |
| GET | `/api/admin/payment-accounts` | Cuentas de pago |
| POST | `/api/admin/payment-accounts` | Crear cuenta de pago |
| PUT | `/api/admin/payment-accounts/:id` | Actualizar cuenta |
| POST | `/api/admin/send-payment-link` | Enviar enlace de pago |
| GET | `/api/admin/accounting/summary` | Resumen contable |
| GET | `/api/admin/accounting/transactions` | Transacciones |
| POST | `/api/admin/accounting/transactions` | Crear transacci&oacute;n |
| DELETE | `/api/admin/accounting/transactions/:id` | Eliminar transacci&oacute;n |
| GET | `/api/admin/accounting/export-csv` | Exportar CSV contable |

### Admin - Comunicaciones

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/admin/messages` | Listar mensajes (paginado) |
| PUT | `/api/admin/messages/:id` | Responder/actualizar mensaje |
| PUT | `/api/admin/messages/:id/archive` | Archivar mensaje |
| DELETE | `/api/admin/messages/:id` | Eliminar mensaje |
| POST | `/api/admin/send-note` | Enviar nota a cliente |
| GET | `/api/admin/newsletter` | Listar suscriptores newsletter |
| POST | `/api/admin/newsletter/broadcast` | Enviar broadcast |
| DELETE | `/api/admin/newsletter/:id` | Eliminar suscriptor |

### Admin - Consultor&iacute;as

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/admin/consultations/stats` | Estad&iacute;sticas de consultor&iacute;as |
| GET | `/api/admin/consultations/bookings` | Listar reservas |
| PUT | `/api/admin/consultations/bookings/:id` | Actualizar reserva |
| DELETE | `/api/admin/consultations/bookings/:id` | Eliminar reserva |
| PUT | `/api/admin/consultations/bookings/:id/reschedule` | Reprogramar |
| GET | `/api/admin/consultations/availability` | Disponibilidad |
| POST | `/api/admin/consultations/availability` | Crear slot |
| DELETE | `/api/admin/consultations/availability/:id` | Eliminar slot |
| GET | `/api/admin/consultations/blocked-dates` | Fechas bloqueadas |
| POST | `/api/admin/consultations/blocked-dates` | Bloquear fecha |
| DELETE | `/api/admin/consultations/blocked-dates/:id` | Desbloquear fecha |
| GET | `/api/admin/consultations/types` | Tipos de consultor&iacute;a |
| POST | `/api/admin/consultations/types` | Crear tipo |
| PUT | `/api/admin/consultations/types/:id` | Actualizar tipo |
| PUT | `/api/admin/consultations/settings` | Actualizar configuraci&oacute;n |

### Admin - M&eacute;tricas y Sistema

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/admin/stats` | Estad&iacute;sticas generales |
| GET | `/api/admin/system-stats` | Estado del sistema |
| GET | `/api/admin/api-metrics` | M&eacute;tricas de API |
| GET | `/api/admin/metrics/funnel` | M&eacute;tricas de embudo |
| GET | `/api/admin/metrics/monthly` | M&eacute;tricas mensuales |
| GET | `/api/admin/metrics/lifecycle` | Ciclo de vida del cliente |
| GET | `/api/admin/audit-logs` | Logs de auditor&iacute;a |
| GET | `/api/admin/guests` | Visitantes rastreados |
| GET | `/api/admin/guests/stats` | Estad&iacute;sticas de visitantes |
| GET | `/api/admin/guests/email/:email` | Buscar visitante por email |
| PUT | `/api/admin/guests/:id` | Actualizar visitante |
| DELETE | `/api/admin/guests/:id` | Eliminar visitante |

### Admin - Otros

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/api/admin/roles` | Listar roles |
| POST | `/api/admin/roles` | Crear rol |
| PUT | `/api/admin/roles/:id` | Actualizar rol |
| DELETE | `/api/admin/roles/:id` | Eliminar rol |
| GET | `/api/admin/roles/permissions` | Permisos disponibles |
| GET | `/api/admin/discount-codes` | C&oacute;digos de descuento |
| POST | `/api/admin/discount-codes` | Crear c&oacute;digo descuento |
| PUT | `/api/admin/discount-codes/:id` | Actualizar c&oacute;digo |
| DELETE | `/api/admin/discount-codes/:id` | Eliminar c&oacute;digo |
| GET | `/api/admin/renewals` | Renovaciones pendientes |
| GET | `/api/admin/renewals/expired` | Renovaciones vencidas |
| GET | `/api/admin/incomplete-applications` | Solicitudes incompletas |
| DELETE | `/api/admin/incomplete-applications/:type/:id` | Eliminar incompleta |
| GET | `/api/admin/calculator-consultations` | Consultas calculadora |
| PUT | `/api/admin/calculator-consultations/:id/read` | Marcar le&iacute;da |
| DELETE | `/api/admin/calculator-consultations/:id` | Eliminar consulta |
| GET | `/api/admin/calculator-consultations/unread-count` | Conteo no le&iacute;das |
| PUT | `/api/admin/llc/:appId/dates` | Actualizar fechas LLC |
| PUT | `/api/admin/llc/:appId/tax-extension` | Extensi&oacute;n fiscal |
| PUT | `/api/admin/applications/:id/set-formation-date` | Fecha de formaci&oacute;n |

### SEO y Archivos Est&aacute;ticos

| M&eacute;todo | Endpoint | Descripci&oacute;n |
|---|---|---|
| GET | `/sitemap.xml` | Sitemap din&aacute;mico generado |
| GET | `/robots.txt` | Directivas para crawlers |
| GET | `/_health` | Health check (incluye estado DB) |
| GET | `/uploads/*` | Archivos est&aacute;ticos subidos |

---

## Sistema de Emails (46 Plantillas)

Todas las plantillas son HTML responsivas con soporte completo para los 7 idiomas. Se env&iacute;an a trav&eacute;s de Gmail API con cola de procesamiento.

### Plantillas de Autenticaci&oacute;n y Cuenta
| Funci&oacute;n | Descripci&oacute;n |
|---|---|
| `getOtpEmailTemplate` | C&oacute;digo OTP de verificaci&oacute;n |
| `getWelcomeEmailTemplate` | Bienvenida a nuevo usuario |
| `getAccountPendingVerificationTemplate` | Cuenta pendiente de verificaci&oacute;n |
| `getAccountUnderReviewTemplate` | Cuenta en revisi&oacute;n |
| `getAccountVipTemplate` | Cuenta VIP activada |
| `getAccountReactivatedTemplate` | Cuenta reactivada |
| `getAccountDeactivatedTemplate` | Cuenta desactivada por admin |
| `getAccountDeactivatedByUserTemplate` | Cuenta desactivada por usuario |
| `getAccountLockedTemplate` | Cuenta bloqueada |
| `getRegistrationOtpTemplate` | OTP de registro |
| `getPasswordChangeOtpTemplate` | OTP cambio de contrase&ntilde;a |
| `getProfileChangeOtpTemplate` | OTP cambio de perfil |
| `getAdminPasswordResetTemplate` | Reset de contrase&ntilde;a admin |
| `getAdminOtpRequestTemplate` | OTP solicitado por admin |

### Plantillas de &Oacute;rdenes y Servicios
| Funci&oacute;n | Descripci&oacute;n |
|---|---|
| `getConfirmationEmailTemplate` | Confirmaci&oacute;n de solicitud |
| `getOrderUpdateTemplate` | Actualizaci&oacute;n de estado de orden |
| `getOrderCompletedTemplate` | Orden completada |
| `getOrderEventTemplate` | Evento en la orden |
| `getPaymentRequestTemplate` | Solicitud de pago con enlace |

### Plantillas de Documentos
| Funci&oacute;n | Descripci&oacute;n |
|---|---|
| `getDocumentRequestTemplate` | Solicitud de documento al cliente |
| `getDocumentUploadedTemplate` | Documento subido (notificaci&oacute;n admin) |
| `getDocumentApprovedTemplate` | Documento aprobado |
| `getDocumentRejectedTemplate` | Documento rechazado con motivo |
| `getOperatingAgreementReadyTemplate` | Operating Agreement listo |

### Plantillas de Verificaci&oacute;n de Identidad
| Funci&oacute;n | Descripci&oacute;n |
|---|---|
| `getIdentityVerificationRequestTemplate` | Solicitud de verificaci&oacute;n |
| `getIdentityVerificationApprovedTemplate` | Identidad aprobada |
| `getIdentityVerificationRejectedTemplate` | Identidad rechazada |

### Plantillas de Comunicaci&oacute;n
| Funci&oacute;n | Descripci&oacute;n |
|---|---|
| `getAutoReplyTemplate` | Auto-respuesta con ticket ID |
| `getNoteReceivedTemplate` | Nota recibida del admin |
| `getAdminNoteTemplate` | Nota administrativa |
| `getMessageReplyTemplate` | Respuesta a mensaje |

### Plantillas de Consultor&iacute;as
| Funci&oacute;n | Descripci&oacute;n |
|---|---|
| `getConsultationConfirmationTemplate` | Confirmaci&oacute;n de reserva con Meet link |
| `getConsultationReminderTemplate` | Recordatorio de consultor&iacute;a |

### Plantillas de Newsletter y Marketing
| Funci&oacute;n | Descripci&oacute;n |
|---|---|
| `getNewsletterWelcomeTemplate` | Bienvenida a newsletter |
| `getNewsletterBroadcastTemplate` | Broadcast a suscriptores |
| `getRenewalReminderTemplate` | Recordatorio de renovaci&oacute;n |

### Plantillas Admin (internas)
| Funci&oacute;n | Descripci&oacute;n |
|---|---|
| `getAdminNewRegistrationTemplate` | Nuevo registro (notificaci&oacute;n admin) |
| `getAdminLLCOrderTemplate` | Nueva orden LLC (notificaci&oacute;n admin) |
| `getAdminMaintenanceOrderTemplate` | Nueva orden mantenimiento (notificaci&oacute;n admin) |
| `getAdminProfileChangesTemplate` | Cambios de perfil (notificaci&oacute;n admin) |
| `getCalculatorResultsTemplate` | Resultados calculadora (notificaci&oacute;n admin) |

### Dise&ntilde;o de Emails
- **Header**: Fondo verde suave (#F0FAF5) con logo Exentax
- **Body**: HTML responsivo con estilos inline completos
- **Footer**: "Exentax Holdings LLC" con enlace a sitio web
- **Branding**: Consistente en todas las plantillas
- **Cola**: Sistema de cola con procesamiento cada 2 segundos, adjunta logo autom&aacute;ticamente
- **Env&iacute;o**: Gmail API v&iacute;a Replit google-mail connector
- **Remitente**: no-reply@exentax.com

---

## Sistema de Consultor&iacute;as

### Configuraci&oacute;n
- **Duraci&oacute;n**: 30 minutos por sesi&oacute;n
- **Horario**: 9:00 - 20:00 (hora de Madrid)
- **D&iacute;as**: Todos los d&iacute;as incluyendo fines de semana
- **Ventana**: 4 d&iacute;as pr&oacute;ximos disponibles
- **Slots**: 21 slots por d&iacute;a (147 slots semanales)

### Tipos de Consultor&iacute;a
| Tipo | Duraci&oacute;n | Precio | Acceso |
|---|---|---|---|
| Gratuita | 30 min | 0&euro; | Solo usuarios sin cuenta |
| De pago | 30 min | 120&euro; | Usuarios con LLC desde dashboard |

### Flujo de Reserva P&uacute;blica (5 pasos)
1. **Datos personales**: Nombre, email, tel&eacute;fono, pa&iacute;s
   - Detecci&oacute;n autom&aacute;tica de email registrado
   - Si tiene cuenta &rarr; redirige a login
   - Si tiene LLC &rarr; redirige a login (consulta de pago)
2. **Fecha y hora**: Calendario con disponibilidad en tiempo real
3. **Tema principal**: Selecci&oacute;n de tema de consulta
4. **Informaci&oacute;n adicional**: Negocio existente, actividad, ingresos
5. **Confirmaci&oacute;n**: Consentimiento RGPD y env&iacute;o

### Integraciones
- **Google Calendar**: Creaci&oacute;n autom&aacute;tica de evento
- **Google Meet**: Link de videollamada autom&aacute;tico
- **Emails organizaci&oacute;n**: arnau@exentax.com y hola@exentax.com a&ntilde;adidos como asistentes
- **Recordatorios**: Emails autom&aacute;ticos previos a la consulta

---

## Flujos de Redirecci&oacute;n

### Registro y Autenticaci&oacute;n
```
Nuevo usuario              &rarr; /auth/register &rarr; OTP email &rarr; Verificaci&oacute;n &rarr; /dashboard
Usuario existente          &rarr; /auth/login &rarr; Email/Password o Google &rarr; /dashboard
Contrase&ntilde;a olvidada        &rarr; /auth/forgot-password &rarr; OTP &rarr; Verificar nombre &rarr; Nueva contrase&ntilde;a
Cuenta desactivada         &rarr; Mensaje de cuenta desactivada
Cuenta pendiente           &rarr; /dashboard (acceso limitado)
```

### Formaci&oacute;n LLC
```
/llc/formation             &rarr; Wizard multi-paso &rarr; Check email
  Si email existe          &rarr; Login inline &rarr; Continuar con cuenta
  Si email nuevo           &rarr; OTP verificaci&oacute;n &rarr; Crear cuenta &rarr; Orden creada
  Orden creada             &rarr; Email confirmaci&oacute;n + Admin notificado &rarr; /dashboard
```

### Consultor&iacute;a Gratuita
```
/agendar-consultoria       &rarr; Step 1: Datos personales
  Email registrado         &rarr; Mensaje + Redirige a /auth/login (2.5s)
  Email con LLC            &rarr; Mensaje LLC + Redirige a /auth/login (2.5s)
  Email nuevo              &rarr; Continuar reserva gratuita &rarr; Google Meet + Email confirmaci&oacute;n
```

### Consultor&iacute;a de Pago (Dashboard)
```
/dashboard?tab=consultations &rarr; Tipos filtrados por LLC status
  Sin LLC                  &rarr; Ver gratuita + de pago
  Con LLC                  &rarr; Solo de pago &rarr; Reservar &rarr; Meet + Email
```

### Mantenimiento Anual
```
/llc/maintenance           &rarr; Wizard mantenimiento
  Opci&oacute;n "Disolver LLC"   &rarr; Info card &rarr; Redirige a /dashboard?tab=consultations
  Otras opciones           &rarr; Continuar solicitud &rarr; Orden creada
```

---

## Seguridad

### Encriptaci&oacute;n y Datos
- **AES-256-GCM** para datos sensibles (EIN, SSN)
- **bcrypt** para hash de contrase&ntilde;as
- **Sesiones seguras**: httpOnly, secure, sameSite=strict

### Rate Limiting
| Endpoint/Acci&oacute;n | L&iacute;mite |
|---|---|
| Login | Configurado por IP |
| Registro OTP | Configurado por IP |
| Password reset OTP | Configurado por IP |
| Contacto OTP | Configurado por IP |
| Consultor&iacute;a booking | Configurado por IP |
| General API | Configurado por IP |

### Protecci&oacute;n CSRF
- Token CSRF en todas las rutas con estado
- Auto-refresh en respuestas 403
- Matching estricto de tokens

### Headers de Seguridad
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### Validaci&oacute;n
- **Zod** en todas las rutas de entrada
- **DOMPurify** para sanitizaci&oacute;n de inputs
- Validaci&oacute;n de transiciones de estado (m&aacute;quina de estados)
- Verificaci&oacute;n de existencia antes de updates en storage

### Audit Logging
- Subida/descarga de documentos
- Creaci&oacute;n/eliminaci&oacute;n de facturas
- Cambios de estado de &oacute;rdenes
- Eliminaci&oacute;n de &oacute;rdenes
- Revisi&oacute;n de documentos
- Cambios de perfil cr&iacute;ticos

---

## SEO

### Implementaciones
- **Sitemap din&aacute;mico**: `/sitemap.xml` generado con todas las rutas p&uacute;blicas
- **robots.txt**: Directivas para crawlers con enlace a sitemap
- **Meta tags OG**: Open Graph din&aacute;micos por p&aacute;gina (`og:title`, `og:description`)
- **T&iacute;tulos i18n**: T&iacute;tulos de p&aacute;gina traducidos autom&aacute;ticamente
- **hreflang**: Atributos de idioma alternativo
- **JSON-LD**: Datos estructurados para motores de b&uacute;squeda
- **Cache-Control**: `no-cache` en HTML para evitar cach&eacute; heur&iacute;stico

---

## Internacionalizaci&oacute;n (i18n)

### Idiomas Soportados
| C&oacute;digo | Idioma | Locale |
|---|---|---|
| `es` | Espa&ntilde;ol | es-ES |
| `en` | Ingl&eacute;s | en-GB |
| `ca` | Catal&aacute;n | ca-ES |
| `fr` | Franc&eacute;s | fr-FR |
| `de` | Alem&aacute;n | de-DE |
| `it` | Italiano | it-IT |
| `pt` | Portugu&eacute;s | pt-PT |

### Cobertura
- **Frontend**: 3,215+ claves de traducci&oacute;n, 100% paridad entre idiomas
- **Emails**: Todas las 46 plantillas traducidas
- **PDFs**: Facturas y documentos generados en el idioma del usuario
- **Fechas**: Formateadas seg&uacute;n locale del usuario
- **Validaciones**: Mensajes de error traducidos

---

## Tareas Programadas

| Tarea | Intervalo | Descripci&oacute;n |
|---|---|---|
| Backups de datos | Cada 12 horas | Backup completo de tablas cr&iacute;ticas |
| Recordatorios de consultor&iacute;a | Cada 10 minutos | Email recordatorio antes de la cita |
| Solicitudes abandonadas | Cada hora | Recordatorio de solicitudes incompletas |
| Limpieza rate limits | Cada 5 minutos | Limpiar entradas expiradas en memoria |
| Limpieza tokens | Peri&oacute;dica | Limpiar tokens expirados |
| Cola de emails | Cada 2 segundos | Procesar emails pendientes |
| Task watchdog | Continuo | Monitorizar y reiniciar tareas ca&iacute;das |

---

## Base de Datos

### Tablas (29 tablas PostgreSQL)
- `users` - Usuarios y perfiles
- `sessions` - Sesiones de autenticaci&oacute;n
- `llcApplications` - Solicitudes de formaci&oacute;n LLC
- `maintenanceApplications` - Solicitudes de mantenimiento
- `orders` - &Oacute;rdenes de servicio
- `orderEvents` - Historial de eventos por orden
- `invoices` - Facturas generadas
- `products` - Cat&aacute;logo de productos/servicios
- `paymentAccounts` - Cuentas bancarias para pagos
- `documents` - Documentos subidos
- `documentRequests` - Solicitudes de documentos a clientes
- `operatingAgreements` - Acuerdos operativos generados
- `messages` - Mensajes internos
- `messageReplies` - Respuestas a mensajes
- `notifications` - Notificaciones del usuario
- `consultationTypes` - Tipos de consultor&iacute;a
- `consultationAvailability` - Slots de disponibilidad
- `consultationBookings` - Reservas de consultor&iacute;as
- `consultationBlockedDates` - Fechas bloqueadas
- `consultationSettings` - Configuraci&oacute;n de consultor&iacute;as
- `discountCodes` - C&oacute;digos de descuento
- `newsletterSubscribers` - Suscriptores newsletter
- `contactOtps` - OTPs de contacto
- `pushSubscriptions` - Suscripciones push
- `rateLimitEntries` - Rate limiting (PostgreSQL)
- `accountingTransactions` - Transacciones contables
- `auditLogs` - Logs de auditor&iacute;a
- `guests` - Visitantes rastreados
- `roles` - Roles personalizados

### &Iacute;ndices
- 107 &iacute;ndices para rendimiento &oacute;ptimo
- 28 restricciones de clave for&aacute;nea
- Cero registros hu&eacute;rfanos verificados

---

## GDPR Compliance

- **Exportaci&oacute;n de datos**: `/api/user/data-export` genera JSON completo
- **Desactivaci&oacute;n de cuenta**: Auto-servicio desde perfil del usuario
- **Eliminaci&oacute;n completa**: Solo disponible para administradores
- **Consentimiento**: Checkbox obligatorio en todos los formularios p&uacute;blicos
- **Newsletter**: Suscripci&oacute;n/desuscripci&oacute;n f&aacute;cil

---

## Self-Healing y Estabilidad

### Frontend
- **QueryClient**: Auto-retry 3x queries, 2x mutations con backoff exponencial
- **Skip retry**: En errores 401, 403, 404 (no recuperables)
- **CSRF auto-refresh**: Renueva token autom&aacute;ticamente en 403
- **PanelErrorBoundary**: Auto-retry 3x con delay 5s, cooldown reset 30s
- **Toast global**: Notificaci&oacute;n de errores de red al usuario

### Backend
- **503 + Retry-After**: En errores de base de datos
- **Health check**: `/_health` incluye estado de DB
- **ZodError &rarr; 400**: Con detalles de validaci&oacute;n
- **DB errors &rarr; 503**: Sin leak de stack traces
- **Task watchdog**: Reinicio autom&aacute;tico de tareas programadas ca&iacute;das
- **Email queue**: Reintentos autom&aacute;ticos en fallos de env&iacute;o

---

## Configuraci&oacute;n

### Variables de Entorno Clave
| Variable | Descripci&oacute;n |
|---|---|
| `DATABASE_URL` | URL de conexi&oacute;n PostgreSQL |
| `SESSION_SECRET` | Secreto para sesiones |
| `ENCRYPTION_KEY` | Clave AES-256-GCM |
| `ADMIN_EMAIL` | Email del administrador principal |
| `GOOGLE_CLIENT_ID` | ID de cliente Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Secreto de cliente Google |
| `VAPID_PUBLIC_KEY` | Clave p&uacute;blica VAPID (push) |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID (push) |

### Configuraci&oacute;n Centralizada
- **Admin email**: `server/lib/config.ts` (`ADMIN_EMAIL` env var, fallback: afortuny07@gmail.com)
- **Org emails**: `server/lib/config.ts` (`ORG_EMAILS`: arnau@exentax.com, hola@exentax.com)
- **Tel&eacute;fono contacto**: `client/src/lib/constants.ts` (`CONTACT_PHONE`)
- **Email contacto**: hola@exentax.com
- **Email env&iacute;o**: no-reply@exentax.com

---

## Comandos

```bash
npm run dev          # Iniciar en modo desarrollo (Express + Vite)
npm run build        # Build de producci&oacute;n
npm run db:push      # Sincronizar esquema de base de datos
npm run check        # Verificaci&oacute;n TypeScript
```

---

## Reglas de Desarrollo

- Solo el usuario **afortuny07@gmail.com** puede asignar privilegios de administrador
- Las cuentas admin est&aacute;n siempre verificadas autom&aacute;ticamente
- No se realizan cambios significativos sin autorizaci&oacute;n previa
- Idioma principal: Espa&ntilde;ol (con soporte completo 7 idiomas)
- No se exponen secretos ni claves en logs ni respuestas
- Todas las rutas validan entrada con Zod
- Los emails usan plantillas HTML con estilos inline (no CSS externo)
- Los PDFs se generan con max 1 p&aacute;gina para facturas admin

---

&copy; Exentax Holdings LLC 2026
