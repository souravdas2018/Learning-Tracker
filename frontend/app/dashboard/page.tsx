'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/services/api';
import Layout from '@/components/Layout';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  overallProgress: number;
  totalTimeSpent: number;
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  coursesInProgress: number;
  lastActiveCourse: {
    id: string;
    title: string;
    lastActivity: string;
  } | null;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getUserDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load dashboard data</p>
        </div>
      </Layout>
    );
  }

  // Chart data
  const courseStatusData = [
    { name: 'Completed', value: data.completedCoursesCount },
    { name: 'In Progress', value: data.coursesInProgress },
    {
      name: 'Not Started',
      value: data.enrolledCoursesCount - data.completedCoursesCount - data.coursesInProgress,
    },
  ];

  const progressData = [
    { name: 'Overall Progress', value: data.overallProgress },
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden rounded-xl shadow-soft border border-blue-200 card-hover">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Overall Progress</p>
                  <p className="mt-2 text-4xl font-bold text-blue-700">
                    {data.overallProgress}%
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-xl">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden rounded-xl shadow-soft border border-green-200 card-hover">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Time Spent</p>
                  <p className="mt-2 text-4xl font-bold text-green-700">
                    {formatTime(data.totalTimeSpent)}
                  </p>
                </div>
                <div className="p-3 bg-green-200 rounded-xl">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 overflow-hidden rounded-xl shadow-soft border border-indigo-200 card-hover">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Enrolled</p>
                  <p className="mt-2 text-4xl font-bold text-indigo-700">
                    {data.enrolledCoursesCount}
                  </p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-xl">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden rounded-xl shadow-soft border border-purple-200 card-hover">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Completed</p>
                  <p className="mt-2 text-4xl font-bold text-purple-700">
                    {data.completedCoursesCount}
                  </p>
                </div>
                <div className="p-3 bg-purple-200 rounded-xl">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Progress Chart */}
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Overall Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course Status Pie Chart */}
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={courseStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {courseStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Last Active Course */}
        {data.lastActiveCourse && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Last Active Course
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-medium text-gray-900">
                  {data.lastActiveCourse.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last activity:{' '}
                  {new Date(data.lastActiveCourse.lastActivity).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => router.push('/courses')}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                View Courses
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
