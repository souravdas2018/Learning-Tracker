const jwt = require('jsonwebtoken');
const { generateUserToken, generateAdminToken } = require('../../../backend/src/utils/jwt');

// Mock JWT_SECRET
process.env.JWT_SECRET = 'test-secret-key';

describe('JWT Utility Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'user@example.com'
  };

  const mockAdmin = {
    id: 'admin-123',
    email: 'admin@example.com'
  };

  describe('generateUserToken', () => {
    test('should generate a valid JWT token for user', () => {
      const token = generateUserToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe('user');
    });

    test('should include user id, email, and role in token', () => {
      const token = generateUserToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
    });
  });

  describe('generateAdminToken', () => {
    test('should generate a valid JWT token for admin', () => {
      const token = generateAdminToken(mockAdmin);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(mockAdmin.id);
      expect(decoded.email).toBe(mockAdmin.email);
      expect(decoded.role).toBe('admin');
    });

    test('should include admin id, email, and role in token', () => {
      const token = generateAdminToken(mockAdmin);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
      expect(decoded.role).toBe('admin');
    });
  });
});
