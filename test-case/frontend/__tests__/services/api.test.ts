// Set environment variable before any imports
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:5500';

// Mock axios before importing anything
const mockAxiosInstance = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: { 
      use: jest.fn((onFulfilled, onRejected) => {
        // Return interceptor ID
        return 0;
      })
    },
    response: { 
      use: jest.fn((onFulfilled, onRejected) => {
        // Return interceptor ID
        return 0;
      })
    },
  },
};

const mockAxios = {
  __esModule: true,
  default: {
    create: jest.fn(() => mockAxiosInstance),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    get: jest.fn(() => Promise.resolve({ data: {} })),
  },
  create: jest.fn(() => mockAxiosInstance),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
};

jest.mock('axios', () => mockAxios);

// Mock window and localStorage
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
}

import { authAPI, courseAPI, adminAPI } from '../../../../frontend/services/api';

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosInstance.get.mockResolvedValue({ data: {} });
    mockAxiosInstance.post.mockResolvedValue({ data: {} });
    mockAxiosInstance.put.mockResolvedValue({ data: {} });
    mockAxiosInstance.delete.mockResolvedValue({ data: {} });
  });

  describe('authAPI', () => {
    test('should call signup endpoint', async () => {
      const signupData = {
        first_name: 'John',
        last_name: 'Doe',
        phone: '1234567890',
        email: 'john@example.com',
        password: 'password123',
      };

      await authAPI.signup(signupData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/signup', signupData);
    });

    test('should call login endpoint', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      await authAPI.login(loginData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', loginData);
    });
  });

  describe('courseAPI', () => {
    test('should call getAllCourses endpoint', async () => {
      await courseAPI.getAllCourses();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/courses');
    });

    test('should call createCourse endpoint', async () => {
      const courseData = {
        title: 'New Course',
        description: 'Description',
        fees: '100',
      };

      await courseAPI.createCourse(courseData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/courses/admin/create-course', courseData);
    });
  });

  describe('adminAPI', () => {
    test('should call giveAdminAccess endpoint', async () => {
      await adminAPI.giveAdminAccess('admin@example.com');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/admin/giveadminaccess', { email: 'admin@example.com' });
    });

    test('should call getPendingAdmins endpoint', async () => {
      await adminAPI.getPendingAdmins();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/pendingadmins');
    });
  });
});
