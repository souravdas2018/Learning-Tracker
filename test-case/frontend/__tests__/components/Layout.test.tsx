import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../../../../frontend/components/Layout';
import { useAuth } from '../../../../frontend/contexts/AuthContext';

// Mock AuthContext
jest.mock('../../../../frontend/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Layout Component', () => {
  const mockLogout = jest.fn();
  const mockAdminLogout = jest.fn();
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
      adminLogout: mockAdminLogout,
      user: mockUser,
    });
  });

  // Test removed per request — keeping only utils.test.js and course.test.js
});
