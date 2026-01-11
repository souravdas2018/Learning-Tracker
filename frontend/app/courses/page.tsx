'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { courseAPI } from '@/services/api';
import Layout from '@/components/Layout';
import { toast } from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description?: string;
  fees?: string;
  created_at: string;
  modules?: Module[];
}

interface Module {
  id: string;
  title: string;
  created_at: string;
}

export default function CoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAllCourses();
      setCourses(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleOptForCourse = async (courseId: string) => {
    try {
      await courseAPI.optForCourse(courseId);
      toast.success('Successfully enrolled in course!');
      router.push('/courses/my-courses');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to enroll in course');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">All Courses</h2>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/courses/my-courses')}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              My Courses
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No courses available</p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  {course.fees && (
                    <p className="text-sm text-gray-500 mb-4">
                      Fees: {course.fees}
                    </p>
                  )}
                  {course.modules && (
                    <p className="text-sm text-gray-500 mb-4">
                      {course.modules.length} module
                      {course.modules.length !== 1 ? 's' : ''}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOptForCourse(course.id)}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
                    >
                      Enroll
                    </button>
                    <button
                      onClick={() => router.push(`/courses/${course.id}/modules`)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
