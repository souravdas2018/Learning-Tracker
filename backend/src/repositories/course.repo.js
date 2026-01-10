const supabase = require("../config/supabase");

exports.createCourse = async (data) => {
  return supabase.from("courses").insert(data).select().single();
};

exports.updateCourse = async (id, data) => {
  return supabase.from("courses").update(data).eq("id", id);
};

exports.deleteCourse = async (id) => {
  return supabase.from("courses").delete().eq("id", id);
};

exports.getAllCourses = async () => {
  return supabase.from("courses").select("*");
};

exports.getModulesByCourse = async (courseId) => {
  return supabase.from("modules").select("*").eq("course_id", courseId);
};

exports.createModule = async (data) => {
  return supabase.from("modules").insert(data).select().single();
};

exports.updateModuleProgress = async (data) => {
  return supabase
    .from("user_module_progress")
    .upsert({ ...data, updated_at: new Date() });
};

exports.getAllCoursesWithModules = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      description,
      fees,
      created_at,
      modules (
        id,
        title,
        created_at
      )
    `);

  if (error) throw error;
  return data;
};

exports.getUserCourse = async (userId, courseId) => {
  const { data } = await supabase
    .from("user_courses")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  return data;
};

exports.optForCourse = async (userId, courseId) => {
  return supabase.from("user_courses").insert({
    user_id: userId,
    course_id: courseId
  });
};

exports.initializeModuleProgress = async (userId, modules) => {
  if (!modules.length) return;

  const records = modules.map((m) => ({
    user_id: userId,
    module_id: m.id,
    progress: 0,
    time_spent: 0
  }));

  return supabase.from("user_module_progress").insert(records);
};
