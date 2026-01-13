// Author: Sourav Kumar Das
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, courseAPI } from '@/services/api';
import Layout from '@/components/Layout';
import { toast } from 'react-hot-toast';

interface PendingAdmin {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  access: boolean;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  fees?: string;
  created_at: string;
  enrollmentCount?: number;
}

export default function AdminManagePage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'admins' | 'courses'>('admins');
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState<Course | null>(null);
  const [showCreateModule, setShowCreateModule] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    fees: '',
  });
  const [moduleForm, setModuleForm] = useState({
    title: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (user && isAdmin) {
      if (activeTab === 'admins') {
        fetchPendingAdmins();
      } else {
        fetchCourses();
      }
    }
  }, [user, isAdmin, activeTab]);

  const fetchPendingAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingAdmins();
      setPendingAdmins(response.data.admins || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch pending admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAllCoursesAdmin();
      setCourses(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleGiveAdminAccess = async (email: string) => {
    try {
      setGrantingAccess(true);
      await adminAPI.giveAdminAccess(email);
      toast.success('Admin access granted successfully!');
      fetchPendingAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to grant admin access');
    } finally {
      setGrantingAccess(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await courseAPI.createCourse({
        title: courseForm.title,
        description: courseForm.description || undefined,
        fees: courseForm.fees || undefined,
      });
      toast.success('Course created successfully!');
      setShowCreateCourse(false);
      setCourseForm({ title: '', description: '', fees: '' });
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create course');
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditCourse) return;
    try {
      await courseAPI.updateCourse(showEditCourse.id, {
        title: courseForm.title || undefined,
        description: courseForm.description || undefined,
        fees: courseForm.fees || undefined,
      });
      toast.success('Course updated successfully!');
      setShowEditCourse(null);
      setCourseForm({ title: '', description: '', fees: '' });
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseAPI.deleteCourse(id);
      toast.success('Course deleted successfully!');
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete course');
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCreateModule) return;
    try {
      await courseAPI.createModule(showCreateModule, {
        title: moduleForm.title,
      });
      toast.success('Module created successfully!');
      setShowCreateModule(null);
      setModuleForm({ title: '' });
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create module');
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
    <Layout isAdmin>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Admin Management</h2>
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admins'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Admins
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Course Management
            </button>
          </nav>
        </div>

        {/* Pending Admins Tab */}
        {activeTab === 'admins' && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Grant Admin Access
              </h3>
              <div className="flex gap-4">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={() => {
                    if (adminEmail) {
                      handleGiveAdminAccess(adminEmail);
                      setAdminEmail('');
                    }
                  }}
                  disabled={grantingAccess || !adminEmail}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {grantingAccess ? 'Granting...' : 'Grant Access'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Pending Admin Approvals ({pendingAdmins.length})
              </h3>
              {pendingAdmins.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <p className="text-gray-500">No pending admin approvals</p>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingAdmins.map((admin) => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {admin.first_name} {admin.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleGiveAdminAccess(admin.email)}
                              disabled={grantingAccess}
                              className="text-primary-600 hover:text-primary-900 disabled:opacity-50"
                            >
                              Grant Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Course Management Tab */}
        {activeTab === 'courses' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Courses ({courses.length})
              </h3>
              <button
                onClick={() => {
                  setShowCreateCourse(true);
                  setCourseForm({ title: '', description: '', fees: '' });
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Create Course
              </button>
            </div>

            {/* Create Course Modal */}
            {showCreateCourse && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h4 className="text-xl font-semibold mb-4">Create Course</h4>
                  <form onSubmit={handleCreateCourse}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={courseForm.title}
                          onChange={(e) =>
                            setCourseForm({ ...courseForm, title: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={courseForm.description}
                          onChange={(e) =>
                            setCourseForm({ ...courseForm, description: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Fees
                        </label>
                        <input
                          type="text"
                          value={courseForm.fees}
                          onChange={(e) =>
                            setCourseForm({ ...courseForm, fees: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateCourse(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Course Modal */}
            {showEditCourse && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h4 className="text-xl font-semibold mb-4">Edit Course</h4>
                  <form onSubmit={handleUpdateCourse}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Title
                        </label>
                        <input
                          type="text"
                          value={courseForm.title}
                          onChange={(e) =>
                            setCourseForm({ ...courseForm, title: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={courseForm.description}
                          onChange={(e) =>
                            setCourseForm({ ...courseForm, description: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Fees
                        </label>
                        <input
                          type="text"
                          value={courseForm.fees}
                          onChange={(e) =>
                            setCourseForm({ ...courseForm, fees: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditCourse(null);
                          setCourseForm({ title: '', description: '', fees: '' });
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Create Module Modal */}
            {showCreateModule && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h4 className="text-xl font-semibold mb-4">Create Module</h4>
                  <form onSubmit={handleCreateModule}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Module Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={moduleForm.title}
                          onChange={(e) =>
                            setModuleForm({ ...moduleForm, title: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModule(null);
                          setModuleForm({ title: '' });
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Courses List */}
            {courses.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">No courses available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white shadow rounded-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h4>
                      {course.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      {course.fees && (
                        <p className="text-sm text-gray-500 mb-4">Fees: {course.fees}</p>
                      )}
                      <p className="text-sm font-medium text-gray-700 mb-4">
                        Enrollments: {course.enrollmentCount || 0}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setShowEditCourse(course);
                            setCourseForm({
                              title: course.title,
                              description: course.description || '',
                              fees: course.fees || '',
                            });
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setShowCreateModule(course.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Add Module
                        </button>
                        <button
                          onClick={() => router.push(`/courses/${course.id}/modules`)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                        >
                          View Modules
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
