'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { courseAPI } from '@/services/api';
import Layout from '@/components/Layout';
import { toast } from 'react-hot-toast';

interface Module {
  id: string;
  title: string;
  created_at: string;
}

export default function ModulesPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && courseId) {
      fetchModules();
    }
  }, [user, courseId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getModulesByCourse(courseId);
      // Handle Supabase response structure: { data: [...], error: null }
      // The backend controller returns the Supabase result directly
      const modulesData = response.data?.data || response.data || [];
      // Ensure it's an array
      setModules(Array.isArray(modulesData) ? modulesData : []);
    } catch (error: any) {
      console.error('Error fetching modules:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch modules');
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (moduleId: string) => {
    try {
      setUpdatingProgress(moduleId);
      await courseAPI.updateModuleProgress(moduleId);
      toast.success('Progress updated successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update progress');
    } finally {
      setUpdatingProgress(null);
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
    <Layout isAdmin={isAdmin}>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Course Modules</h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {modules.length === 0 ? (
              <li className="px-6 py-12 text-center">
                <p className="text-gray-500">No modules available for this course</p>
              </li>
            ) : (
              modules.map((module) => (
                <li key={module.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(module.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!isAdmin && (
                      <button
                        onClick={() => handleUpdateProgress(module.id)}
                        disabled={updatingProgress === module.id}
                        className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {updatingProgress === module.id
                          ? 'Updating...'
                          : 'Update Progress'}
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
