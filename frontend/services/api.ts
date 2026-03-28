import axios from 'axios';

// Author: Sourav Kumar Das
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5500';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAdmin');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
  }) => api.post('/auth/signup', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
};

// Course APIs
export const courseAPI = {
  getAllCourses: () => api.get('/courses'),
  
  getMyCourses: () => api.get('/courses/my-courses'),
  
  getModulesByCourse: (courseId: string) =>
    api.get(`/courses/${courseId}/modules`),
  
  optForCourse: (courseId: string) =>
    api.post(`/courses/${courseId}/opt`),
  
  updateModuleProgress: (moduleId: string) =>
    api.put(`/courses/modules/${moduleId}/progress`),
  
  // Admin APIs
  createCourse: (data: { title: string; description?: string; fees?: string }) =>
    api.post('/courses/admin/create-course', data),
  
  updateCourse: (id: string, data: { title?: string; description?: string; fees?: string }) =>
    api.put(`/courses/admin/${id}`, data),
  
  deleteCourse: (id: string) =>
    api.delete(`/courses/admin/${id}`),
  
  createModule: (courseId: string, data: { title: string }) =>
    api.post(`/courses/admin/${courseId}/modules`, data),
  
  getAllCoursesAdmin: () => api.get('/courses/admin/allcourse'),
};

// Dashboard APIs
export const dashboardAPI = {
  getUserDashboard: () => api.get('/dashboard'),
  
  getAdminDashboard: () => api.get('/dashboard/admin'),
};

// Admin Auth APIs
export const adminAuthAPI = {
  signup: (data: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    return axios.post(`${API_BASE_URL}/admin/adminsignup`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  },
  
  login: (data: { email: string; password: string }) =>
    axios.post(`${API_BASE_URL}/admin/adminlogin`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  
  logout: () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    return axios.post(`${API_BASE_URL}/admin/adminlogout`, {}, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  },
};

// Admin APIs
export const adminAPI = {
  giveAdminAccess: (email: string) =>
    api.post('/admin/giveadminaccess', { email }),

  getPendingAdmins: () => api.get('/admin/pendingadmins'),
};

// AI APIs
export const aiAPI = {
  // User
  getInsight: (dashboardData: object) =>
    api.post('/ai/insights', { dashboardData }),

  askAssistant: (data: {
    moduleTitle: string;
    courseTitle: string;
    question: string;
    history: { role: string; content: string }[];
  }) => api.post('/ai/ask', data),

  getQuiz: (moduleTitle: string, courseTitle: string) =>
    api.post('/ai/quiz', { moduleTitle, courseTitle }),

  getRecommendations: (enrolledTitles: string[], availableCourses: { id: string; title: string }[]) =>
    api.post('/ai/recommendations', { enrolledTitles, availableCourses }),

  chat: (question: string, history: { role: string; content: string }[], dashboardContext?: object) =>
    api.post('/ai/chat', { question, history, dashboardContext }),

  // Admin
  getAdminSummary: (dashboardData: object) =>
    api.post('/ai/admin-summary', { dashboardData }),

  getAtRiskAnalysis: (dashboardData: object) =>
    api.post('/ai/at-risk-analysis', { dashboardData }),

  generateCourseDescription: (courseTitle: string) =>
    api.post('/ai/course-description', { courseTitle }),

  adminChat: (question: string, history: { role: string; content: string }[], dashboardContext?: object) =>
    api.post('/ai/admin-chat', { question, history, dashboardContext }),

  getContentGapAnalysis: (dashboardData: object) =>
    api.post('/ai/content-gap', { dashboardData }),
};

export default api;
