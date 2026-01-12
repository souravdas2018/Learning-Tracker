// Author: Sourav Kumar Das
const dashboardRepo = require("../repositories/dashboard.repo");
const courseRepo = require("../repositories/course.repo");

exports.getUserDashboard = async (userId) => {
  // Get basic progress data
  const progress = await dashboardRepo.getProgress(userId);

  // Calculate overall progress
  const overallProgress =
    progress.length === 0
      ? 0
      : Math.round(
          progress.reduce((a, b) => a + b.progress, 0) / progress.length
        );

  // Calculate total time spent
  const totalTimeSpent = progress.reduce(
    (a, b) => a + (b.time_spent || 0),
    0
  );

  // Get enrolled courses count
  const enrolledCoursesCount = await dashboardRepo.getEnrolledCoursesCount(userId);

  // Get enrolled courses with their modules to calculate completion
  const enrolledCourses = await dashboardRepo.getUserEnrolledCourses(userId);
  
  let completedCoursesCount = 0;
  let coursesInProgress = 0;

  // For each enrolled course, check if it's completed
  for (const enrollment of enrolledCourses) {
    const courseId = enrollment.course_id || enrollment.courses?.id;
    if (!courseId) continue;

    // Get all modules for this course
    const { data: modules } = await courseRepo.getModulesByCourse(courseId);
    if (!modules || modules.length === 0) continue;

    // Get progress for all modules of this course
    const moduleIds = modules.map(m => m.id);
    const moduleProgress = await dashboardRepo.getModuleProgressForModules(userId, moduleIds);

    // Check if all modules have progress = 100
    const allModulesHaveProgress = moduleProgress.length === moduleIds.length;
    const allCompleted = allModulesHaveProgress && 
      moduleProgress.every(mp => mp.progress === 100);

    if (allCompleted) {
      completedCoursesCount++;
    } else if (moduleProgress.length > 0 && moduleProgress.some(mp => mp.progress > 0)) {
      // Course has some progress but not all modules are 100%
      coursesInProgress++;
    }
  }

  // Get last active course
  const lastActiveCourse = await dashboardRepo.getLastActiveCourse(userId);

  return {
    overallProgress,
    totalTimeSpent,
    enrolledCoursesCount,
    completedCoursesCount,
    coursesInProgress,
    lastActiveCourse: lastActiveCourse || null
  };
};

exports.getAdminDashboard = async () => {
  // User Statistics
  const totalUsers = await dashboardRepo.getTotalUsers();
  const activeUsers = await dashboardRepo.getActiveUsers();
  const inactiveUsers = await dashboardRepo.getInactiveUsers();
  const newUsersThisMonth = await dashboardRepo.getNewUsersThisMonth();

  // Course Statistics
  const totalCourses = await dashboardRepo.getTotalCourses();
  const totalModules = await dashboardRepo.getTotalModules();
  const averageModulesPerCourse = totalCourses > 0 
    ? Math.round((totalModules / totalCourses) * 10) / 10 
    : 0;

  // Enrollment Statistics
  const totalEnrollments = await dashboardRepo.getTotalEnrollments();
  const activeEnrollments = await dashboardRepo.getActiveEnrollments();
  const averageEnrollmentsPerCourse = totalCourses > 0
    ? Math.round((totalEnrollments / totalCourses) * 10) / 10
    : 0;
  const mostPopularCourse = await dashboardRepo.getMostPopularCourse();

  // Engagement Statistics
  const totalLearningTime = await dashboardRepo.getTotalLearningTime();
  const averageProgress = await dashboardRepo.getAverageProgress();
  const usersWithActivity = await dashboardRepo.getUsersWithActivity();

  // Admin Statistics
  const totalAdmins = await dashboardRepo.getTotalAdmins();
  const pendingAdminApprovals = await dashboardRepo.getPendingAdminApprovals();

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      newThisMonth: newUsersThisMonth
    },
    courses: {
      total: totalCourses,
      totalModules: totalModules,
      averageModulesPerCourse: averageModulesPerCourse
    },
    enrollments: {
      total: totalEnrollments,
      active: activeEnrollments,
      averagePerCourse: averageEnrollmentsPerCourse
    },
    mostPopularCourse: mostPopularCourse,
    engagement: {
      totalLearningTime: totalLearningTime,
      averageProgress: averageProgress,
      usersWithActivity: usersWithActivity
    },
    admins: {
      total: totalAdmins,
      pendingApprovals: pendingAdminApprovals
    }
  };
};
