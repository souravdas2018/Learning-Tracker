const dashboardService = require('../../../backend/src/services/dashboard.service');
const dashboardRepo = require('../../../backend/src/repositories/dashboard.repo');
const courseRepo = require('../../../backend/src/repositories/course.repo');

// Mock repositories
jest.mock('../../../backend/src/repositories/dashboard.repo');
jest.mock('../../../backend/src/repositories/course.repo');

// Mock Supabase config
jest.mock('../../../backend/src/config/supabase', () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        in: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      head: true,
      count: 'exact'
    })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
    order: jest.fn(() => ({
      limit: jest.fn(() => ({
        maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    gte: jest.fn(() => ({
      head: true,
      count: 'exact'
    }))
  }))
}));

describe('Dashboard Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserDashboard', () => {
    test('should return user dashboard data', async () => {
      const userId = 'user-123';
      const mockProgress = [
        { progress: 50, time_spent: 30 },
        { progress: 75, time_spent: 45 }
      ];
      const mockEnrolledCourses = [
        { course_id: 'course-1', courses: { id: 'course-1', title: 'Course 1' } }
      ];
      const mockModules = [
        { id: 'module-1', course_id: 'course-1' },
        { id: 'module-2', course_id: 'course-1' }
      ];

      dashboardRepo.getProgress.mockResolvedValue(mockProgress);
      dashboardRepo.getEnrolledCoursesCount.mockResolvedValue(1);
      dashboardRepo.getUserEnrolledCourses.mockResolvedValue(mockEnrolledCourses);
      courseRepo.getModulesByCourse.mockResolvedValue({ data: mockModules });
      dashboardRepo.getModuleProgressForModules.mockResolvedValue([]);
      dashboardRepo.getLastActiveCourse.mockResolvedValue(null);

      const result = await dashboardService.getUserDashboard(userId);

      expect(result).toHaveProperty('overallProgress');
      expect(result).toHaveProperty('totalTimeSpent');
      expect(result).toHaveProperty('enrolledCoursesCount');
      expect(result).toHaveProperty('completedCoursesCount');
      expect(result).toHaveProperty('coursesInProgress');
    });

    test('should handle empty progress data', async () => {
      const userId = 'user-123';

      dashboardRepo.getProgress.mockResolvedValue([]);
      dashboardRepo.getEnrolledCoursesCount.mockResolvedValue(0);
      dashboardRepo.getUserEnrolledCourses.mockResolvedValue([]);
      dashboardRepo.getLastActiveCourse.mockResolvedValue(null);

      const result = await dashboardService.getUserDashboard(userId);

      expect(result.overallProgress).toBe(0);
      expect(result.totalTimeSpent).toBe(0);
      expect(result.enrolledCoursesCount).toBe(0);
    });
  });

  describe('getAdminDashboard', () => {
    test('should return admin dashboard data', async () => {
      const mockStats = {
        totalUsers: 10,
        activeUsers: 8,
        inactiveUsers: 2,
        newUsersThisMonth: 3,
        totalCourses: 5,
        totalModules: 15,
        totalEnrollments: 20,
        activeEnrollments: 18,
        mostPopularCourse: { id: 'course-1', title: 'Popular Course', enrollmentCount: 10 },
        totalLearningTime: 500,
        averageProgress: 65,
        usersWithActivity: 8,
        totalAdmins: 3,
        pendingAdminApprovals: 1
      };

      dashboardRepo.getTotalUsers.mockResolvedValue(mockStats.totalUsers);
      dashboardRepo.getActiveUsers.mockResolvedValue(mockStats.activeUsers);
      dashboardRepo.getInactiveUsers.mockResolvedValue(mockStats.inactiveUsers);
      dashboardRepo.getNewUsersThisMonth.mockResolvedValue(mockStats.newUsersThisMonth);
      dashboardRepo.getTotalCourses.mockResolvedValue(mockStats.totalCourses);
      dashboardRepo.getTotalModules.mockResolvedValue(mockStats.totalModules);
      dashboardRepo.getTotalEnrollments.mockResolvedValue(mockStats.totalEnrollments);
      dashboardRepo.getActiveEnrollments.mockResolvedValue(mockStats.activeEnrollments);
      dashboardRepo.getMostPopularCourse.mockResolvedValue(mockStats.mostPopularCourse);
      dashboardRepo.getTotalLearningTime.mockResolvedValue(mockStats.totalLearningTime);
      dashboardRepo.getAverageProgress.mockResolvedValue(mockStats.averageProgress);
      dashboardRepo.getUsersWithActivity.mockResolvedValue(mockStats.usersWithActivity);
      dashboardRepo.getTotalAdmins.mockResolvedValue(mockStats.totalAdmins);
      dashboardRepo.getPendingAdminApprovals.mockResolvedValue(mockStats.pendingAdminApprovals);

      const result = await dashboardService.getAdminDashboard();

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('courses');
      expect(result).toHaveProperty('enrollments');
      expect(result).toHaveProperty('mostPopularCourse');
      expect(result).toHaveProperty('engagement');
      expect(result).toHaveProperty('admins');
      expect(result.users.total).toBe(mockStats.totalUsers);
      expect(result.courses.total).toBe(mockStats.totalCourses);
    });
  });
});
