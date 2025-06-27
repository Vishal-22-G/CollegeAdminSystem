# Faculty Workload Management System

## Overview

This is a full-stack web application designed to manage faculty workload, timetables, and academic scheduling for educational institutions. The system provides comprehensive tools for tracking faculty assignments, managing course schedules, and importing/exporting data through Excel files.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API endpoints
- **Development**: Hot module replacement with Vite integration
- **Request Logging**: Custom middleware for API request/response logging

### Data Storage Solutions
- **Database**: PostgreSQL (configured but not yet implemented)
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL driver
- **Migrations**: Drizzle Kit for schema management
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`

## Key Components

### Database Schema
The system defines several core entities:
- **Users**: Authentication and user management
- **Faculty**: Staff information with position-based hour limits
- **Subjects**: Course definitions with credits and departments
- **Divisions**: Academic divisions/classes with semester info
- **Workload Assignments**: Links faculty to subjects and divisions
- **Timetable Slots**: Scheduling information for classes
- **Excel Uploads**: Tracking of bulk data imports

### Frontend Pages
- **Dashboard**: Overview with statistics and quick actions
- **Workload Management**: Faculty workload assignment and tracking
- **Faculty Tracker**: Monitor faculty task completion status
- **Timetable Management**: Visual timetable creation and editing
- **Excel Import**: Bulk data upload and processing
- **Student Dashboard**: Student-facing timetable view

### UI Components
- **Layout Components**: Responsive sidebar navigation and header
- **Form Components**: Dialog-based forms for data entry
- **Data Display**: Tables, cards, and progress indicators
- **Interactive Elements**: Buttons, badges, and status indicators

## Data Flow

1. **Frontend to Backend**: React components use TanStack Query to make API calls
2. **API Layer**: Express routes handle business logic and data validation
3. **Database Layer**: Drizzle ORM provides type-safe database operations
4. **Response Flow**: Data flows back through the same layers with proper error handling

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation with Zod integration
- **wouter**: Lightweight React router

### UI and Styling
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class variants
- **lucide-react**: Modern icon library

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Development server and build tool
- **@replit/vite-plugin-***: Replit-specific development plugins

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` starts the development server with hot reloading
- **Port**: Application runs on port 5000
- **Database**: Requires DATABASE_URL environment variable

### Production Build
- **Frontend Build**: Vite builds React app to `dist/public`
- **Backend Build**: esbuild bundles server code to `dist/index.js`
- **Start Command**: `npm run start` runs the production server

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Deployment**: Autoscale deployment target
- **Port Mapping**: Internal port 5000 mapped to external port 80

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
```

## User Preferences

Preferred communication style: Simple, everyday language.