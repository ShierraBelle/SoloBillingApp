# Solo Billing - Meeting Time Tracker

## Overview
Solo Billing is a full-stack web application designed to manually track meeting time, generate invoices, and monitor payment status. It provides a comprehensive solution for professionals to manage billable meeting time, create invoices, and track client payments. The project aims to streamline billing processes, provide clear financial oversight, and improve efficiency for freelancers and small businesses.

## User Preferences
Preferred communication style: Simple, everyday language.
Currency: Philippine Pesos (₱)
Meeting tracking method: Manual time stamps only
Billing rate structure: 30-minute rate for calls 1-30 minutes, full hour rate for calls 31-60 minutes
Meeting duration options: Only 30 minutes and 1 hour options
Billing cut-off periods: 1st-15th and 16th-end of month (handles February correctly)
Profile management: Converted Settings to Profile page for personal information
Security: Password-based authentication with login system (custom credentials)

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library, themed with distinct color schemes for different sections (e.g., Notifications: Orange/Blue/Green, Reports: Purple/Indigo, Invoices: Emerald/Teal, Calendar: Rose/Amber).
- **Styling**: Tailwind CSS with CSS variables
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **API Design**: RESTful API with structured error handling

### Database Architecture
- **ORM**: Drizzle ORM for type-safe queries and schema management.
- **Schema**: Shared schema definitions between client and server for consistency.

### Key Features
- **Authentication System**: Password-based login with session management protecting all API endpoints and UI routes.
- **Client Management**: Create, update, and manage client information, including hourly rates and billing preferences. Features Active/Archived client tabs for better organization - archived clients preserve all historical data while being hidden from new meeting scheduling.
- **Meeting Tracking**: Record and track meeting sessions with "Booked" (billable) and "Cancelled" (non-billable) statuses. New meetings default to "Booked".
- **Billing System**: Tiered billing calculation based on meeting duration with bi-monthly cut-off periods.
- **Invoice Generation**: Create invoices from completed "Booked" meetings with PDF export and KakaoTalk sharing functionality. Includes validation to prevent duplicate invoices for the same client and billing period. Invoice status includes "Draft" and "Sent".
- **Payment Tracking**: Monitor payment status with "Paid", "Pending", and "Overdue" options.
- **Calendar View**: Visual calendar interface to track and manage client meetings by date, with an ultra-compact weekly calendar view.
- **Billing Reports**: Comprehensive billing period reports showing revenue from "Booked" meetings.
- **Profile Management**: User profile page for personal and contact information.
- **Dashboard**: Provides an overview of meetings, revenue, and payment metrics, including year-to-date monthly earnings chart, KPI metrics, and financial insights with clear distinction between actual earnings and projected income.
- **Automated Billing Cut-off Reminders**: System generates notifications for upcoming billing cut-offs and identifies clients ready for invoicing.
- **Business Analytics**: Comprehensive client ranking, revenue concentration analysis, and average meeting duration calculations.
- **Financial Clarity**: Clear distinction between "Earnings" (revenue from paid invoices only) and "Projected Income" (potential revenue from booked meetings) for accurate cash flow analysis and business planning.
- **Revenue-Focused Analytics**: "Active Clients" redefined as "Revenue Clients" - only counting clients with booked (billable) meetings for more accurate business intelligence and performance tracking.
- **Client Archival System**: Active/Archived client tabs with archive and restore functionality. Archived clients maintain all historical data (meetings, invoices, payments) while being excluded from new meeting scheduling and active reporting.

### API Endpoints
- `/api/auth/login`: User authentication login.
- `/api/auth/logout`: User session logout.
- `/api/auth/me`: Get current authenticated user.
- `/api/clients`: Client CRUD operations with archive/restore functionality (protected).
- `/api/clients/:id/archive`: Archive client endpoint (protected).
- `/api/clients/:id/restore`: Restore archived client endpoint (protected).
- `/api/meetings`: Meeting management and tracking (protected).
- `/api/invoices`: Invoice generation and management (protected).
- `/api/settings`: Application settings (protected).
- `/api/dashboard/stats`: Dashboard statistics (protected).
- `/api/notifications`: Notification management (protected).

### User Interface Pages
- **Login Page**: Secure authentication with custom credentials.
- **Dashboard**: Main overview with statistics and business insights (protected).
- **Active Meetings**: List and manage meeting sessions (protected).
- **Clients**: Client management and billing configuration (protected).
- **Invoices**: Invoice generation and payment tracking (protected).
- **Calendar**: Visual calendar view for meeting scheduling and tracking (protected).
- **Reports**: Analytics and performance metrics, including "Billing Reports" and "Business Analytics" sub-tabs (protected).
- **Profile**: User profile and company information management (protected).
- **Notifications**: System notifications and billing reminders (protected).

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI component set with shadcn/ui.
- **Form Handling**: React Hook Form with Zod validation.
- **Date Management**: date-fns.
- **State Management**: TanStack Query.

### Backend Dependencies
- **Database**: Neon Database (serverless PostgreSQL).
- **ORM**: Drizzle ORM.
- **Session Management**: connect-pg-simple for PostgreSQL session storage.
- **Validation**: Drizzle-Zod for schema validation.