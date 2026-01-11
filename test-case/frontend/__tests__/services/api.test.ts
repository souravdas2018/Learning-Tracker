import axios from 'axios';
import { authAPI, courseAPI, adminAPI } from '../../../../frontend/services/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();

    // Mock axios.create
    mockedAxios.create = jest.fn(() => mockedAxios as any);
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

      (mockedAxios.post as jest.Mock).mockResolvedValue({ data: {} });

      await authAPI.signup(signupData);

      expect(mockedAxios.post).toHaveBeenCalled();
    });

    test('should call login endpoint', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      (mockedAxios.post as jest.Mock).mockResolvedValue({ data: {} });

      await authAPI.login(loginData);

      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('courseAPI', () => {
    test('should call getAllCourses endpoint', async () => {
      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

      await courseAPI.getAllCourses();

      expect(mockedAxios.get).toHaveBeenCalled();
    });

    test('should call createCourse endpoint', async () => {
      const courseData = {
        title: 'New Course',
        description: 'Description',
        fees: '100',
      };

      (mockedAxios.post as jest.Mock).mockResolvedValue({ data: {} });

      await courseAPI.createCourse(courseData);

      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('adminAPI', () => {
    test('should call giveAdminAccess endpoint', async () => {
      (mockedAxios.post as jest.Mock).mockResolvedValue({ data: {} });

      await adminAPI.giveAdminAccess('admin@example.com');

      expect(mockedAxios.post).toHaveBeenCalled();
    });

    test('should call getPendingAdmins endpoint', async () => {
      (mockedAxios.get as jest.Mock).mockResolvedValue({ data: {} });

      await adminAPI.getPendingAdmins();

      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });
});
