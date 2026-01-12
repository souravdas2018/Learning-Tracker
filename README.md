# Author: Sourav Kumar Das

# Learning Tracker

A comprehensive learning management system built with modern web technologies, designed to track user progress, manage courses, and provide analytics dashboards for both users and administrators.

## 🎯 Overview

Learning Tracker is a full-stack application that enables users to enroll in courses, track their learning progress, and view detailed analytics. Administrators can manage courses, modules, users, and view comprehensive system analytics.

## ✨ Features

### User Features
- 🔐 **Authentication** - Secure login/signup with JWT tokens
- 📊 **Dashboard** - Personal dashboard with progress tracking and visualizations
- 📚 **Course Management** - Browse, enroll, and track courses
- 📈 **Progress Tracking** - Update and monitor module completion progress
- ⏱️ **Time Tracking** - Track time spent on learning activities

### Admin Features
- 👥 **User Management** - View user statistics and activity
- 📝 **Course CRUD** - Create, update, and delete courses
- 📦 **Module Management** - Add modules to courses
- 📊 **Analytics Dashboard** - Comprehensive analytics with charts and metrics
- 🔑 **Admin Access Control** - Approve pending admin registrations
- 📈 **Enrollment Tracking** - Monitor course enrollments

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL (Supabase)** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Infrastructure
- **Nginx** - Load balancer and reverse proxy
- **Supabase** - Backend as a Service (Database)

## 📁 Project Structure

```
Learning-Tracker/
├── backend/              # Backend API server
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── repositories/# Data access layer
│   │   ├── routes/      # API routes
│   │   ├── middlewares/ # Authentication & authorization
│   │   └── utils/       # Utility functions
│   ├── database/        # Database schema and migrations
│   └── server.js        # Server entry point
├── frontend/            # Next.js frontend application
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   └── services/       # API services
├── test-case/          # Test suites
│   ├── backend/        # Backend tests
│   └── frontend/       # Frontend tests
├── infrastructure/     # Infrastructure configuration
│   └── nginx.conf      # Load balancer configuration
└── .github/
    └── workflows/      # CI/CD workflows
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Nginx (for production load balancing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Learning-Tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure .env with your database credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Configure NEXT_PUBLIC_API_BASE_URL
   npm run dev
   ```

4. **Database Setup**
   ```bash
   cd backend/database
   # Run schema.sql on your PostgreSQL database
   ```

5. **Access the Application**
   - Frontend: http://localhost:3500
   - Backend API: http://localhost:5500

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5500
JWT_SECRET=your-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5500
```

## 📖 Documentation

- [DESIGN.md](./DESIGN.md) - Architecture and design decisions
- [backend/README.md](./backend/README.md) - Backend documentation
- [backend/DESIGN.md](./backend/DESIGN.md) - Backend architecture
- [frontend/README.md](./frontend/README.md) - Frontend documentation
- [frontend/DESIGN.md](./frontend/DESIGN.md) - Frontend architecture
- [test-case/README.md](./test-case/README.md) - Testing documentation
- [infrastructure/README.md](./infrastructure/README.md) - Infrastructure setup

## 🧪 Testing

Tests are located in the `test-case` directory and run automatically on the `testing` branch.

```bash
# Backend tests
cd test-case/backend
npm install
npm test

# Frontend tests
cd test-case/frontend
npm install
npm test
```

## 🌐 Deployment

### Load Balancer Setup
See [infrastructure/README.md](./infrastructure/README.md) for Nginx load balancer configuration.

### Production Considerations
- Use environment-specific configurations
- Set up proper SSL/TLS certificates
- Configure database connection pooling
- Enable logging and monitoring
- Set up backup and disaster recovery

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Submit a pull request to the `testing` branch

## 📝 License

[Specify your license here]

## 👥 Authors

[Specify authors here]

## 🙏 Acknowledgments

- Supabase for database hosting
- Next.js team for the amazing framework
- All open-source contributors
