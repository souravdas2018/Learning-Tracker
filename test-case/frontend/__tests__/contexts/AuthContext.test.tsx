import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../../frontend/contexts/AuthContext';
import { authAPI } from '../../../../frontend/services/api';

// Mock API
jest.mock('../../../../frontend/services/api', () => ({
  authAPI: {
    signup: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
  adminAuthAPI: {
    signup: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should provide auth context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('token');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('signup');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isAdmin');
  });

  test('should handle user signup', async () => {
    const signupData = {
      first_name: 'John',
      last_name: 'Doe',
      phone: '1234567890',
      email: 'john@example.com',
      password: 'password123',
    };

    (authAPI.signup as jest.Mock).mockResolvedValue({});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup(signupData);
    });

    expect(authAPI.signup).toHaveBeenCalledWith(signupData);
  });

  test('should handle user login', async () => {
    const loginData = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockResponse = {
      data: {
        token: 'mock-token',
        id: 'user-123',
      },
    };

    (authAPI.login as jest.Mock).mockResolvedValue(mockResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login(loginData.email, loginData.password);
    });

    expect(authAPI.login).toHaveBeenCalledWith(loginData);
    expect(result.current.token).toBe('mock-token');
  });
});
