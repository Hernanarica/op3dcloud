# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is OrthoPlannerCloud - a full-stack web application for orthodontic treatment planning and client management. The project consists of:

- **Frontend**: React + TypeScript + Vite SPA with TailwindCSS and Radix UI components
- **Backend**: Supabase (PostgreSQL database with Row Level Security, Authentication, Real-time subscriptions)
- **Database Schema**: Custom `op3dcloud` schema with clients, patients, users, and role-based access control

## Development Commands

### Frontend (from the repo root — el frontend vive en `src/`, no hay carpeta `frontend/`)
```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Linting and formatting (uses Biome)
pnpm lint      # Lint and auto-fix
pnpm format    # Format code
pnpm check     # Combined lint + format
```

### Supabase (from project root)
```bash
# Start local Supabase development environment
supabase start

# Stop local environment
supabase stop

# Reset database (applies migrations and seeds)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local --schema op3dcloud > src/types/db/database.types.ts
pnpm check  # biome reindenta el archivo generado a tabs

# Create new migration
supabase migration new <migration_name>

# Push to remote (production)
supabase db push
```

## Architecture

### Frontend Structure
- **Pages**: Route-based page components in `src/pages/`
  - `clients/` - Client management (main dashboard with treatment planning)
  - `patient/` - Patient management and creation
  - `planners/` - Planner management view
  - `welcome/` - Welcome/onboarding flow for new users
  - `sign-in/`, `register/` - Authentication pages
  - `home/`, `accesses/`, `privacy/`, `terms/` - Static/informational pages
- **Components**: Reusable UI components in `src/components/`
  - `ui/` - Base Radix UI components with custom styling
- **Services**: API layer in `src/services/supabase/`
  - Each service handles specific domain operations (clients, patients, users, auth, treatment-planning, planners, dashboard-admin)
- **Hooks**: Custom React hooks in `src/hooks/`
  - `useUserRole` - Simplified role access from user state
  - `useWelcomeCheck` - Onboarding flow management
  - `useSignOut` - Sign out functionality
- **State Management**: Zustand stores in `src/state/stores/`
  - `useUserStore` - User state with role management (persisted to localStorage)
  - `useThemeStore` - Theme preferences
  - `useModalStore` - Modal state management
  - `useDashboardAdminStore` - Admin dashboard state
- **Router**: React Router v7 with role-based route guards

### Database Architecture
- **Custom Schema**: `op3dcloud` (not `public`)
- **Role-Based Access**: Users have roles (client, planner) via `user_has_role` junction table
- **Views**: Simplified data access via `view_clients`, `view_planners`, `view_users`
  - `view_users` - Combines auth.users with role information for simplified user management
- **Tables**:
  - `clients`, `patients` - Core business entities
  - `treatment_planning` - Treatment plan data with complex fields (arrays for manufacturing, diagnostic considerations, etc.)
  - `users`, `roles`, `user_has_role` - User and role management
- **Functions**: Database functions for role assignment
- **RLS**: Row Level Security policies control data access

### Key Patterns
- **Authentication**: Supabase Auth with custom role management
  - User role stored in Zustand store and persisted to localStorage
  - Role fetched via `view_users` view combining auth.users with role data
  - Welcome flow for new users (tracked via user_metadata.has_seen_welcome)
- **Type Safety**: Auto-generated TypeScript types from Supabase schema
  - Custom type definitions in `src/types/db/` for specific domains (clients, patients, users/roles)
  - Unified `UserRole` type from `@/types/db/users/roles` used across the app
- **State Management**: Zustand for global state (user, theme, modals, dashboard)
  - User state persisted to localStorage for auth persistence
  - Role-based access controlled via `useUserRole` hook
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: TailwindCSS v4 with custom design system via Radix UI
- **Code Quality**: Biome for linting/formatting (tab indentation, 80 char width)
- **UI Components**:
  - Lucide React for icons
  - @tanstack/react-table for data tables
  - Sonner for toast notifications
  - @react-pdf/renderer for PDF generation

### Environment Variables
Frontend requires these environment variables in `.env`:
```
VITE_SUPABASE_PROJECT_URL=
VITE_SUPABASE_API_KEY=
VITE_SUPABASE_SERVICE_ROLE=
VITE_SUPABASE_SCHEMA=op3dcloud
```

## Important Notes

- **Schema**: Always work with `op3dcloud` schema, not `public`
- **Types**: Regenerate database types after schema changes using `supabase gen types typescript --local --schema op3dcloud > src/types/db/database.types.ts`
- **Migrations**: NUNCA escribir ni editar migraciones manualmente. Siempre usar `supabase db diff -f nombre_migracion` para generarlas automáticamente desde los schemas declarativos. El archivo generado por `db diff` no se toca para nada. Si el diff genera cambios no deseados, el problema está en los schemas declarativos — corregir los schemas y regenerar el diff
- **Aplicar / desplegar**: NUNCA aplicar migraciones ni hacer deploy de nada, ni siquiera en local. Está prohibido ejecutar `supabase db reset`, `supabase db push`, `supabase migration up`, `supabase start`/`supabase stop`, o cualquier comando que escriba en la base o en un entorno remoto. Escribir los schemas declarativos y generar la migración con `db diff` sí; aplicarla la decide y la ejecuta el usuario
- **RLS**: All database access is controlled by Row Level Security policies
- **Roles**: Users must have appropriate roles to access different parts of the application
  - Role-based routing implemented via route guards
  - Current roles: `client`, `planner`
  - User role fetched from `view_users` and stored in Zustand state
- **Component Library**: Use existing Radix UI components from `src/components/ui/` rather than creating new ones
- **Code Style**: Follow Biome configuration (tabs, double quotes, 80 char width)
- **React**: Using React 19.1.0 (latest version)
- **Package Manager**: Use `pnpm` for all package management operations

## Recent Features & Implementations

### Treatment Planning System
- **Treatment Planning Table**: Full CRUD operations for orthodontic treatment plans
- **Complex Data Structures**: Support for arrays (manufacturing, diagnostic considerations, clinical action criteria, referrals, sales potential)
- **Integration**: Treatment planning linked to patients via `planning_enabled` flag
- **Service Layer**: Dedicated `treatment-planning.service.ts` with typed operations

### User Role Management
- **Unified Role System**: Centralized `UserRole` type from `@/types/db/users/roles`
- **View-Based Role Fetching**: `view_users` combines auth.users with role data for efficient queries
- **Role Persistence**: User role stored in Zustand and persisted to localStorage
- **Role-Based Routing**: Route guards enforce role-based access control
- **Simplified Hook**: `useUserRole` provides direct access to user role from state

### User Onboarding
- **Welcome Flow**: New user welcome/onboarding experience
- **Welcome Tracking**: User metadata tracks `has_seen_welcome` status
- **Welcome Hook**: `useWelcomeCheck` manages onboarding flow state

## Testing and Quality

Run these commands before committing:
```bash
pnpm check  # Lint and format
pnpm build  # Ensure build succeeds
```

The project uses Biome for code quality with strict rules enabled. Always run linting before commits.