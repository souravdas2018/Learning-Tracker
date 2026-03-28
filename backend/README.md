Author: Sourav Kumar Das

# Learning Tracker Backend

RESTful API backend for the Learning Tracker application built with Node.js and Express.js.

## Features

- 🔐 User and Admin Authentication (JWT-based)
- 📚 Course Management (CRUD operations)
- 📦 Module Management
- 📊 Dashboard Analytics (User and Admin)
- 📈 Progress Tracking
- 👥 User Enrollment Management
- 🔑 Admin Access Control
- 🤖 AI Features — learning insights, study assistant, quiz generation, recommendations, course descriptions, risk analysis, content gap analysis, and admin/user chat (Gemini + Groq)

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database (via Supabase)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Google Gemini API** (`gemini-1.5-flash`) - Primary AI provider
- **Groq API** (`llama-3.3-70b-versatile`) - Fallback AI provider

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase account)
- Environment variables configured

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure `.env`:
   ```env
   PORT=5500
   JWT_SECRET=your-secret-key-here
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-1.5-flash
   GROQ_API_KEY=your-groq-api-key
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

3. **Set up database**
   ```bash
   cd database
   # Run schema.sql on your PostgreSQL database
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Start production server**
   ```bash
   npm start
   ```

The server will run on `http://localhost:5500` (or the PORT specified in .env).

## Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── config/
│   │   └── supabase.js       # Supabase client configuration
│   ├── controllers/          # Request handlers
│   │   ├── admin.controller.js
│   │   ├── ai.controller.js   # AI endpoint handlers
│   │   ├── auth.controller.js
│   │   ├── course.controller.js
│   │   ├── dashboard.controller.js
│   │   └── userCourse.controller.js
│   ├── services/             # Business logic
│   │   ├── admin.service.js
│   │   ├── ai.service.js      # Gemini + Groq AI integration
│   │   ├── auth.service.js
│   │   ├── course.service.js
│   │   ├── dashboard.service.js
│   │   └── userCourse.service.js
│   ├── repositories/         # Data access layer
│   │   ├── admin.repo.js
│   │   ├── auth.repo.js
│   │   ├── course.repo.js
│   │   ├── dashboard.repo.js
│   │   └── userCourse.repo.js
│   ├── routes/               # API routes
│   │   ├── admin.routes.js
│   │   ├── ai.routes.js       # AI endpoints
│   │   ├── auth.routes.js
│   │   ├── course.routes.js
│   │   └── dashboard.routes.js
│   ├── middlewares/          # Middleware functions
│   │   ├── admin.middleware.js
│   │   └── auth.middleware.js
│   └── utils/
│       └── jwt.js            # JWT token generation
├── database/
│   ├── schema.sql           # Database schema
│   └── migrations/          # Database migrations
└── server.js                # Server entry point
```

## API Endpoints

### Authentication (`/auth`)

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout (requires auth)

### Admin (`/admin`)

- `POST /admin/adminsignup` - Admin registration
- `POST /admin/adminlogin` - Admin login
- `POST /admin/adminlogout` - Admin logout (requires admin auth)
- `POST /admin/giveadminaccess` - Grant admin access (requires admin auth)
- `GET /admin/pendingadmins` - Get pending admin approvals (requires admin auth)

### Courses (`/courses`)

**User Endpoints:**
- `GET /courses` - Get all courses (requires auth)
- `GET /courses/:courseId/modules` - Get course modules (requires auth)
- `POST /courses/:courseId/opt` - Enroll in course (requires auth)
- `GET /courses/my-courses` - Get user's enrolled courses (requires auth)
- `PUT /courses/modules/:moduleId/progress` - Update module progress (requires auth)

**Admin Endpoints:**
- `POST /courses/admin/create-course` - Create course (requires admin auth)
- `PUT /courses/admin/:id` - Update course (requires admin auth)
- `DELETE /courses/admin/:id` - Delete course (requires admin auth)
- `POST /courses/admin/:courseId/modules` - Create module (requires admin auth)
- `GET /courses/admin/allcourse` - Get all courses with enrollment counts (requires admin auth)

### Dashboard (`/dashboard`)

- `GET /dashboard` - User dashboard data (requires auth)
- `GET /dashboard/admin` - Admin dashboard data (requires admin auth)

### AI (`/ai`)

**User Endpoints (JWT auth):**
- `POST /ai/insights` - Generate personalised learning insight from dashboard data
- `POST /ai/ask` - Study assistant Q&A for a specific module/course
- `POST /ai/quiz` - Generate 5-question multiple-choice quiz for a module
- `POST /ai/recommendations` - Suggest unenrolled courses based on learning history
- `POST /ai/chat` - General-purpose learning assistant chat with dashboard context

**Admin Endpoints (admin JWT auth):**
- `POST /ai/admin-summary` - Executive health summary of the platform
- `POST /ai/at-risk-analysis` - Engagement risk analysis with actionable recommendations
- `POST /ai/course-description` - Generate a course description from a title
- `POST /ai/admin-chat` - Admin-aware conversational assistant with platform context
- `POST /ai/content-gap` - Identify content gaps and suggest new course topics

**AI Provider Strategy:**
- Primary: Google Gemini (`gemini-1.5-flash`) — tried first on every call
- Fallback: Groq (`llama-3.3-70b-versatile`) — used automatically if Gemini fails
- All AI responses are non-blocking; failures are silently swallowed on the frontend for non-critical features

## Authentication

### JWT Tokens

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login/Signup**: Returns a JWT token
2. **Authenticated Requests**: Include token in Authorization header
   ```
   Authorization: Bearer <token>
   ```
3. **Token Expiry**: Tokens expire after 1 hour

### Middleware

- **authMiddleware**: Verifies user JWT tokens
- **adminMiddleware**: Verifies admin JWT tokens and admin access

## Database Schema

See `database/schema.sql` for the complete database schema.

### Main Tables

- `users` - User accounts
- `admin` - Admin accounts
- `courses` - Course catalog
- `modules` - Course modules
- `user_courses` - User enrollments
- `user_module_progress` - Progress tracking

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Run locally (recommended - Docker)

Prerequisite: Docker & Docker Compose installed.

```bash
# start both services (frontend + backend)
docker-compose up --build

# backend will be available at http://localhost:5500
# frontend at http://localhost:3500
```

### Run locally (node)

```bash
cd backend
npm install
cp .env.example .env
# configure .env
npm run dev
```

### Tests

See the `test-case` folder for unit and integration tests. The `testing` branch runs tests in CI.

### CI / CD

This project includes a GitHub Actions workflow `.github/workflows/deploy-production.yml` that can deploy via Docker Compose to an EC2 host. See root `README.md` and `DEPLOY.md` for details.


- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Code Style

- Use consistent naming conventions
- Follow the layered architecture pattern
- Add comments for complex logic
- Handle errors appropriately

## Testing

Tests are located in `../test-case/backend/`. Run tests:

```bash
cd ../test-case/backend
npm test
```

## Security Considerations

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens signed with secret key
- SQL injection prevention (Supabase handles parameterized queries)
- CORS configured for frontend origin
- Environment variables for sensitive data

## Performance

- Database connection pooling (via Supabase)
- Efficient queries with proper indexes
- Response compression (can be added via middleware)
- Connection timeouts configured

## Deployment

See the main [README.md](../README.md) and [DESIGN.md](./DESIGN.md) for deployment details.

For production:
1. Set environment variables
2. Use process manager (PM2, systemd)
3. Set up load balancer (see `infrastructure/nginx.conf`)
4. Configure logging
5. Set up monitoring
