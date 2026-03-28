// Author: Sourav Kumar Das
const supabase = require("../config/supabase");

exports.getProgress = async (userId) => {
  const { data } = await supabase
    .from("user_module_progress")
    .select("progress, time_spent")
    .eq("user_id", userId);

  return data || [];
};

// Batch-fetch all modules + user progress for a list of course IDs (fixes N+1)
exports.getModuleProgressByCourseIds = async (userId, courseIds) => {
  if (!courseIds || courseIds.length === 0) return { modules: [], progress: [] };

  const { data: modules, error: modError } = await supabase
    .from("modules")
    .select("id, course_id, title")
    .in("course_id", courseIds);

  if (modError) throw modError;
  if (!modules || modules.length === 0) return { modules: [], progress: [] };

  const moduleIds = modules.map(m => m.id);

  const { data: progress, error: progError } = await supabase
    .from("user_module_progress")
    .select("module_id, progress, time_spent, updated_at")
    .eq("user_id", userId)
    .in("module_id", moduleIds);

  if (progError) throw progError;

  return { modules, progress: progress || [] };
};

// Time spent per day for last 7 days
exports.getWeeklyActivity = async (userId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("user_module_progress")
    .select("time_spent, updated_at")
    .eq("user_id", userId)
    .gte("updated_at", sevenDaysAgo.toISOString());

  if (error) throw error;
  return data || [];
};

// Last 5 module progress updates with module + course titles
exports.getRecentActivity = async (userId) => {
  const { data: progressData, error } = await supabase
    .from("user_module_progress")
    .select("module_id, progress, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  if (!progressData || progressData.length === 0) return [];

  const moduleIds = progressData.map(p => p.module_id);

  const { data: modules, error: modError } = await supabase
    .from("modules")
    .select("id, title, course_id, courses!inner(id, title)")
    .in("id", moduleIds);

  if (modError) throw modError;

  return progressData.map(p => {
    const mod = (modules || []).find(m => m.id === p.module_id);
    return {
      moduleTitle: mod?.title || "Unknown Module",
      courseTitle: mod?.courses?.title || "Unknown Course",
      progress: p.progress,
      updatedAt: p.updated_at
    };
  });
};

// User Dashboard Repository Methods
exports.getEnrolledCoursesCount = async (userId) => {
  const { count } = await supabase
    .from("user_courses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return count || 0;
};

exports.getUserEnrolledCourses = async (userId) => {
  const { data, error } = await supabase
    .from("user_courses")
    .select(`
      course_id,
      courses (
        id,
        title
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;
  return data || [];
};

exports.getModuleProgressForModules = async (userId, moduleIds) => {
  if (!moduleIds || moduleIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from("user_module_progress")
    .select("module_id, progress, updated_at")
    .eq("user_id", userId)
    .in("module_id", moduleIds);

  if (error) throw error;
  return data || [];
};

exports.getLastActiveCourse = async (userId) => {
  const { data, error } = await supabase
    .from("user_module_progress")
    .select("module_id, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: module, error: moduleError } = await supabase
    .from("modules")
    .select(`
      course_id,
      courses!inner (
        id,
        title
      )
    `)
    .eq("id", data.module_id)
    .single();

  if (moduleError || !module || !module.courses) return null;

  return {
    id: module.courses.id,
    title: module.courses.title,
    lastActivity: data.updated_at
  };
};

// Admin Dashboard Repository Methods
exports.getTotalUsers = async () => {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  return count || 0;
};

exports.getActiveUsers = async () => {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return count || 0;
};

exports.getInactiveUsers = async () => {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("is_active", false);

  return count || 0;
};

exports.getNewUsersThisMonth = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", firstDayOfMonth.toISOString());

  return count || 0;
};

exports.getTotalCourses = async () => {
  const { count } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true });

  return count || 0;
};

exports.getTotalModules = async () => {
  const { count } = await supabase
    .from("modules")
    .select("*", { count: "exact", head: true });

  return count || 0;
};

exports.getTotalEnrollments = async () => {
  const { count } = await supabase
    .from("user_courses")
    .select("*", { count: "exact", head: true });

  return count || 0;
};

exports.getActiveEnrollments = async () => {
  const { count } = await supabase
    .from("user_courses")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return count || 0;
};

exports.getMostPopularCourse = async () => {
  const { data, error } = await supabase
    .from("user_courses")
    .select("course_id, courses!inner(id, title)")
    .eq("status", "active");

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const courseCounts = {};
  data.forEach(enrollment => {
    const courseId = enrollment.course_id;
    if (!courseCounts[courseId]) {
      courseCounts[courseId] = {
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        count: 0
      };
    }
    courseCounts[courseId].count++;
  });

  let mostPopular = null;
  let maxCount = 0;
  for (const courseId in courseCounts) {
    if (courseCounts[courseId].count > maxCount) {
      maxCount = courseCounts[courseId].count;
      mostPopular = {
        id: courseCounts[courseId].id,
        title: courseCounts[courseId].title,
        enrollmentCount: maxCount
      };
    }
  }

  return mostPopular;
};

exports.getTotalLearningTime = async () => {
  const { data, error } = await supabase
    .from("user_module_progress")
    .select("time_spent");

  if (error) throw error;

  const totalTime = (data || []).reduce((sum, record) => sum + (record.time_spent || 0), 0);
  return totalTime;
};

exports.getAverageProgress = async () => {
  const { data, error } = await supabase
    .from("user_module_progress")
    .select("progress");

  if (error) throw error;

  if (!data || data.length === 0) return 0;

  const totalProgress = data.reduce((sum, record) => sum + (record.progress || 0), 0);
  return Math.round(totalProgress / data.length);
};

exports.getUsersWithActivity = async () => {
  const { data, error } = await supabase
    .from("user_module_progress")
    .select("user_id");

  if (error) throw error;

  const uniqueUsers = new Set((data || []).map(record => record.user_id));
  return uniqueUsers.size;
};

exports.getTotalAdmins = async () => {
  const { count } = await supabase
    .from("admin")
    .select("*", { count: "exact", head: true });

  return count || 0;
};

exports.getPendingAdminApprovals = async () => {
  const { count } = await supabase
    .from("admin")
    .select("*", { count: "exact", head: true })
    .eq("access", false);

  return count || 0;
};

exports.getTop5PopularCourses = async () => {
  const { data, error } = await supabase
    .from("user_courses")
    .select("course_id, courses!inner(id, title)");

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const courseCounts = {};
  data.forEach(enrollment => {
    const courseId = enrollment.course_id;
    if (!courseCounts[courseId]) {
      courseCounts[courseId] = {
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        enrollmentCount: 0
      };
    }
    courseCounts[courseId].enrollmentCount++;
  });

  return Object.values(courseCounts)
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 5);
};

exports.getUsersWithNoEnrollmentsCount = async () => {
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { data: enrolledData } = await supabase
    .from("user_courses")
    .select("user_id");

  const enrolledUserIds = new Set((enrolledData || []).map(e => e.user_id));
  return (totalUsers || 0) - enrolledUserIds.size;
};

exports.getCoursesWithNoEnrollmentsCount = async () => {
  const { count: totalCourses } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true });

  const { data: enrolledData } = await supabase
    .from("user_courses")
    .select("course_id");

  const enrolledCourseIds = new Set((enrolledData || []).map(e => e.course_id));
  return (totalCourses || 0) - enrolledCourseIds.size;
};

exports.getRecentEnrollmentsLast7Days = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("user_courses")
    .select("enrolled_at")
    .gte("enrolled_at", sevenDaysAgo.toISOString());

  if (error) throw error;
  return data || [];
};

exports.getTopActiveUsers = async () => {
  const { data: progressData, error: progressError } = await supabase
    .from("user_module_progress")
    .select("user_id, time_spent");

  if (progressError) throw progressError;
  if (!progressData || progressData.length === 0) return [];

  const userTimeMap = {};
  progressData.forEach(record => {
    if (!userTimeMap[record.user_id]) userTimeMap[record.user_id] = 0;
    userTimeMap[record.user_id] += record.time_spent || 0;
  });

  const topUserIds = Object.entries(userTimeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId]) => userId);

  if (topUserIds.length === 0) return [];

  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email")
    .in("id", topUserIds);

  if (usersError) throw usersError;

  return topUserIds
    .map(userId => {
      const user = (usersData || []).find(u => u.id === userId);
      if (!user) return null;
      return {
        id: userId,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        timeSpent: userTimeMap[userId]
      };
    })
    .filter(Boolean);
};

exports.getProgressDistribution = async () => {
  const { data, error } = await supabase
    .from("user_module_progress")
    .select("progress");

  if (error) throw error;

  const distribution = { "0-25%": 0, "26-50%": 0, "51-75%": 0, "76-100%": 0 };

  (data || []).forEach(record => {
    const p = record.progress || 0;
    if (p <= 25) distribution["0-25%"]++;
    else if (p <= 50) distribution["26-50%"]++;
    else if (p <= 75) distribution["51-75%"]++;
    else distribution["76-100%"]++;
  });

  return Object.entries(distribution).map(([range, count]) => ({ range, count }));
};