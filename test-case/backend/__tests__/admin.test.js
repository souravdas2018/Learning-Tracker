const adminService = require('../../../backend/src/services/admin.service');
const adminRepo = require('../../../backend/src/repositories/admin.repo');
const bcrypt = require('bcrypt');

// Mock repositories
jest.mock('../../../backend/src/repositories/admin.repo');
jest.mock('../../../backend/src/utils/jwt', () => ({
  generateAdminToken: jest.fn(() => 'mock-admin-jwt-token')
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

describe('Admin API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin Service - signup', () => {
    test('should register a new admin successfully', async () => {
      const adminData = {
        first_name: 'Admin',
        last_name: 'User',
        phone: '1234567890',
        email: 'admin@example.com',
        password: 'admin123'
      };

      adminRepo.findByEmail.mockResolvedValue({ data: null });
      adminRepo.createAdmin.mockResolvedValue({
        data: { id: 'admin-123', email: adminData.email },
        error: null
      });

      const result = await adminService.signup(adminData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
    });

    test('should return error if admin already exists', async () => {
      const adminData = {
        first_name: 'Admin',
        last_name: 'User',
        phone: '1234567890',
        email: 'existing@example.com',
        password: 'admin123'
      };

      adminRepo.findByEmail.mockResolvedValue({
        data: { id: 'existing-admin' }
      });

      await expect(adminService.signup(adminData)).rejects.toThrow('Admin already exists');
    });
  });

  describe('Admin Service - login', () => {
    test('should login admin successfully with access granted', async () => {
      const email = 'admin@example.com';
      const password = 'admin123';

      const hashedPassword = await bcrypt.hash('admin123', 10);
      const mockAdmin = {
        id: 'admin-123',
        email: email,
        password: hashedPassword,
        access: true
      };

      adminRepo.findByEmail.mockResolvedValue({ data: mockAdmin, error: null });

      const result = await adminService.login(email, password);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('admin');
    });

    test('should return error if admin access not granted', async () => {
      const email = 'pending@example.com';
      const password = 'admin123';

      const hashedPassword = await bcrypt.hash('admin123', 10);
      const mockAdmin = {
        id: 'admin-123',
        email: email,
        password: hashedPassword,
        access: false
      };

      adminRepo.findByEmail.mockResolvedValue({ data: mockAdmin, error: null });

      await expect(adminService.login(email, password))
        .rejects.toThrow('Admin access not granted yet !');
    });
  });
});
