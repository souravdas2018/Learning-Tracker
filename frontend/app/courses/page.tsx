// Author: Sourav Kumar Das
'use client'

import React from 'react'
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
            courses.map((course, index) => (
              <div
                key={course.id}
                className="bg-white shadow-soft rounded-xl overflow-hidden border border-gray-100 card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>
                    </div>
                    <div className="ml-4 p-2 bg-primary-50 rounded-lg">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  {course.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.fees && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.fees}
                      </span>
                    )}
                    {course.modules && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {course.modules.length} module{course.modules.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOptForCourse(course.id)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 text-sm font-semibold shadow-medium hover:shadow-large transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Enroll Now
                    </button>
                    <button
                      onClick={() => router.push(`/courses/${course.id}/modules`)}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors border border-gray-200"
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
