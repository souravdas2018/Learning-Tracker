const supabase = require("../config/supabase");

exports.findUserByEmail = async (email) =>
  supabase.from("users").select("*").eq("email", email).single();

exports.createUser = async (email, password) =>
  supabase.from("users").insert({ email, password });
