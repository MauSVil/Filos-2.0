# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Filos is a Next.js 15 e-commerce inventory management system with real-time features, advanced search, and comprehensive product/order management capabilities.

## Commands

### Development
```bash
npm run dev          # Start development server with Turbo mode
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint with auto-fix
```

### Testing
No test commands are currently configured. Tests should be added to the project.

## Architecture

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **UI**: React 19, TypeScript, Tailwind CSS
- **Components**: Radix UI + Shadcn/ui
- **State Management**: TanStack Query v5
- **Database**: MongoDB with Mongoose ODM
- **Search**: Meilisearch
- **Real-time**: Socket.io
- **Storage**: AWS S3 + MinIO
- **File Processing**: ExcelJS, PDFKit, JSZip

### Directory Structure

```
app/
├── (private)/          # Protected admin routes
│   ├── products/       # Product management
│   ├── orders/         # Order management
│   ├── buyers/         # Buyer management
│   └── settings/       # System settings
├── (public)/           # Public catalog routes
│   └── catalog/        # Product catalog
├── api/               # API routes (v1 and v2)
│   ├── products/
│   ├── orders/
│   ├── buyers/
│   └── shipments/
└── layout.tsx         # Root layout with providers

lib/
├── repositories/      # Data access layer
│   ├── v1/           # Legacy repository implementations
│   └── v2/           # New repository implementations
├── models/           # MongoDB/Mongoose models
├── controllers/      # Business logic controllers
├── services/         # External service integrations
├── utils/            # Utility functions
└── schemas/          # Zod validation schemas

components/
├── ui/               # Shadcn/ui components
├── forms/            # Form components
├── tables/           # Data table components
└── filters/          # Filter components
```

### Key Patterns

1. **Repository Pattern**: All data access goes through repositories (v1 legacy, v2 new implementation)
   - Example: `lib/repositories/v2/products-repository.ts`

2. **Controller Pattern**: Business logic separated from routes
   - Example: `lib/controllers/products-controller.ts`

3. **Type Safety**: Comprehensive TypeScript with Zod schemas
   - Product schemas: `lib/schemas/products-schemas.ts`
   - Order schemas: `lib/schemas/orders-schemas.ts`

4. **Server Components**: Extensive use of React Server Components for data fetching
   - Use `import { searchParams } from 'next/navigation'` for query params
   - Server actions for mutations

5. **Real-time Updates**: Socket.io integration for live notifications
   - Connection: `lib/services/socket-service.ts`
   - Events: order updates, inventory changes

### API Structure

- **v1 API**: Legacy endpoints at `/api/[resource]`
- **v2 API**: New endpoints at `/api/v2/[resource]`
- Both versions coexist for backward compatibility

### Database Models

Key models with relationships:
- **Product**: Main product with variants (color, size, price tiers)
- **Order**: Orders with line items, shipping, and status tracking
- **Buyer**: Customer information and order history
- **Supplier**: Product suppliers
- **Shipment**: FedEx shipping integration

### Authentication & Security

- JWT-based authentication with middleware protection
- Protected routes under `(private)` route group
- API routes use auth middleware from `lib/middleware/auth.ts`

### File Storage

Dual storage system:
- **AWS S3**: Production file storage
- **MinIO**: Local/development file storage
- Configured via `lib/services/storage-service.ts`

### Search Implementation

Meilisearch integration for fast product search:
- Index management: `lib/services/meilisearch-service.ts`
- Search filters and facets support

## Important Considerations

1. **Dual Repository System**: When modifying data access, check both v1 and v2 repositories
2. **Real-time Features**: Socket.io events must be emitted for inventory/order updates
3. **File Processing**: Heavy file operations (Excel, PDF) should be handled asynchronously
4. **Environment Variables**: Required for MongoDB, AWS, MinIO, JWT, and Meilisearch
5. **Type Safety**: Always use Zod schemas for validation and TypeScript types
6. **Server vs Client**: Prefer server components and actions for data operations
7. **Image Handling**: Product images stored in S3/MinIO with CDN URLs

## Common Tasks

### Adding a New Product Feature
1. Update schema in `lib/schemas/products-schemas.ts`
2. Modify model in `lib/models/Product.ts`
3. Update repository methods in `lib/repositories/v2/products-repository.ts`
4. Add controller logic in `lib/controllers/products-controller.ts`
5. Update UI components in `app/(private)/products/`

### Working with Orders
1. Order flow: Draft → Confirmed → Shipped → Delivered
2. PDF generation for invoices via `lib/services/pdf-service.ts`
3. FedEx integration for shipping labels

### Database Operations
- Always use repositories, never direct model access in routes
- Use transactions for multi-document operations
- Implement proper error handling with try-catch blocks