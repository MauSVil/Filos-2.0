
@sessions/CLAUDE.sessions.md

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
- **Database**: MongoDB with native driver
- **Search**: Meilisearch
- **Real-time**: Socket.io
- **Storage**: MinIO (S3-compatible)
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
│   └── v2/            # New API version
└── layout.tsx         # Root layout with providers

repositories/
├── v2/                # New repository implementations
│   ├── ProductRepository.ts
│   ├── OrderRepository.ts
│   └── BuyerRepository.ts
└── [legacy]/          # Legacy repository files

types/
├── RepositoryTypes/   # Legacy type definitions
└── v2/               # New type definitions with Zod schemas
```

### Key Patterns

1. **Repository Pattern**: Data access through repository classes
   - Legacy: `repositories/products.repository.ts`
   - New: `repositories/v2/ProductRepository.ts`

2. **Type Safety**: Zod validation schemas in types directory
   - Legacy types: `types/RepositoryTypes/Product.ts`
   - New types: `types/v2/Product/Base.type.ts`

3. **API Structure**:
   - **v1 API**: Legacy endpoints at `/api/[resource]`
   - **v2 API**: New endpoints at `/api/v2/[resource]`

4. **Authentication**: JWT-based with middleware protection
   - Middleware: `middleware.ts` using stacked middlewares
   - Auth logic: `middlewares/frontAuth.ts`

5. **File Storage**: MinIO integration via FileService
   - Service: `services/file.service.ts`
   - Supports bucket management and ZIP creation

6. **Real-time Features**: Socket.io integration
   - Context: `contexts/socketContext.tsx`
   - Connection: `app/(private)/_socket.ts`

### Database Integration

- **MongoDB**: Native MongoDB driver (not Mongoose)
- **Connection**: `mongodb/index.ts` with global connection handling
- **Environment**: Uses "test" database by default
- **Pattern**: Repository classes handle collection operations

### File Processing

- **MinIO Storage**: S3-compatible object storage
- **File Types**: Images (PNG), Excel, PDF, ZIP archives
- **Upload Pattern**: Files uploaded to buckets with unique object names
- **URL Structure**: `https://minio.mausvil.dev/{bucket}/{object}`

## Important Considerations

1. **Dual Repository System**: Both legacy and v2 repository patterns coexist
2. **Environment Variables**: Required for MongoDB, MinIO, JWT configuration
3. **TypeScript**: Comprehensive type safety with Zod validation
4. **Route Groups**: Uses Next.js route groups `(private)` and `(public)`
5. **Middleware Stack**: Composable middleware pattern in `middlewares/stackHandler.ts`
6. **Real-time Updates**: Socket.io events for inventory/order changes
7. **Error Handling**: Structured error responses with dev/user messages

## Common Development Patterns

### Adding New API Endpoints
1. Create route in appropriate `api/` directory (v1 or v2)
2. Use repository pattern for data access
3. Implement Zod validation for request/response
4. Add proper error handling with structured responses

### Working with Products
- Product schema: Complex with baseId, uniqId, color, size variants
- Pricing tiers: webPage, wholesale, retail, special prices
- Image handling: Uploaded to MinIO with automatic URL generation
- Search: Meilisearch integration for fast product search

### File Operations
- Use `FileService` for all file uploads
- Support for overwrite/no-overwrite patterns
- ZIP generation for bulk document handling
- Bucket-based organization (products, orders, etc.)

### Real-time Features
- Socket connection managed via React Context
- Events emitted for inventory changes and order updates
- Connection state tracking for UI feedback

### UI/UX Design Patterns
- **Card-based Layout**: All forms use Card components for organized sections
- **Dark Mode Only**: Platform exclusively uses dark mode with proper color tokens and contrast ratios
- **Professional Headers**: Page headers include breadcrumbs, icons, and clear hierarchy
- **Form Organization**: 
  - Basic information (name, IDs, color, size, quantity) in first card
  - Pricing information with visual indicators and automatic calculations in second card
  - Image upload with preview in dedicated sidebar card
- **Responsive Design**: Grid layouts that adapt to different screen sizes
- **Visual Feedback**: Loading states, badges for pricing relationships, proper form validation
- **Navigation**: Breadcrumbs, back buttons, and cancel functionality for better UX