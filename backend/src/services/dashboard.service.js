// Author: Sourav Kumar Das
const dashboardRepo = require("../repositories/dashboard.repo");
const courseRepo = require("../repositories/course.repo");

exports.getUserDashboard = async (userId) => {
  // Enrolled courses
  const enrolledCourses = await dashboardRepo.getUserEnrolledCourses(userId);
  const enrolledCoursesCount = enrolledCourses.length;
  const courseIds = enrolledCourses.map(e => e.course_id).filter(Boolean);

  // Single batch fetch — replaces N+1 loop
  const { modules: allModules, progress: allProgress } = courseIds.length > 0
    ? await dashboardRepo.getModuleProgressByCourseIds(userId, courseIds)
    : { modules: [], progress: [] };

  // Overall stats
  const overallProgress = allProgress.length === 0 ? 0
    : Math.round(allProgress.reduce((a, b) => a + b.progress, 0) / allProgress.length);

  const totalTimeSpent = allProgress.reduce((a, b) => a + (b.time_spent || 0), 0);

  // Per-course breakdown
  let completedCoursesCount = 0;
  let coursesInProgress = 0;
  const courseProgressData = [];

  for (const enrollment of enrolledCourses) {
    const courseId = enrollment.course_id;
    const courseTitle = enrollment.courses?.title || "Unknown";
    if (!courseId) continue;

    const courseModules = allModules.filter(m => m.course_id === courseId);
    if (courseModules.length === 0) continue;

    const courseModuleIds = courseModules.map(m => m.id);
    const courseProgress = allProgress.filter(p => courseModuleIds.includes(p.module_id));

    const avgProgress = Math.round(
      courseProgress.reduce((sum, p) => sum + p.progress, 0) / courseModules.length
    );

    const allCompleted = courseProgress.length === courseModuleIds.length
      && courseProgress.every(p => p.progress === 100);
    const hasProgress = courseProgress.some(p => p.progress > 0);

    if (allCompleted) completedCoursesCount++;
    else if (hasProgress) coursesInProgress++;

    courseProgressData.push({
      title: courseTitle.length > 28 ? courseTitle.slice(0, 28) + "…" : courseTitle,
      progress: avgProgress
    });
  }

  courseProgressData.sort((a, b) => b.progress - a.progress);

  // Module stats
  const moduleStats = {
    total: allModules.length,
    completed: allProgress.filter(p => p.progress === 100).length
  };

  // Weekly activity — group time spent by day
  const weeklyActivityRaw = await dashboardRepo.getWeeklyActivity(userId);
  const activityByDay = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short" });
    activityByDay[key] = 0;
  }
  weeklyActivityRaw.forEach(entry => {
    const key = new Date(entry.updated_at).toLocaleDateString("en-US", { weekday: "short" });
    if (Object.prototype.hasOwnProperty.call(activityByDay, key)) {
      activityByDay[key] += entry.time_spent || 0;
    }
  });
  const weeklyActivity = Object.entries(activityByDay).map(([day, minutes]) => ({ day, minutes }));

  // Recent activity
  const recentActivity = await dashboardRepo.getRecentActivity(userId);

  // Last active course
  const lastActiveCourse = await dashboardRepo.getLastActiveCourse(userId);

  return {
    overallProgress,
    totalTimeSpent,
    enrolledCoursesCount,
    completedCoursesCount,
    coursesInProgress,
    lastActiveCourse: lastActiveCourse || null,
    moduleStats,
    courseProgress: courseProgressData,
    weeklyActivity,
    recentActivity
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
  const averageLearningTimePerUser = usersWithActivity > 0
    ? Math.round(totalLearningTime / usersWithActivity)
    : 0;

  // Admin Statistics
  const totalAdmins = await dashboardRepo.getTotalAdmins();
  const pendingAdminApprovals = await dashboardRepo.getPendingAdminApprovals();

  // Extended Statistics
  const top5Courses = await dashboardRepo.getTop5PopularCourses();
  const usersWithNoEnrollments = await dashboardRepo.getUsersWithNoEnrollmentsCount();
  const coursesWithNoEnrollments = await dashboardRepo.getCoursesWithNoEnrollmentsCount();
  const topActiveUsers = await dashboardRepo.getTopActiveUsers();
  const progressDistribution = await dashboardRepo.getProgressDistribution();

  // Recent enrollments — last 7 days grouped by date
  const recentEnrollmentsRaw = await dashboardRepo.getRecentEnrollmentsLast7Days();
  const enrollmentsByDay = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    enrollmentsByDay[key] = 0;
  }
  recentEnrollmentsRaw.forEach(e => {
    const d = new Date(e.enrolled_at);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (Object.prototype.hasOwnProperty.call(enrollmentsByDay, key)) {
      enrollmentsByDay[key]++;
    }
  });
  const recentEnrollments = Object.entries(enrollmentsByDay).map(([day, count]) => ({ day, count }));

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      newThisMonth: newUsersThisMonth,
      withNoEnrollments: usersWithNoEnrollments
    },
    courses: {
      total: totalCourses,
      totalModules: totalModules,
      averageModulesPerCourse: averageModulesPerCourse,
      withNoEnrollments: coursesWithNoEnrollments
    },
    enrollments: {
      total: totalEnrollments,
      active: activeEnrollments,
      averagePerCourse: averageEnrollmentsPerCourse
    },
    mostPopularCourse: mostPopularCourse,
    top5Courses: top5Courses,
    recentEnrollments: recentEnrollments,
    engagement: {
      totalLearningTime: totalLearningTime,
      averageProgress: averageProgress,
      usersWithActivity: usersWithActivity,
      averageLearningTimePerUser: averageLearningTimePerUser
    },
    topActiveUsers: topActiveUsers,
    progressDistribution: progressDistribution,
    admins: {
      total: totalAdmins,
      pendingApprovals: pendingAdminApprovals
    }
  };
};
