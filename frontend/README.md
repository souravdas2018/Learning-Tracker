# Learning Tracker Frontend

A modern, beautiful Next.js frontend for the Learning Tracker application with data visualization dashboards and an intuitive user interface.

## Features

- 🔐 User Authentication (Login/Signup) with beautiful UI
- 📊 User Dashboard with Charts (Progress, Course Status)
- 🔧 Admin Dashboard with Analytics Charts
- 📚 Course Management with attractive cards
- 📈 Module Progress Tracking
- 🎨 Modern, Attractive UI with Tailwind CSS
- 📱 Fully Responsive Design
- ✨ Smooth Animations and Transitions
- 🎯 Intuitive User Experience

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

3. Run the development server (runs on port 3500):
```bash
npm run dev
```

4. Open [http://localhost:3500](http://localhost:3500) in your browser

**Note:** The frontend runs on port 3500, while the backend should run on a different port (default: 3000). Make sure `NEXT_PUBLIC_API_BASE_URL` points to your backend server port.

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── dashboard/           # User dashboard
│   │   └── admin/           # Admin dashboard
│   └── courses/             # Course pages
├── components/              # Reusable components
│   └── Layout.tsx           # Main layout component
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication context
├── services/                # API services
│   └── api.ts              # API client
└── public/                  # Static assets
```

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_BASE_URL`.

All API calls are centralized in `services/api.ts` with automatic token injection.

## Features Overview

### User Dashboard
- Overall progress visualization
- Total time spent tracking
- Course status distribution (Pie Chart)
- Enrolled and completed courses count
- Last active course information

### Admin Dashboard
- User statistics (Active/Inactive)
- Course and module statistics
- Enrollment analytics
- Engagement metrics
- Most popular course
- Admin management stats

### Course Management
- Browse all available courses
- View enrolled courses
- Enroll in new courses
- Track module progress
- Update learning progress

## Building for Production

```bash
npm run build
npm start
```

## Port Configuration

- **Frontend:** Runs on port 3500 (configured in `package.json`)
- **Backend:** Should run on port 3000 (or configure `NEXT_PUBLIC_API_BASE_URL` accordingly)

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL (default: http://localhost:3000)
