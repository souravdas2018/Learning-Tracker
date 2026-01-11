// Jest setup file
// Set test timeout
jest.setTimeout(30000);

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.NODE_ENV = 'test';
