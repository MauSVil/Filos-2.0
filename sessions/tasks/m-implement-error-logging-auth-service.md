---
name: m-implement-error-logging-auth-service
branch: feature/m-implement-error-logging-auth-service
status: pending
created: 2025-10-19
---

# Error Logging for Authentication Service

## Problem/Goal
Implement comprehensive error logging for the authentication service to improve debugging, monitoring, and troubleshooting capabilities. Currently, authentication errors may not be properly logged, making it difficult to diagnose issues in production.

## Success Criteria
- [ ] All authentication errors are logged with appropriate severity levels (error, warning, etc.)
- [ ] Error logs include relevant context (user identifier, timestamp, error type, stack trace)
- [ ] No sensitive information (passwords, tokens, keys) is logged
- [ ] Error logging is implemented across all authentication flows (login, JWT validation, middleware)
- [ ] Logs are structured in a consistent format for easy parsing and monitoring

## Context Manifest

### How Authentication Currently Works

The authentication system in this Next.js 15 application operates through a **middleware-based pattern** combined with a **JWT-based authentication API**. Here's the complete flow and all the components involved:

#### Authentication Flow - User Login Journey

When a user attempts to sign in, the journey begins at the **sign-in page** (`/app/(public)/sign-in/page.tsx`). This is a client component that uses React Hook Form with Zod validation. The user submits their email and password, which are validated against the `loginSchema` defined in `/zodSchemas/login.ts`. This schema requires:
- Email: Must be a valid email format
- Password: Minimum 4 characters

The form submission triggers a POST request to `/api/sign-in` endpoint. This is where the authentication logic lives.

#### The Authentication API Endpoint - `/app/api/sign-in/route.ts`

This endpoint handles the complete authentication process:

1. **Request Validation**: The incoming request body is parsed using Zod's `Body` schema (inline defined in the route file). If validation fails, a `ZodError` is thrown.

2. **User Lookup**: The system queries the MongoDB `users` collection through `UsersRepository.findOne({ email })`. The UsersRepository is a legacy-style repository located at `/repositories/users.repository.ts` that connects to the "test" database.

3. **Password Verification**: If the user exists, bcrypt compares the submitted password with the hashed password stored in the database using `bcrypt.compare(validatedBody.password, userFound.password)`.

4. **JWT Token Generation**: If authentication succeeds, a JWT token is created using `jwt.sign()` with:
   - Payload containing: `{ id, name, email, role }`
   - Secret: Currently hardcoded as 'secretWord' (CRITICAL: This should use environment variables)
   - No expiration is set (security concern)

5. **Cookie Setting**: The JWT token is stored in an HTTP cookie named "token" with:
   - MaxAge: 7 days (60 * 60 * 24 * 7)
   - The cookie is set using Next.js's `cookies()` API

6. **Response**: Returns JSON with `{ message, token, user }` on success.

#### Error Handling in Sign-In (Current State)

The current error handling is **minimal and inconsistent**:

```typescript
catch (error) {
  console.log(error, "error");  // <-- ONLY logging, uses console.log

  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: error.issues[0].message },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Error al iniciar sesion" },
    { status: 400 }
  );
}
```

**Critical Issues**:
- Only uses `console.log()` - no structured logging
- Exposes error messages directly to client (security risk for passwords/auth errors)
- No error context (timestamp, user identifier, request metadata)
- No distinction between authentication failure types (user not found vs wrong password)
- All errors return status 400, no proper HTTP status codes (401 Unauthorized, 404 Not Found)

#### Middleware-Based Route Protection - `/middlewares/frontAuth.ts`

After successful login, route protection is handled by the `frontAuth` middleware, which is part of a **composable middleware stack** (`/middlewares/stackHandler.ts`). The middleware:

1. **Checks Protected Routes**: Routes like `/chat`, `/orders`, `/products`, `/buyers`, and `/` (root) are protected.

2. **Token Verification**: Simply checks if the "token" cookie exists using `cookies().get("token")?.value`.

3. **Redirect Logic**:
   - If no token exists on protected routes → redirect to `/sign-in`
   - If token exists on `/sign-in` → redirect to `/`

**Critical Flaw**: The middleware **NEVER validates the JWT token**. It only checks if a cookie exists. There's no `jwt.verify()` call, meaning:
- Expired tokens are accepted
- Tampered tokens are accepted
- Invalid tokens are accepted
- No user session validation occurs

**No Error Logging**: The middleware has ZERO error handling or logging. Failed authentication attempts are completely invisible.

#### MongoDB Connection - `/mongodb/index.ts`

The authentication system uses MongoDB with native driver (not Mongoose). Connection details:
- URI from `MONGODB_URI` environment variable
- Uses global connection pooling in development
- Default database: "test"
- Collections: "users"

**Error Points**: Connection failures are not logged in the authentication flow.

#### User Repository - `/repositories/users.repository.ts`

The `UsersRepository` is a class-based repository with a single method:
```typescript
static async findOne(filter: UserRepositoryFilter = {}): Promise<User | null>
```

This uses Zod validation via `UserRepositoryFilterModel` but has **no error logging**. Database query failures are silently propagated up.

#### User Data Model - `/types/RepositoryTypes/User.ts`

User schema includes:
- `_id`, `name`, `firstLastName`, `secondLastName`, `email`, `password` (hashed), `role`
- Timestamps: `createdAt`, `updatedAt`, `deletedAt` (soft delete support)

**Security Concern**: Password is stored in the database model type and could accidentally be logged.

### Current Error Handling Patterns in the Codebase

The application has **three different error handling patterns**, creating inconsistency:

#### Pattern 1: Legacy Error Handling (used in `/api/products`, `/api/orders`)

```typescript
catch (error) {
  if (error instanceof Error) {
    return NextResponse.json(
      { devError: error.message, error: "User-friendly message" },
      { status: 500 }
    );
  }
  return NextResponse.json({ error: "Generic error" }, { status: 500 });
}
```

This pattern separates `devError` (technical details) from `error` (user message) but still exposes technical details to the client.

#### Pattern 2: Centralized Handler (used in v2 APIs like `/api/v2/orders`, `/api/v2/buyers`)

The `/lib/handleError.ts` utility provides a centralized handler:

```typescript
export const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.errors }, { status: 422 })
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ error: "Unknown error" }, { status: 500 })
}
```

This is more consistent but:
- No logging whatsoever
- Returns full Zod error array (can be verbose)
- No context information
- Exposes error messages directly

#### Pattern 3: Structured Error Responses (used in `/api/trends`)

```typescript
catch (error) {
  console.error('Error fetching trends list:', error);

  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Error al obtener lista de tendencias',
        devMessage: error instanceof Error ? error.message : 'Unknown error',
      }
    },
    { status: 500 }
  );
}
```

This is the most sophisticated pattern, separating user and dev messages in the response structure, but still:
- Only uses `console.error()`
- Exposes `devMessage` to client
- No request context

### What Needs to Be Built: Error Logging Service for Authentication

Since we're implementing error logging specifically for the authentication service, we need to:

#### 1. Create a Logging Service

The application **has no logging infrastructure**. No Winston, no Pino, no Bunyan - just `console.log()` and `console.error()` scattered throughout. We need to create a new service at `/services/logger.service.ts` (or `/lib/logger.ts`) that:

- Provides structured logging with severity levels (error, warn, info, debug)
- Formats logs consistently with timestamps, context, and metadata
- Sanitizes sensitive data (passwords, tokens, full JWT payloads)
- Works in both server and edge runtime environments (Next.js constraint)
- Can be easily extended to send logs to external services later

#### 2. Enhance Authentication Error Logging

For each authentication flow component, we need to add comprehensive logging:

**Sign-In API (`/app/api/sign-in/route.ts`)**:
- Log authentication attempts (success/failure) with email (NOT password)
- Log user lookup failures with context
- Log password verification failures
- Log JWT generation errors
- Log cookie setting failures
- Include request metadata: IP address, user agent, timestamp
- Use proper HTTP status codes (401 for auth failures, not 400)

**Middleware (`/middlewares/frontAuth.ts`)**:
- Log missing token attempts with route and timestamp
- Log invalid/malformed tokens
- Add JWT verification with logging for:
  - Expired tokens
  - Invalid signatures
  - Malformed tokens
- Log successful authentications
- Include route being accessed in logs

**User Repository (`/repositories/users.repository.ts`)**:
- Log database connection failures
- Log query failures with context (but NOT the filter if it contains sensitive data)

#### 3. Sanitization Requirements

Critical data to NEVER log:
- Raw passwords (from request body)
- Complete JWT tokens (log only metadata like "token present", expiration time)
- JWT secret keys
- Full bcrypt hashes
- Session cookies (log only presence/absence)

Safe to log:
- User email/identifier (for tracking auth attempts)
- Timestamps
- Error types and codes
- Request metadata (IP, user agent)
- Database operation types (findOne, updateOne)
- Success/failure status

#### 4. Log Structure

Logs should follow a consistent structure:
```typescript
{
  timestamp: ISO8601,
  level: 'error' | 'warn' | 'info' | 'debug',
  service: 'auth',
  operation: 'sign-in' | 'token-verification' | 'user-lookup',
  status: 'success' | 'failure',
  userId?: string,
  email?: string,
  errorType?: string,
  errorMessage?: string,
  metadata: {
    ip?: string,
    userAgent?: string,
    route?: string,
    // ... other context
  }
}
```

### Technical Reference Details

#### File Locations for Implementation

**Primary Implementation Files**:
- `/services/logger.service.ts` (or `/lib/logger.ts`) - NEW file to create
- `/app/api/sign-in/route.ts` - MODIFY to add logging
- `/middlewares/frontAuth.ts` - MODIFY to add JWT verification and logging
- `/repositories/users.repository.ts` - MODIFY to add error logging
- `/lib/handleError.ts` - POTENTIALLY enhance for auth-specific errors

**Related Files to Reference**:
- `/lib/utils.ts` - Utility functions pattern
- `/utils/timezone.ts` - Timestamp utilities (use for consistent timestamps)
- `/types/MiddleFactory.ts` - Middleware type definitions
- `/types/RepositoryTypes/User.ts` - User data structures

#### Key Dependencies Available

From `package.json`:
- `jsonwebtoken@9.0.2` - For JWT operations
- `bcryptjs@3.0.2` - For password hashing
- `zod@3.24.2` - For validation
- `mongodb@6.15.0` - Database driver
- `next@15.2.4` - Framework

**No logging library installed** - need to decide:
- Option 1: Use console with structured formatting (works in edge runtime)
- Option 2: Install Winston/Pino (check edge runtime compatibility)
- Option 3: Build lightweight custom logger

#### Environment Variables Needed

Current (from `.env`):
- `MONGODB_URI` - Database connection
- `NEXT_PUBLIC_URL` - Application URL

**Missing (need to add)**:
- `JWT_SECRET` - Replace hardcoded 'secretWord'
- `JWT_EXPIRATION` - Token expiration time
- `LOG_LEVEL` - Control logging verbosity (dev vs prod)

#### Authentication API Signature

```typescript
// POST /api/sign-in
interface SignInRequest {
  email: string;
  password: string;
}

interface SignInResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  }
}

interface SignInError {
  message: string; // User-facing message
  // Should NOT include technical details
}
```

#### Middleware Signature

```typescript
// Type from /types/MiddleFactory.ts
export type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;

// Current frontAuth signature
export const frontAuth: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    // Implementation
    return next(request, _next);
  }
}
```

#### Repository Pattern

```typescript
// Static methods pattern used throughout
class UsersRepository {
  static async findOne(filter: UserRepositoryFilter): Promise<User | null>
}

// Connection pattern in repositories
let client;
let db: Db;

const init = async () => {
  client = await clientPromise;
  db = client.db("test") as Db;
};
```

### Implementation Strategy

1. **Phase 1**: Create logging service with sanitization
2. **Phase 2**: Add logging to sign-in API route
3. **Phase 3**: Enhance middleware with JWT verification and logging
4. **Phase 4**: Add repository-level error logging
5. **Phase 5**: Test with various error scenarios

### Error Scenarios to Test

- Invalid credentials (wrong password)
- Non-existent user
- Malformed request body
- Database connection failure
- JWT generation failure
- Expired token in middleware
- Invalid/tampered token
- Missing token cookie
- Zod validation failures

### Security Considerations

- Never log passwords or tokens in full
- Use appropriate log levels (error for failures, info for success)
- Consider rate limiting for failed auth attempts (future enhancement)
- Ensure logs don't leak information about user existence
- Sanitize all user input before logging

## User Notes
<!-- Any specific notes or requirements from the developer -->

## Work Log
<!-- Updated as work progresses -->
- [YYYY-MM-DD] Started task, initial research
