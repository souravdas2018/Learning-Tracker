const supabase = require("../config/supabase");

exports.findByEmail = async (email) => {
  return supabase
    .from("admin")
    .select("*")
    .eq("email", email)
    .single();
};

exports.findById = async (id) => {
  return supabase
    .from("admin")
    .select("*")
    .eq("id", id)
    .single();
};

exports.createAdmin = async (adminData) => {
  return supabase
    .from("admin")
    .insert(adminData)
    .select()
    .single();
};

exports.updateAdminAccessByEmail = async (email, access) => {
  return supabase
    .from("admin")
    .update({ access })
    .eq("email", email);
};

// Get all admins with access = false
exports.findPendingAdmins = async () => {
  return supabase
    .from("admin")
    .select("*")
    .eq("access", false);
};