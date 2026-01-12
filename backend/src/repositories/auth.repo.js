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
  // fetch login time
  const { data: user } = await supabase
    .from("users")
    .select("login_at")
    .eq("id", id)
    .single();

  if (!user || !user.login_at) {
    throw new Error("User is not logged in");
  }

  const logoutTime = new Date();
  const loginTime = new Date(user.login_at);

  const durationMs = logoutTime - loginTime;

  // convert to hh:mm:ss
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  const durationHHMMSS = `${hours}:${minutes}:${seconds}`;

  // format date YYYY-MM-DD
  const datePart = logoutTime.toISOString().split("T")[0];

  const finalDuration = `${datePart} ${durationHHMMSS}`;

  return supabase
    .from("users")
    .update({
      is_active: false,
      duration: finalDuration,
      login_at: user.login_at
    })
    .eq("id", id);
};

