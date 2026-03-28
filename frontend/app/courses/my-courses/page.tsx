// Author: Sourav Kumar Das
'use client'

import React, { useEffect, useState } from 'react'
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
  modules?: { id: string; title: string; created_at: string }[];
}

const CARD_ACCENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-rose-500',
  'from-sky-500 to-cyan-600',
  'from-violet-500 to-indigo-600',
];

export default function MyCoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchMyCourses();
  }, [user]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getMyCourses();
      setCourses(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading your courses…</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0 animate-fade-in">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Courses</h2>
            <p className="text-gray-500 mt-1 text-sm">
              {courses.length > 0
                ? `You are enrolled in ${courses.length} course${courses.length !== 1 ? 's' : ''}`
                : 'Start learning by enrolling in a course'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/courses')} className="btn-secondary">
              Browse Courses
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Empty state */}
        {courses.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-soft">
              <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Enroll in a course to start tracking your progress and building your skills.
            </p>
            <button
              onClick={() => router.push('/courses')}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-medium hover:shadow-large hover:-translate-y-0.5 transition-all"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => {
              const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
              const moduleCount = course.modules?.length ?? 0;
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-soft border border-gray-100 card-hover overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.07}s` }}
                >
                  {/* Coloured accent strip */}
                  <div className={`h-1.5 bg-gradient-to-r ${accent}`} />

                  <div className="p-6">
                    {/* Icon + title */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-soft`}>
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
                          {course.title}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    {course.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}

                    {/* Meta badges */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="badge bg-blue-50 text-blue-700">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {moduleCount} module{moduleCount !== 1 ? 's' : ''}
                      </span>
                      {course.fees && (
                        <span className="badge bg-amber-50 text-amber-700">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          {course.fees}
                        </span>
                      )}
                      <span className="badge bg-emerald-50 text-emerald-700">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Enrolled
                      </span>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => router.push(`/courses/${course.id}/modules`)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Continue Learning
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
