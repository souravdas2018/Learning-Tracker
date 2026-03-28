// Author: Sourav Kumar Das
const bcrypt = require("bcrypt");
const adminRepo = require("../repositories/admin.repo");
const { generateAdminToken } = require("../utils/jwt");

exports.signup = async (data) => {
  const { first_name, last_name, phone, email, password } = data;

  const { data: existingAdmin } = await adminRepo.findByEmail(email);
  if (existingAdmin) throw new Error("Admin already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: newAdmin, error } = await adminRepo.createAdmin({
    first_name,
    last_name,
    phone,
    email,
    password: hashedPassword,
    access: false // default admin access
  });

  if (error) throw new Error(error.message);

  const { password: _, ...safeAdmin } = newAdmin;
  return safeAdmin;
};

exports.login = async (email, password) => {
  const { data: admin, error } = await adminRepo.findByEmail(email);

  if (!admin) {
    throw new Error("Admin not found");
  }

  // 🔒 ACCESS CHECK (IMPORTANT)
  if (admin.access !== true) {
    throw new Error("Admin access not granted yet !");
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateAdminToken(admin);

  const { password: _, ...safeAdmin } = admin;
  return { token, admin: safeAdmin };
};

// 🔹 Logout function
exports.logout = async (adminId) => {
  // Option 1: If you store active sessions/tokens in DB, you can remove/invalidate them here
  // For example:
  // await adminRepo.invalidateToken(adminId);

  // Option 2: If no session storage, just log the action
  console.log(`Admin with ID ${adminId} has logged out`);

  return true;
};

// Fetch all admins with access = false
exports.getPendingAdmins = async () => {
  const { data, error } = await adminRepo.findPendingAdmins();
  if (error) throw new Error(error.message);

  return data;
};
