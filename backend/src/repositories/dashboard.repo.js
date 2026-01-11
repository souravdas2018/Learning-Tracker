const supabase = require("../config/supabase");

exports.getProgress = async (userId) => {
  const { data } = await supabase
    .from("user_module_progress")
    .select("progress, time_spent")
    .eq("user_id", userId);

  return data || [];
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