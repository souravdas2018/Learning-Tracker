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

  test('should render layout with user email', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Learning Tracker')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('should render admin badge when isAdmin is true', () => {
    render(
      <Layout isAdmin>
        <div>Admin Content</div>
      </Layout>
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('should not render admin badge when isAdmin is false', () => {
    render(
      <Layout>
        <div>User Content</div>
      </Layout>
    );

    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  test('should render logout button', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
