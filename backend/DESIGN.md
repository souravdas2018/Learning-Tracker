# Backend Design Document

This document describes the architecture, design decisions, and implementation details of the Learning Tracker backend.

## Architecture Overview

The backend follows a **layered architecture** pattern with clear separation of concerns:

```
HTTP Request
    ↓
Routes Layer (routes/)
    ↓
Middleware Layer (middlewares/)
    ↓
Controller Layer (controllers/)
    ↓
Service Layer (services/)
    ↓
Repository Layer (repositories/)
    ↓
Database (Supabase/PostgreSQL)
```

## Architecture Rationale

### Layered Architecture

**Why Layered Architecture?**

1. **Separation of Concerns**: Each layer has a single, well-defined responsibility
2. **Testability**: Each layer can be tested independently with mocks
3. **Maintainability**: Changes are localized to relevant layers
4. **Scalability**: Easy to add new features following the same pattern
5. **Reusability**: Business logic (services) can be reused across different interfaces

**Layers Explained:**

#### 1. Routes Layer (`routes/`)
- **Purpose**: Define API endpoints and HTTP methods
- **Responsibilities**: 
  - Route definitions
  - Middleware registration
  - Controller method mapping
- **Example**: `router.post("/login", authController.login)`

**Rationale:**
- Centralized route definitions
- Easy to see all available endpoints
- Clear API structure

#### 2. Middleware Layer (`middlewares/`)
- **Purpose**: Cross-cutting concerns (authentication, authorization, validation)
- **Responsibilities**:
  - JWT token verification
  - Role-based access control
  - Request validation (future)
- **Example**: `authMiddleware` verifies JWT tokens

**Rationale:**
- Reusable across routes
- Centralized authentication logic
- Easy to add new middleware (logging, rate limiting)

#### 3. Controller Layer (`controllers/`)
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**:
  - Extract request data
  - Call service layer
  - Format responses
  - Handle HTTP errors
- **Rule**: Controllers should be **thin** (minimal logic)

**Rationale:**
- HTTP-specific logic isolated
- Service layer remains framework-agnostic
- Easy to swap frameworks (Express → Fastify, etc.)

**Example:**
```javascript
exports.login = async (req, res) => {
  try {
    const { token, user } = await authService.login(req.body.email, req.body.password);
    res.json({ token, id: user.id });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
```

#### 4. Service Layer (`services/`)
- **Purpose**: Business logic and orchestration
- **Responsibilities**:
  - Business rule validation
  - Data transformation
  - Orchestrating multiple repository calls
  - Complex calculations
- **Rule**: Services contain the **core business logic**

**Rationale:**
- Business logic is reusable (can be called from APIs, workers, CLI)
- Independent of HTTP layer
- Easy to test (mock repositories)
- Can be shared across different interfaces (REST, GraphQL, etc.)

**Example:**
```javascript
exports.login = async (email, password) => {
  const { data: user } = await authRepo.findUserByEmail(email);
  if (!user) throw new Error("User not found");
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid credentials");
  
  await authRepo.activateUser(user.id);
  const token = generateUserToken(user);
  return { token, user };
};
```

#### 5. Repository Layer (`repositories/`)
- **Purpose**: Data access abstraction
- **Responsibilities**:
  - Database queries
  - Entity mapping
  - Data transformation
- **Rule**: Repositories abstract database implementation

**Rationale:**
- Database-agnostic services (can swap Supabase → PostgreSQL → MongoDB)
- Easy to test (mock repositories)
- Centralized query logic
- Can add caching layer without changing services

**Example:**
```javascript
exports.findUserByEmail = async (email) => {
  return supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
};
```

## Folder Structure Rationale

### Organization by Layer

**Why organize by layer (not by feature)?**

```
Current Structure (Layer-based):
src/
├── controllers/
│   ├── auth.controller.js
│   ├── course.controller.js
│   └── ...
├── services/
│   ├── auth.service.js
│   ├── course.service.js
│   └── ...
└── repositories/
    ├── auth.repo.js
    ├── course.repo.js
    └── ...
```

**Benefits:**
- Easy to find all controllers/services/repositories
- Clear dependencies (all controllers in one place)
- Easy to enforce layer rules (no direct repository calls from controllers)

**Alternative (Feature-based):**
```
src/
├── auth/
│   ├── auth.controller.js
│   ├── auth.service.js
│   └── auth.repo.js
├── course/
│   ├── course.controller.js
│   ├── course.service.js
│   └── course.repo.js
```

**Trade-off:** Feature-based is better for microservices, but layer-based works better for monoliths (current architecture).

## Data & API Design Decisions

### Database Design

#### Entity Relationship Model

```
Users (1) ──< (Many) UserCourses (Many) >── (1) Courses
  │                                                │
  │                                                │
  │ (1) ──< (Many) UserModuleProgress (Many) >── (1) Modules
  │                                                      │
  │                                                      │
  └──────────────────────────────────────────────────────┘
                                                          │
Admin (1) ──< (Many) Courses                             │
                                                          │
Admin (1) ──< (Many) Modules
```

**Design Decisions:**

1. **Separate Admin Table**
   - **Reason**: Security isolation, different access patterns
   - **Benefit**: Clear separation, easy to manage permissions
   - **Alternative**: Single users table with role field (rejected - less secure)

2. **Junction Tables (UserCourses, UserModuleProgress)**
   - **Reason**: Many-to-many relationships
   - **Benefit**: Normalized design, prevents duplication
   - **Additional Fields**: Enrollment timestamps, status, progress

3. **Progress Tracking Separate Table**
   - **Reason**: Fine-grained tracking (per module, not per course)
   - **Benefit**: Detailed analytics, flexible tracking
   - **Fields**: progress (percentage), time_spent, updated_at

#### Normalization Strategy

**Level**: 3NF (Third Normal Form)

**Rationale:**
- Reduces data duplication
- Ensures data integrity
- Easier to maintain
- Trade-off: More joins (acceptable for relational database)

**Example:**
- User info not duplicated in enrollments (referenced via user_id)
- Course info not duplicated in modules (referenced via course_id)

### API Design Decisions

#### RESTful Principles

**Resource-Based URLs:**
- `/courses` - Collection of courses
- `/courses/:id` - Specific course
- `/courses/:courseId/modules` - Nested resource (modules of a course)

**HTTP Methods:**
- `GET` - Read operations
- `POST` - Create operations
- `PUT` - Update operations (full update)
- `DELETE` - Delete operations

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (authorization failed) - Not currently used
- `404` - Not Found
- `500` - Server Error

#### Response Format

**Success Response:**
```json
{
  "data": { ... },
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

**Rationale:**
- Consistent format across all endpoints
- Easy for frontend to handle
- Clear error messages

#### Authentication Strategy

**JWT (JSON Web Tokens):**

**Why JWT?**
- Stateless (no session storage needed)
- Scalable (works across multiple servers)
- Self-contained (user info in token)
- Standard approach

**Token Structure:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "role": "user" | "admin",
  "exp": 1234567890
}
```

**Token Lifecycle:**
1. User logs in → Token generated (1 hour expiry)
2. Token included in Authorization header
3. Middleware verifies token
4. User info extracted from token
5. Request processed

**Security Considerations:**
- Tokens signed with secret key (JWT_SECRET)
- Short expiry (1 hour) - balances security and UX
- HTTPS in production (tokens encrypted in transit)
- Future: Refresh tokens for longer sessions

#### Error Handling Strategy

**Current Approach:**
- Try-catch in controllers
- Errors thrown from services
- Generic error messages in production

**Error Flow:**
```
Service throws error
    ↓
Controller catches error
    ↓
Returns formatted error response
```

**Future Improvements:**
- Custom error classes
- Error codes
- Error logging
- Error tracking (Sentry)

## Deployment Reasoning

### Platform Choice

**Current: Traditional VPS/Cloud Server**

**Why?**
- Full control over environment
- Cost-effective for predictable traffic
- Easy to configure (Nginx, SSL, etc.)
- No vendor lock-in

**Deployment Stack:**
- **Runtime**: Node.js
- **Process Manager**: PM2 (recommended)
- **Load Balancer**: Nginx (see `infrastructure/nginx.conf`)
- **Database**: Supabase (managed PostgreSQL)
- **Reverse Proxy**: Nginx

### Environment Handling

#### Environment Variables

**Required Variables:**
- `PORT` - Server port (default: 5500)
- `JWT_SECRET` - Secret key for JWT signing
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon key

**Development vs Production:**
- Development: `.env` file (gitignored)
- Production: Environment variables or secret manager
- Different JWT_SECRET per environment

#### Configuration Management

**Current: Simple .env file**

**Future:**
- Configuration validation (joi, zod)
- Default values
- Environment-specific configs
- Secret management (AWS Secrets Manager, etc.)

### Scaling Considerations

#### Horizontal Scaling

**Strategy:**
1. Deploy multiple backend instances
2. Use Nginx load balancer
3. Round-robin distribution
4. Health checks

**Configuration:**
See `infrastructure/nginx.conf` for load balancer setup.

**Database:**
- Supabase handles connection pooling
- Can scale vertically (upgrade instance)
- Read replicas available for analytics

#### Vertical Scaling

**When to Scale Vertically:**
- CPU-intensive operations
- Memory constraints
- Single instance sufficient

**When to Scale Horizontally:**
- High traffic
- Need for redundancy
- Cost optimization

## Scalability & Maintainability

### Handling Traffic Growth

#### Current Capacity

**Estimated Capacity:**
- Single instance: 500-1000 concurrent requests
- With load balancer (3 instances): 1500-3000 concurrent requests
- Database: Depends on Supabase tier

#### Performance Optimizations

**Implemented:**
- Connection pooling (via Supabase)
- Efficient queries
- Indexed database fields

**Future:**
- Response caching (Redis)
- Query optimization
- Database indexes
- CDN for static assets

### Feature Expansion

#### Adding New Features

**Pattern to Follow:**

1. **Database**: Add tables/columns in `database/migrations/`
2. **Repository**: Create/update repository methods
3. **Service**: Add business logic
4. **Controller**: Add request handlers
5. **Routes**: Define endpoints
6. **Middleware**: Add authentication if needed

**Example: Adding Comments Feature:**

```
1. database/migrations/add_comments.sql
2. repositories/comment.repo.js
3. services/comment.service.js
4. controllers/comment.controller.js
5. routes/comment.routes.js
6. Register routes in app.js
```

**Benefits:**
- Consistent pattern
- Easy to find code
- Clear dependencies

### Multi-Team Collaboration

#### Code Organization

**Clear Boundaries:**
- Backend team owns `backend/` directory
- Frontend team owns `frontend/` directory
- API contracts define interfaces

#### Communication

**API Contracts:**
- RESTful endpoints
- Request/response formats
- Error codes
- Future: OpenAPI/Swagger documentation

**Development Workflow:**
1. Define API contract
2. Backend implements
3. Frontend consumes
4. Integration testing

## Trade-offs & Simplifications

### What Was Intentionally Simplified

#### 1. No Refresh Tokens

**Current:** Short-lived tokens (1 hour)

**Trade-off:**
- **Simpler**: No token refresh logic
- **Limitation**: Users need to re-login frequently
- **Future**: Implement refresh tokens

#### 2. Basic Error Handling

**Current:** Generic error messages

**Trade-off:**
- **Simpler**: Quick implementation
- **Limitation**: Less informative errors
- **Future**: Structured error codes, detailed logging

#### 3. No Caching Layer

**Current:** Direct database queries

**Trade-off:**
- **Simpler**: No cache invalidation complexity
- **Limitation**: Higher database load
- **Future**: Redis caching

#### 4. No Rate Limiting

**Current:** Unlimited requests

**Trade-off:**
- **Simpler**: No rate limiting configuration
- **Limitation**: Vulnerable to abuse
- **Future**: Rate limiting middleware

#### 5. Simple Validation

**Current:** Basic validation in controllers

**Trade-off:**
- **Simpler**: No validation library needed
- **Limitation**: Less robust validation
- **Future**: Joi/Zod validation schemas

### What Would Be Improved With More Time

1. **Comprehensive Testing**
   - Higher test coverage
   - Integration tests
   - E2E tests

2. **API Documentation**
   - OpenAPI/Swagger
   - Postman collections
   - Code examples

3. **Advanced Features**
   - File uploads
   - Email notifications
   - Background jobs
   - Webhooks

4. **Performance**
   - Caching layer
   - Query optimization
   - Database indexes
   - Response compression

5. **Security**
   - Rate limiting
   - Input sanitization
   - Security headers
   - Audit logging

6. **Monitoring**
   - Application performance monitoring
   - Logging aggregation
   - Metrics dashboard
   - Alerting

### Known Limitations

1. **No Pagination**: All data returned at once
2. **No Search**: Can't search courses/users
3. **No File Storage**: No course images, user avatars
4. **No Email**: No notifications or password reset emails
5. **No Background Jobs**: All operations synchronous
6. **Limited Analytics**: Basic dashboard only
7. **No API Versioning**: Unversioned APIs
8. **Basic Logging**: Console logging only

## Conclusion

The backend architecture provides:
- **Clear separation of concerns**
- **Easy to test and maintain**
- **Scalable foundation**
- **Room for growth**

While simplified in some areas, the architecture is designed to evolve as requirements change.
