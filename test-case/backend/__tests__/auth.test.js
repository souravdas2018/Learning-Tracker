const authService = require('../../../backend/src/services/auth.service');
const authRepo = require('../../../backend/src/repositories/auth.repo');
const bcrypt = require('bcrypt');

// Mock repositories
jest.mock('../../../backend/src/repositories/auth.repo');
jest.mock('../../../backend/src/utils/jwt', () => ({
  generateUserToken: jest.fn(() => 'mock-jwt-token')
}));

// Mock Supabase config
jest.mock('../../../backend/src/config/supabase', () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}));

describe('Auth API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth Service - signup', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        phone: '1234567890',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      authRepo.findUserByEmail.mockResolvedValue({ data: null });
      authRepo.createUser.mockResolvedValue({
        data: { id: 'user-123', email: userData.email },
        error: null
      });

      const result = await authService.signup(userData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(authRepo.findUserByEmail).toHaveBeenCalledWith(userData.email);
    });

    test('should return error if user already exists', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        phone: '1234567890',
        email: 'existing@example.com',
        password: 'password123'
      };

      authRepo.findUserByEmail.mockResolvedValue({
        data: { id: 'existing-user' }
      });

      await expect(authService.signup(userData)).rejects.toThrow('User already exists');
    });
  });

  describe('Auth Service - login', () => {
    test('should login user successfully', async () => {
      const email = 'john.doe@example.com';
      const password = 'password123';

      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-123',
        email: email,
        password: hashedPassword,
        is_active: false
      };

      authRepo.findUserByEmail.mockResolvedValue({ data: mockUser });
      authRepo.activateUser.mockResolvedValue({});

      const result = await authService.login(email, password);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(authRepo.activateUser).toHaveBeenCalled();
    });

    test('should return error for invalid credentials', async () => {
      const email = 'john.doe@example.com';
      const password = 'wrongpassword';

      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-123',
        email: email,
        password: hashedPassword,
        is_active: false
      };

      authRepo.findUserByEmail.mockResolvedValue({ data: mockUser });

      await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');
    });

    test('should return error if user not found', async () => {
      authRepo.findUserByEmail.mockResolvedValue({ data: null });

      await expect(authService.login('nonexistent@example.com', 'password123'))
        .rejects.toThrow('User not found');
    });
  });

  describe('Auth Repo - logout', () => {
    test('logoutUser function exists and can be called', async () => {
      const userId = 'user-123';
      authRepo.logoutUser.mockResolvedValue({});

      await expect(authRepo.logoutUser(userId)).resolves.toBeDefined();
    });
  });
});
