# 📚 Learning Tracker Application

A production-grade **Learning Tracker** web application that enables users to track their learning progress across courses and modules.  
This project is intentionally designed to demonstrate **engineering maturity, clean architecture, scalability, and design clarity** rather than excessive features.

---

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Backend Design](#-backend-design)
- [Frontend Design](#-frontend-design)
- [API Design](#-api-design)
- [Database Design](#-database-design)
- [Authentication & Security](#-authentication--security)
- [Error Handling & Validation](#-error-handling--validation)
- [Scalability & Future Enhancements](#-scalability--future-enhancements)
- [Environment Variables](#-environment-variables)
- [Setup & Run Instructions](#-setup--run-instructions)
- [Evaluation Focus](#-evaluation-focus)
- [Author](#-author)

---

## 📖 Project Overview

Learning Tracker allows users to:
- Organize learning content into **Courses**
- Break courses into **Modules**
- Track learning progress at a module level
- View aggregated learning metrics on a dashboard

The application is built with **real-world backend architecture principles** and a **clean frontend structure**.

---

## 🚀 Core Features

### User Management
- Signup & Login
- JWT-based authentication
- Protected APIs

### Course Management
- Create, update, delete courses
- View all user courses

### Module Management
- Add modules under courses
- Update module progress (percentage-based)
- Track time spent (manual/dummy input)

### Dashboard
- Overall progress across all courses
- Total learning time spent
- Last active course

---

## 🛠 Tech Stack

### Frontend
- **Next.js**
- **React**
- **Tailwind CSS**
- Axios / Fetch API

### Backend
- **Node.js**
- **Express.js**
- **JWT Authentication**

### Database
- **Supabase (PostgreSQL)**

---

## 🧠 System Architecture

The backend follows a **layered architecture**:

```
Controller → Service → Repository → Database
```

### Why this architecture?
- Separation of concerns
- Easier testing & maintenance
- Scalable for future features
- Industry-standard backend design

---

## 📁 Backend Design

### Folder Structure

```
backend/
├── src/
│   ├── controllers/      # Handle HTTP requests/responses
│   ├── services/         # Business logic
│   ├── repositories/     # Database queries (Supabase)
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth & error handling
│   ├── validators/       # Request validation
│   ├── utils/            # Helpers (JWT, responses)
│   ├── config/           # Supabase & env config
│   └── app.js
├── package.json
└── README.md
```

### Responsibilities
- **Controllers**: Input/output only
- **Services**: Core logic & rules
- **Repositories**: Database access only

---

## 🖥 Frontend Design

### Folder Structure

```
frontend/
├── app/
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   ├── courses/
│   └── layout.js
├── components/
│   ├── common/
│   ├── courses/
│   └── dashboard/
├── services/
│   └── api.js
├── hooks/
│   └── useAuth.js
└── styles/
```

### Frontend Principles
- Reusable components
- Centralized API layer
- Clean state handling
- Proper loading, error & empty states

---

## 🔗 API Design

### Authentication
| Method | Endpoint | Description |
|------|---------|-------------|
| POST | /auth/signup | Register user |
| POST | /auth/login | Login user |

### Courses
| Method | Endpoint | Description |
|------|---------|-------------|
| POST | /courses | Create course |
| GET | /courses | List courses |
| GET | /courses/:id | Course details |
| PUT | /courses/:id | Update course |
| DELETE | /courses/:id | Delete course |

### Modules
| Method | Endpoint | Description |
|------|---------|-------------|
| POST | /courses/:courseId/modules | Create module |
| GET | /courses/:courseId/modules | List modules |
| PATCH | /modules/:id/progress | Update progress |

### Dashboard
| Method | Endpoint | Description |
|------|---------|-------------|
| GET | /dashboard | Aggregated metrics |

---

## 🗄 Database Design

### Tables (High-Level)
- **users**
- **courses**
- **modules**

### Relationships
- One user → many courses
- One course → many modules

---

## 🔐 Authentication & Security

- JWT-based authentication
- Authorization middleware
- Secure token validation
- User-specific data isolation

---

## ⚠️ Error Handling & Validation

- Centralized error middleware
- Consistent API responses
- Request validation layer
- Proper HTTP status codes

---

## 🌱 Scalability & Future Enhancements

### Role-Based Access Control (RBAC)
- Add `role` column in users table
- Middleware-based permission checks

### Teams / Organizations
- Organizations table
- Users mapped to organizations
- Courses scoped per organization

### API Versioning
```
/api/v1/...
/api/v2/...
```

### Additional Enhancements
- Pagination & filtering
- Activity logs
- Analytics & reports

---

## ⚙️ Environment Variables

### Backend
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
JWT_SECRET=
```

### Frontend
```
NEXT_PUBLIC_API_BASE_URL=
```

---

## ▶️ Setup & Run Instructions

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 Evaluation Focus

This project demonstrates:
- Clean backend architecture
- Scalable design thinking
- Proper API abstraction
- Frontend engineering best practices

---

## 👨‍💻 Author

**Sourav Kumar Das**  
Software Engineer | Backend & Full-Stack Developer
