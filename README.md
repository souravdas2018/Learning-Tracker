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

### CI / CD (GitHub Actions -> EC2)

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-production.yml` that builds the `frontend` and packages both `frontend` and `backend` artifacts, copies them to an AWS EC2 instance over SSH, installs dependencies, and runs/restarts the apps using `pm2`.

Required GitHub repository secrets (Settings → Secrets):
- `SSH_PRIVATE_KEY` — private key (PEM) for the EC2 user (no passphrase preferred for automation)
- `SSH_HOST` — EC2 public IP or DNS name
- `SSH_USER` — SSH user on EC2 (e.g. `ubuntu`, `ec2-user`)
- `SSH_PORT` — SSH port (usually `22`)
- `DEPLOY_PATH` — server directory to deploy into (e.g. `/var/www/learning-tracker`)

Server checklist (target EC2):
- Node.js (v18+ or v20 recommended)
- `pm2` (workflow installs globally if missing)
- Sufficient filesystem permissions for the supplied `SSH_USER` to write into `DEPLOY_PATH`
- (Optional) A reverse proxy (Nginx) and SSL certs pointing to the frontend port

How the workflow works (summary):
- On push to the `production` branch the workflow runs on `ubuntu-latest`.
- It builds the Next.js frontend, packages `frontend` and `backend` into tarballs and copies them to `/tmp` on the EC2 host.
- Over SSH the workflow extracts artifacts into `${DEPLOY_PATH}/frontend` and `${DEPLOY_PATH}/backend`, installs production dependencies, runs a build for Next, and uses `pm2` to start/restart `frontend` and `backend` processes.

Testing tips (from a dev machine):
```bash
# Create artifacts locally (simulate the workflow)
tar -C frontend -czf /tmp/frontend.tar.gz .
tar -C backend -czf /tmp/backend.tar.gz .

# Copy to server (replace values)
scp -P 22 /tmp/frontend.tar.gz ubuntu@1.2.3.4:/tmp/frontend.tar.gz
scp -P 22 /tmp/backend.tar.gz ubuntu@1.2.3.4:/tmp/backend.tar.gz

# SSH and extract on the server
ssh -p 22 ubuntu@1.2.3.4
sudo mkdir -p /var/www/learning-tracker/frontend /var/www/learning-tracker/backend
sudo tar -xzf /tmp/frontend.tar.gz -C /var/www/learning-tracker/frontend
sudo tar -xzf /tmp/backend.tar.gz -C /var/www/learning-tracker/backend
```

Alternative deployment patterns:
- Frontend to S3 + CloudFront for static hosting and better global performance.
- Backend to ECS / EKS or Elastic Beanstalk for managed containerized deployments.


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
