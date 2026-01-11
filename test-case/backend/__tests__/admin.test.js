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
// Test removed per request — keeping only utils.test.js and course.test.js
        last_name: 'User',
