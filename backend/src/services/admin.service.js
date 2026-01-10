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

  return newAdmin;
};

exports.login = async (email, password) => {
  const { data: admin, error } = await adminRepo.findAdminByEmail(email);

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

  return { token, admin };
};
