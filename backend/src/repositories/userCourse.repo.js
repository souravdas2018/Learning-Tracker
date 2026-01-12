// Author: Sourav Kumar Das
const supabase = require("../config/supabase");

exports.getMyCourses = async (userId) => {
  const { data, error } = await supabase
    .from("user_courses")
    .select(`
      courses (
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
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;

  // flatten structure
  return data.map((row) => row.courses);
};
