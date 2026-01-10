const supabase = require("../config/supabase");

exports.getProgress = async (userId) => {
  const { data } = await supabase
    .from("user_module_progress")
    .select("progress, time_spent")
    .eq("user_id", userId);

  return data || [];
};
