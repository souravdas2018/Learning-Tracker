# Learning Tracker - Design Document

This document outlines the architecture, design decisions, and rationale behind the Learning Tracker application.

## Table of Contents

1. [Architecture Rationale](#architecture-rationale)
2. [Data & API Design Decisions](#data--api-design-decisions)
3. [Deployment Reasoning](#deployment-reasoning)
4. [Scalability & Maintainability](#scalability--maintainability)
5. [Trade-offs & Simplifications](#trade-offs--simplifications)

---

## Architecture Rationale

### Framework Choices

#### Backend: Node.js + Express.js

**Rationale:**
- **JavaScript Ecosystem**: Unified language across frontend and backend reduces context switching
- **Performance**: Node.js handles I/O-bound operations efficiently, ideal for API services
- **Ecosystem**: Rich npm ecosystem with mature packages
- **Developer Experience**: Fast development cycle, excellent tooling
- **Scalability**: Event-driven, non-blocking architecture scales well

**Alternatives Considered:**
- **Python/Django**: More verbose for API-only backend, slower development
- **Go**: Steeper learning curve, overkill for this application size
- **Ruby on Rails**: Less popular for new projects, smaller ecosystem

#### Frontend: Next.js 14 + TypeScript

**Rationale:**
- **React Ecosystem**: Most popular, well-supported framework
- **Server-Side Rendering**: Better SEO and initial load performance
- **App Router**: Modern routing with file-based structure
- **TypeScript**: Type safety reduces runtime errors, improves developer experience
- **Built-in Optimization**: Image optimization, code splitting, bundling
- **Full-Stack Capabilities**: Can handle API routes if needed

**Alternatives Considered:**
- **React (CRA)**: No SSR, requires additional setup for routing
- **Vue.js**: Smaller ecosystem, less TypeScript support
- **Angular**: More complex, steeper learning curve, larger bundle size

#### Database: PostgreSQL (via Supabase)

**Rationale:**
- **Relational Model**: Well-suited for structured data (users, courses, enrollments)
- **ACID Compliance**: Ensures data integrity
- **SQL**: Powerful querying capabilities
- **Supabase**: Managed database with real-time capabilities, easy scaling
- **Mature**: Battle-tested, extensive documentation

**Alternatives Considered:**
- **MongoDB**: Less ideal for relational data, requires more application-level joins
- **MySQL**: Similar to PostgreSQL, but Supabase uses PostgreSQL
- **Firebase**: Vendor lock-in, limited querying capabilities

### Folder Structure

#### Backend Structure (Layered Architecture)

```
backend/src/
├── controllers/    # Request/Response handling (thin layer)
├── services/       # Business logic (core layer)
├── repositories/   # Data access (persistence layer)
├── routes/         # Route definitions
├── middlewares/    # Cross-cutting concerns (auth, validation)
└── utils/          # Shared utilities
```

**Rationale:**
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Each layer can be tested independently
- **Maintainability**: Changes are localized to relevant layers
- **Scalability**: Easy to add new features following the same pattern

**Benefits:**
- Controllers remain thin (just request/response mapping)
- Business logic centralized in services (reusable)
- Repository pattern abstracts database (easy to swap databases)
- Clear dependencies (controllers → services → repositories)

#### Frontend Structure (Feature-Based with App Router)

```
frontend/
├── app/            # Next.js App Router (file-based routing)
│   ├── (auth)/     # Authentication pages
│   ├── dashboard/  # Dashboard pages
│   └── courses/    # Course-related pages
├── components/     # Shared components
├── contexts/       # React contexts (state management)
└── services/       # API client services
```

**Rationale:**
- **App Router**: Next.js 14's modern routing approach
- **Co-location**: Related files stay together
- **Shared Components**: Reusable UI components in one place
- **Contexts**: Global state (auth) managed centrally
- **Services**: API calls centralized for consistency

### Separation of Business Logic

**Backend Layering:**

1. **Routes Layer** (`routes/`)
   - Defines API endpoints
   - Maps HTTP methods to controllers
   - Applies middlewares (auth, validation)

2. **Controller Layer** (`controllers/`)
   - Handles HTTP requests/responses
   - Validates input
   - Calls service layer
   - Returns formatted responses

3. **Service Layer** (`services/`)
   - Contains business logic
   - Orchestrates multiple repository calls
   - Validates business rules
   - Independent of HTTP layer

4. **Repository Layer** (`repositories/`)
   - Data access abstraction
   - Database queries
   - Entity mapping
   - Can be swapped without affecting services

**Benefits:**
- Business logic is reusable (can be called from APIs, workers, CLI)
- Easy to test (mock repositories, test services independently)
- Clear dependencies (one-way flow)
- Database changes isolated to repository layer

---

## Data & API Design Decisions

### Relationship Modeling

#### Core Entities

1. **Users**
   - One-to-many with UserCourses (enrollments)
   - One-to-many with UserModuleProgress (progress tracking)
   - Separate from Admins (different access levels)

2. **Admins**
   - Separate table (security isolation)
   - Access control field (`access` boolean)
   - Can manage courses and grant admin access

3. **Courses**
   - One-to-many with Modules
   - One-to-many with UserCourses (enrollments)
   - Created by Admin (via `created_by`)

4. **Modules**
   - Many-to-one with Courses
   - One-to-many with UserModuleProgress
   - Created by Admin

5. **UserCourses** (Enrollment Table)
   - Junction table (Many-to-Many: Users ↔ Courses)
   - Tracks enrollment status
   - Contains enrollment timestamp

6. **UserModuleProgress**
   - Tracks individual module progress
   - Stores progress percentage and time spent
   - Updated timestamp for last activity tracking

**Design Decisions:**
- **Separate Admin Table**: Security best practice, clear separation of concerns
- **Junction Tables**: Normalized design prevents data duplication
- **Progress Tracking**: Separate table allows fine-grained tracking
- **Status Fields**: Boolean flags (is_active, access) for simple state management

### API Evolution Strategy

#### Versioning Approach
Currently using unversioned APIs. For future versions:

1. **URL Versioning**: `/api/v1/courses`, `/api/v2/courses`
2. **Header Versioning**: `Accept: application/vnd.learning-tracker.v1+json`
3. **Feature Flags**: Gradual rollout of breaking changes

#### RESTful Principles

- **Resources as Nouns**: `/courses`, `/users`, `/admin`
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Status Codes**: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (error)
- **Consistent Response Format**: `{ data, error }` structure

#### API Patterns

1. **Nested Resources**: `/courses/:courseId/modules` (logical grouping)
2. **Query Parameters**: For filtering, pagination (future)
3. **Authentication**: JWT tokens in Authorization header
4. **Error Handling**: Consistent error format with messages

**Future Enhancements:**
- Pagination (`?page=1&limit=20`)
- Filtering (`?status=active`)
- Sorting (`?sort=created_at&order=desc`)
- Field selection (`?fields=id,title`)

---

## Deployment Reasoning

### Platform Choice

#### Backend Deployment Options

**Current Choice: Traditional VPS/Cloud (with Nginx)**
- **Flexibility**: Full control over environment
- **Cost-Effective**: Lower costs for predictable traffic
- **Customization**: Easy to configure load balancer, caching, etc.

**Alternatives Considered:**
- **Container Orchestration (Kubernetes)**: Overkill for current scale, higher complexity
- **Serverless (AWS Lambda)**: Cold starts, vendor lock-in, limited database connections
- **PaaS (Heroku, Railway)**: Easier deployment but less control, higher costs at scale

#### Frontend Deployment Options

**Current Choice: Vercel/Netlify (or similar)**
- **Next.js Optimization**: Built-in support for Next.js
- **CDN**: Global edge network for fast delivery
- **Zero Configuration**: Automatic deployments from Git

**Alternatives:**
- **VPS**: More control but requires manual setup
- **AWS S3 + CloudFront**: More complex, overkill for current needs

### Environment Handling

#### Environment Variables

**Separation:**
- `.env` (backend) - Sensitive data (JWT_SECRET, database credentials)
- `.env.local` (frontend) - Public configuration (API URL)
- `.env.example` - Template files (version controlled)

**Security:**
- Never commit `.env` files
- Use secret management in production (AWS Secrets Manager, etc.)
- Rotate secrets regularly
- Different secrets per environment

#### Configuration Management

**Development:**
- Local databases, relaxed CORS
- Detailed error messages
- Hot reloading enabled

**Production:**
- Production database, strict CORS
- Generic error messages (security)
- Optimized builds, caching enabled

### Scaling Considerations

#### Horizontal Scaling (Load Balancing)

**Nginx Load Balancer** (see `infrastructure/nginx.conf`):
- **Round-Robin**: Distributes requests evenly
- **Health Checks**: Removes unhealthy instances
- **Session Persistence**: Can use `ip_hash` if needed
- **Failover**: Automatic retry on failure

**Scaling Strategy:**
1. Start with single instance
2. Add more instances behind load balancer
3. Monitor performance metrics
4. Scale based on CPU, memory, request rate

#### Database Scaling

**Current: Supabase Managed PostgreSQL**
- **Connection Pooling**: Supabase handles this
- **Read Replicas**: Available for read-heavy workloads
- **Vertical Scaling**: Upgrade instance size
- **Horizontal Scaling**: Complex, consider database sharding later

**Future Considerations:**
- Implement caching layer (Redis)
- Database read replicas for analytics
- Connection pool limits (currently unlimited via Supabase)

#### Caching Strategy

**Current:**
- No caching layer (database queries on every request)

**Future:**
- **Redis Cache**: Cache frequently accessed data (course lists, user dashboards)
- **CDN**: Static assets and API responses
- **Application Cache**: In-memory caching for non-changing data

**Cache Invalidation:**
- Cache keys with TTL
- Invalidate on updates
- Cache warming for critical data

---

## Scalability & Maintainability

### Handling Traffic Growth

#### Current Capacity
- **Estimated**: 1,000-10,000 concurrent users
- **Database**: Supabase free tier (500MB, 2GB bandwidth)
- **Backend**: Single instance (can scale horizontally)

#### Scaling Plan

**Phase 1: Initial Growth (1K-10K users)**
- Add load balancer (Nginx)
- Deploy 2-3 backend instances
- Upgrade database tier if needed
- Implement basic caching

**Phase 2: Moderate Growth (10K-100K users)**
- Horizontal scaling (more backend instances)
- Database read replicas
- Redis caching layer
- CDN for static assets
- Monitoring and alerting

**Phase 3: High Growth (100K+ users)**
- Microservices architecture (if needed)
- Database sharding
- Advanced caching strategies
- Queue system for background jobs
- Auto-scaling infrastructure

#### Performance Optimizations

**Backend:**
- Database query optimization (indexes, query analysis)
- Connection pooling
- Response compression (gzip)
- Rate limiting
- Async processing for heavy operations

**Frontend:**
- Code splitting
- Image optimization
- Lazy loading
- Service workers (PWA)
- Bundle size optimization

### Feature Expansion

#### Modular Architecture

**Current Structure Supports:**
- New features follow existing patterns
- Services are isolated (easy to add new ones)
- Routes are modular (easy to add endpoints)

**Example: Adding Notifications Feature**
1. Create `notification.repo.js` (data access)
2. Create `notification.service.js` (business logic)
3. Create `notification.controller.js` (HTTP handling)
4. Add routes to `routes/notification.routes.js`
5. Register routes in `app.js`

**No changes needed to existing code** (Open/Closed Principle)

#### Plugin System (Future)

- Service registry pattern
- Event-driven architecture
- Webhook support
- Third-party integrations

### Multi-Team Collaboration

#### Code Organization

**Clear Boundaries:**
- Backend team: `backend/` directory
- Frontend team: `frontend/` directory
- DevOps team: `infrastructure/` directory
- QA team: `test-case/` directory

**Independent Development:**
- Teams can work in parallel
- API contracts define interfaces
- Version control (Git branches)

#### Communication

**API Contracts:**
- OpenAPI/Swagger documentation (future)
- Postman collections
- Type definitions (TypeScript interfaces)

**Development Workflow:**
1. Define API contracts first
2. Backend implements APIs
3. Frontend consumes APIs
4. Integration testing
5. Deployment

#### Code Standards

**Backend:**
- ESLint for code quality
- Consistent naming conventions
- JSDoc comments for complex functions
- Error handling patterns

**Frontend:**
- TypeScript for type safety
- ESLint + Prettier
- Component guidelines
- Accessibility standards

---

## Trade-offs & Simplifications

### What Was Intentionally Simplified

#### Authentication & Authorization

**Current Implementation:**
- JWT-based authentication (stateless)
- Simple role-based access (user vs admin)
- No refresh tokens (short-lived tokens)

**Trade-off:**
- **Simpler**: Easier to implement, no session storage
- **Limitation**: Cannot revoke tokens until expiry
- **Future**: Add refresh tokens, token blacklist

#### Database Schema

**Current Implementation:**
- Single database (no sharding)
- No materialized views for analytics
- Simple indexes (basic optimization)

**Trade-off:**
- **Simpler**: Easier to manage, single source of truth
- **Limitation**: May need optimization for large datasets
- **Future**: Add indexes, materialized views, read replicas

#### Real-time Features

**Current Implementation:**
- Polling for dashboard updates
- No WebSocket connections
- No real-time notifications

**Trade-off:**
- **Simpler**: Standard HTTP, easier debugging
- **Limitation**: Not instant updates
- **Future**: WebSockets, Supabase real-time subscriptions

#### Error Handling

**Current Implementation:**
- Basic error responses
- Generic error messages in production
- No structured error codes

**Trade-off:**
- **Simpler**: Quick to implement
- **Limitation**: Less detailed error information
- **Future**: Error codes, detailed logging, error tracking (Sentry)

#### Testing

**Current Implementation:**
- Unit tests for critical paths
- Integration tests for APIs
- Mock-based testing (no real database)

**Trade-off:**
- **Simpler**: Fast tests, no external dependencies
- **Limitation**: May miss integration issues
- **Future**: E2E tests, database integration tests

### What Would Be Improved With More Time

#### 1. Comprehensive Error Handling
- Structured error codes
- Error tracking (Sentry)
- User-friendly error messages
- Retry mechanisms

#### 2. Advanced Caching
- Redis implementation
- Cache invalidation strategies
- Cache warming
- Distributed caching

#### 3. API Documentation
- OpenAPI/Swagger specification
- Interactive API documentation
- Postman collections
- Code examples

#### 4. Security Enhancements
- Rate limiting
- Input sanitization
- CSRF protection
- Security headers (Helmet.js)
- Audit logging

#### 5. Monitoring & Observability
- Application performance monitoring (APM)
- Logging aggregation (ELK stack)
- Metrics dashboard (Grafana)
- Alerting system

#### 6. Database Optimization
- Query performance analysis
- Additional indexes
- Materialized views for dashboards
- Database connection pooling tuning

#### 7. Testing Coverage
- Increase test coverage (aim for 80%+)
- E2E tests (Playwright, Cypress)
- Performance tests
- Security tests

#### 8. Documentation
- API documentation
- Developer guides
- Deployment guides
- Architecture diagrams

### Known Limitations

#### Current Limitations

1. **No Pagination**
   - All courses/users returned at once
   - **Impact**: Performance issues with large datasets
   - **Mitigation**: Implement pagination

2. **No Search Functionality**
   - Can't search courses/users
   - **Impact**: Poor user experience for large catalogs
   - **Mitigation**: Add search with full-text search (PostgreSQL)

3. **No File Uploads**
   - No course images, user avatars
   - **Impact**: Less engaging UI
   - **Mitigation**: Add file storage (S3, Cloudinary)

4. **No Email Notifications**
   - Password reset, welcome emails missing
   - **Impact**: Poor user experience
   - **Mitigation**: Add email service (SendGrid, AWS SES)

5. **No Background Jobs**
   - All operations are synchronous
   - **Impact**: Slow responses for heavy operations
   - **Mitigation**: Queue system (Bull, AWS SQS)

6. **Limited Analytics**
   - Basic dashboard metrics
   - **Impact**: Limited insights
   - **Mitigation**: Advanced analytics, data warehouse

7. **No Mobile App**
   - Web-only application
   - **Impact**: Limited accessibility
   - **Mitigation**: Progressive Web App (PWA), React Native

8. **No Internationalization**
   - English-only interface
   - **Impact**: Limited global reach
   - **Mitigation**: i18n support (next-intl)

#### Technical Debt

1. **Code Duplication**
   - Some repeated patterns
   - **Action**: Extract shared utilities

2. **Type Safety**
   - Backend not using TypeScript
   - **Action**: Migrate to TypeScript (gradual)

3. **Configuration Management**
   - Basic environment variables
   - **Action**: Configuration management library

4. **Logging**
   - Console logging
   - **Action**: Structured logging (Winston, Pino)

---

## Conclusion

The Learning Tracker application is built with a focus on:
- **Simplicity**: Easy to understand and maintain
- **Scalability**: Architecture supports growth
- **Developer Experience**: Modern tools and patterns
- **User Experience**: Clean, responsive UI

While there are areas for improvement, the current architecture provides a solid foundation that can evolve as requirements change and the application grows.
