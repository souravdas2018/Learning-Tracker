const courseService = require('../../../backend/src/services/course.service');
const courseRepo = require('../../../backend/src/repositories/course.repo');

// Mock repositories
jest.mock('../../../backend/src/repositories/course.repo');

// Mock Supabase config
jest.mock('../../../backend/src/config/supabase', () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}));

describe('Course API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Course Service - getAllCourses', () => {
    test('should get all courses with enrollment counts', async () => {
      const mockCourses = [
        { id: 'course-1', title: 'Course 1', description: 'Description 1' },
        { id: 'course-2', title: 'Course 2', description: 'Description 2' }
      ];

      courseRepo.getAllCoursesWithModules.mockResolvedValue(mockCourses);
      courseRepo.getEnrollmentCounts.mockResolvedValue({ 'course-1': 5, 'course-2': 3 });

      const result = await courseService.getAllCourses();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('enrollmentCount');
      }
    });
  });

  describe('Course Service - createCourse', () => {
    test('should create a new course', async () => {
      const courseData = {
        title: 'New Course',
        description: 'Course Description',
        fees: '100'
      };

      const mockCourse = {
        data: {
          id: 'course-123',
          ...courseData
        },
        error: null
      };

      courseRepo.createCourse.mockResolvedValue(mockCourse);

      const adminId = 'admin-123';
      const result = await courseService.createCourse(courseData, adminId);
      
      expect(courseRepo.createCourse).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Course Service - updateCourse', () => {
    test('should update a course', async () => {
      const courseId = 'course-123';
      const updateData = {
        title: 'Updated Course Title'
      };

      courseRepo.updateCourse.mockResolvedValue({
        error: null
      });

      await courseService.updateCourse(courseId, updateData);
      expect(courseRepo.updateCourse).toHaveBeenCalledWith(courseId, updateData);
    });
  });

  describe('Course Service - deleteCourse', () => {
    test('should delete a course', async () => {
      const courseId = 'course-123';

      courseRepo.deleteCourse.mockResolvedValue({
        error: null
      });

      await courseService.deleteCourse(courseId);
      expect(courseRepo.deleteCourse).toHaveBeenCalledWith(courseId);
    });
  });

  describe('Course Service - createModule', () => {
    test('should create a module for a course', async () => {
      const courseId = 'course-123';
      const moduleData = {
        title: 'New Module'
      };
      const adminId = 'admin-123';

      const mockModule = {
        data: {
          id: 'module-123',
          course_id: courseId,
          ...moduleData
        },
        error: null
      };

      courseRepo.createModule.mockResolvedValue(mockModule);

      const result = await courseService.createModule(courseId, moduleData, adminId);
      expect(courseRepo.createModule).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Course Service - getModulesByCourse', () => {
    test('should get modules for a course', async () => {
      const courseId = 'course-123';
      const mockModules = [
        { id: 'module-1', title: 'Module 1', course_id: courseId },
        { id: 'module-2', title: 'Module 2', course_id: courseId }
      ];

      courseRepo.getModulesByCourse.mockResolvedValue({
        data: mockModules,
        error: null
      });

      const result = await courseService.getModulesByCourse(courseId);
      expect(courseRepo.getModulesByCourse).toHaveBeenCalledWith(courseId);
      expect(result).toBeDefined();
    });
  });
});
