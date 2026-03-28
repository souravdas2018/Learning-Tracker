// Author: Sourav Kumar Das
const supabase = require("../config/supabase");

exports.findUserByEmail = async (email) => {
  return supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
};

exports.createUser = async (userData) => {
  return supabase
    .from("users")
    .insert(userData)
    .select()
    .single();   // returns ONE row instead of array
};

exports.findUserById = async (id) => {
  return supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
};

exports.deactivateUser = async (id) => {
  return supabase
    .from("users")
    .update({ is_active: false })
    .eq("id", id);
};


exports.activateUser = async (id) => {
  return supabase
    .from("users")
    .update({
      is_active: true,
      login_at: new Date()
    })
    .eq("id", id);
};

exports.logoutUser = async (id) => {
  return supabase
    .from("users")
    .update({
      is_active: false,
      login_at: null,
      duration: null
    })
    .eq("id", id);
};

